// [AI MODULE]
// [SAFE]
// [NO NEW DEPENDENCIES]

import { LLMCore } from "./llmCore.js";
import { ToolRegistry, validationSchemas } from "./toolRegistry.js";
import { Validator } from "./validator.js";
import { SecurityLayer } from "./securityLayer.js";
import { ScoringEngine } from "./scoringEngine.js";
import { ResumeParser } from "./resumeParser.js";

export class AgentOrchestrator {
  static async runRecommendationPipeline(s3Key: string, jobDescription: string) {
    const startTime = Date.now();
    let parsingTime = 0;
    let scoringTime = 0;
    
    console.log(JSON.stringify({ event: "AGENT_START", startTime }));

    try {
      // 1. Parse resume using ResumeParser (S3-based)
      const parseStart = Date.now();
      const parsedResume = await ResumeParser.parse(s3Key);
      parsingTime = Date.now() - parseStart;

      // 2. Sanitize input
      const systemPrompt = `You are an AI recruitment agent. Your task is to extract features from the candidate's resume and normalize their skills against the job description. Use the provided tools.`;
      
      const untrustedInput = `
Job Description:
${jobDescription}

Resume Data:
${JSON.stringify(parsedResume, null, 2)}
      `;

      const safeInput = SecurityLayer.prepareSafePrompt(systemPrompt, untrustedInput);
      
      // PROMPT STRUCTURE (MANDATORY)
      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: safeInput }
      ];

      const tools = [ToolRegistry.feature_extraction_tool, ToolRegistry.skill_normalization_tool];
      
      // 3. Use LLM with tool-calling
      const response = await LLMCore.callWithTools(messages, tools);

      // TOOL CALL SAFETY
      if (response.type !== "tool_calls" || !response.calls || response.calls.length === 0) {
        throw new Error("No valid tool calls returned by LLM");
      }

      let extractedData: any = null;
      let normalizationData: any = null;

      // 4. Validate outputs (AJV)
      for (const call of response.calls) {
        if (call.function.name === "extract_features") {
          extractedData = JSON.parse(call.function.arguments);
          const val = Validator.validate(validationSchemas.extract_features, extractedData);
          if (!val.isValid) throw new Error(`extract_features validation failed: ${val.errors}`);
        }
        if (call.function.name === "normalize_skills") {
          normalizationData = JSON.parse(call.function.arguments);
          const val = Validator.validate(validationSchemas.normalize_skills, normalizationData);
          if (!val.isValid) throw new Error(`normalize_skills validation failed: ${val.errors}`);
        }
      }

      if (!normalizationData) {
        throw new Error("Agent failed to return normalized skill data via tool call");
      }

      // 5. Call ScoringEngine (NOT LLM)
      const scoreStart = Date.now();
      const scoreResult = ScoringEngine.calculateScore(
        normalizationData.skillMatchScore,
        normalizationData.experienceMatchScore,
        normalizationData.locationMatchScore
      );
      
      const decision = ScoringEngine.getDecision(scoreResult.finalScore);
      scoringTime = Date.now() - scoreStart;

      const latencyMs = Date.now() - startTime;

      // LOGGING
      console.log(JSON.stringify({
        event: "AGENT_SUCCESS",
        startTime,
        parsingTime,
        scoringTime,
        latencyMs,
        finalScore: scoreResult.finalScore
      }));

      // 6. Return structured result
      return {
        recommended: decision.decision === "Recommended",
        score: scoreResult.finalScore,
        confidence: decision.confidence,
        reason: normalizationData.reasoning || "Derived from skill and experience matching",
        latencyMs
      };
    } catch (error: any) {
      console.error(JSON.stringify({
        event: "AGENT_ERROR",
        error: error.message,
        stack: error.stack,
        startTime
      }));
      throw error;
    }
  }
}
