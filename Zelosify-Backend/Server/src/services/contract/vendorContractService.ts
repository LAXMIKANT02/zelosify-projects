// [AI MODULE]
// [SAFE]
// [NO NEW DEPENDENCIES]
// [TENANT FILTER]

import prisma from "../../config/prisma/prisma.js";
import { FilePresignService } from "../upload/filePresignService.js";
import { AwsStorageService } from "../storage/aws/awsStorageService.js";
import { processRecommendationAsync } from "../ai/recommendationService.js";

export class VendorContractService {
  private presignService: FilePresignService;

  constructor() {
    this.presignService = new FilePresignService(new AwsStorageService());
  }

  async getOpenings(tenantId: string, page: number, limit: number) {
    const openings = await prisma.opening.findMany({
      where: { tenantId },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        hiringManager: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    });
    
    const total = await prisma.opening.count({ where: { tenantId } });
    return { openings, total, page, limit };
  }

  async getOpeningById(tenantId: string, openingId: string) {
    return await prisma.opening.findFirst({
      where: { id: openingId, tenantId },
      include: {
        hiringManager: { select: { firstName: true, lastName: true } },
        profiles: {
          select: {
            id: true,
            status: true,
            s3Key: true,
            createdAt: true
          }
        }
      }
    });
  }

  async generatePresignedUrl(tenantId: string, openingId: string, filename: string) {
    return await this.presignService.generateUploadUrl({
      filename,
      contentType: "application/pdf",
      s3KeyConfig: {
        pathSegments: [tenantId, openingId],
        includeTimestamp: true,
        filenamePrefix: ""
      }
    });
  }

  async uploadProfileAndTriggerAI(tenantId: string, openingId: string, userId: string, s3Key: string) {
    const opening = await prisma.opening.findFirst({
      where: { id: openingId, tenantId }
    });
    if (!opening) throw new Error("Opening not found");

    const profile = await prisma.$transaction(async (tx) => {
      const newProfile = await tx.hiringProfile.create({
        data: {
          openingId,
          s3Key,
          uploadedBy: userId,
          status: "PENDING"
        }
      });
      return newProfile;
    });

    processRecommendationAsync(profile.id).catch(err => {
      console.error(`Background AI processing failed for profile ${profile.id}:`, err);
    });

    return profile;
  }
}
