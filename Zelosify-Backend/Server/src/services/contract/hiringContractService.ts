// [AI MODULE]
// [SAFE]
// [NO NEW DEPENDENCIES]

import prisma from "../../config/prisma/prisma.js";

export class HiringContractService {
  async getOpenings(userId: string) {
    return await prisma.opening.findMany({
      where: { hiringManagerId: userId }
    });
  }

  async getOpeningProfiles(userId: string, openingId: string) {
    const opening = await prisma.opening.findUnique({
      where: { id: openingId }
    });

    if (!opening) throw new Error("Opening not found");
    if (opening.hiringManagerId !== userId) throw new Error("Access denied: You do not own this opening");

    return await prisma.hiringProfile.findMany({
      where: { openingId },
      select: {
        id: true,
        s3Key: true,
        status: true,
        recommended: true,
        recommendationScore: true,
        recommendationConfidence: true,
        recommendationReason: true,
        recommendationLatencyMs: true,
        createdAt: true,
        uploader: { select: { firstName: true, lastName: true, email: true } }
      }
    });
  }

  async updateProfileStatus(userId: string, profileId: string, status: "SHORTLISTED" | "REJECTED") {
    const profile = await prisma.hiringProfile.findUnique({
      where: { id: profileId },
      include: { opening: true }
    });

    if (!profile) throw new Error("Profile not found");
    if (profile.opening.hiringManagerId !== userId) {
      throw new Error("Access denied: You do not own the opening for this profile");
    }

    return await prisma.hiringProfile.update({
      where: { id: profileId },
      data: { status }
    });
  }
}
