// [AI MODULE]
// [SAFE]
// [NO NEW DEPENDENCIES]

import prisma from "../../config/prisma/prisma.js";
import { AgentOrchestrator } from "./agentOrchestrator.js";

export const processRecommendationAsync = async (profileId: string) => {
  try {
    const profile = await prisma.hiringProfile.findUnique({
      where: { id: profileId },
      include: { opening: true }
    });
    
    if (!profile) throw new Error("Profile not found");
    if (profile.recommended !== null) return; // Idempotent check

    const jobDescription = `
      Title: ${profile.opening.title}
      Description: ${profile.opening.description}
      Location: ${profile.opening.location}
      Experience: ${profile.opening.experienceMin} - ${profile.opening.experienceMax} years
    `;

    // AI must run in background (fire-and-forget)
    const result = await AgentOrchestrator.runRecommendationPipeline(profile.s3Key, jobDescription);

    await prisma.hiringProfile.update({
      where: { id: profileId },
      data: {
        recommended: result.recommended,
        recommendationScore: result.score,
        recommendationConfidence: result.confidence,
        recommendationReason: result.reason,
        recommendationLatencyMs: result.latencyMs
      }
    });

  } catch (error) {
    console.error(`Error processing recommendation for profile ${profileId}:`, error);
  }
};
