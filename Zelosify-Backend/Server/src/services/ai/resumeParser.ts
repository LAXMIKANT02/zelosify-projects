// [AI MODULE]
// [SAFE]
// [NO NEW DEPENDENCIES]

import pdfExtraction from "pdf-extraction";
import { AwsStorageService } from "../storage/aws/awsStorageService.js";

export class ResumeParser {
  static async parse(s3Key: string): Promise<{
    experienceYears: number;
    skills: string[];
    location: string;
    keywords: string[];
  }> {
    // [FINAL FIX - INPUT VALIDATION]
    if (!s3Key || typeof s3Key !== "string") {
      throw new Error("Invalid S3 key provided");
    }

    const storageService = new AwsStorageService();
    
    // Using existing getObjectStream method and safe buffer consumer
    const stream = await storageService.getObjectStream(s3Key);
    const { buffer } = await import("stream/consumers");
    const fileBuffer = await buffer(stream);
    
    if (!fileBuffer) throw new Error("Empty buffer returned from storage");

    let rawText = "";

    // Parse based on file type
    if (s3Key.endsWith(".pdf")) {
      const data = await pdfExtraction(fileBuffer);
      rawText = data.text;
    } else if (s3Key.endsWith(".pptx")) {
      // Fallback parsing using buffer/text extraction
      rawText = fileBuffer.toString("utf8");
      const extractedStrings = rawText.match(/[a-zA-Z0-9\s.,;:'"?!-]{4,}/g);
      rawText = extractedStrings ? extractedStrings.join(" ") : "";
    } else {
      rawText = fileBuffer.toString("utf8");
    }

    // Heuristic Extraction (NO LLM)
    const normalizedText = rawText.toLowerCase().replace(/\s+/g, ' ');
    const expMatch = normalizedText.match(/(\d+)\+?\s*years?(?:\s*of)?\s*experience/);
    const experienceYears = expMatch ? parseInt(expMatch[1], 10) : 0;
    const commonSkills = ["javascript", "typescript", "python", "java", "react", "node", "sql", "aws", "docker"];
    const foundSkills = commonSkills.filter(skill => normalizedText.includes(skill));
    const locationMatch = normalizedText.match(/(?:location|address)[\s:]*([A-Za-z\s,]+)(?:|\\n)/i);
    const location = locationMatch ? locationMatch[1].trim() : "Unknown";
    const keywords = normalizedText.split(' ').filter(word => word.length > 5).slice(0, 10);

    return {
      experienceYears,
      skills: foundSkills,
      location,
      keywords
    };
  }
}
