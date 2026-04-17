// [AI MODULE]
// [SAFE]
// [NO NEW DEPENDENCIES]

import type { Request, Response } from "express";
import { HiringContractService } from "../../services/contract/hiringContractService.js";

const hiringService = new HiringContractService();

export const getHiringManagerOpenings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(403).json({ message: "Unauthorized" });

    const data = await hiringService.getOpenings(userId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOpeningProfiles = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const openingId = req.params.id;
    if (!userId) return res.status(403).json({ message: "Unauthorized" });

    const data = await hiringService.getOpeningProfiles(userId, openingId);
    res.json(data);
  } catch (error: any) {
    if (error.message.includes("Access denied")) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

export const shortlistProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const profileId = req.params.id;
    if (!userId) return res.status(403).json({ message: "Unauthorized" });

    const profile = await hiringService.updateProfileStatus(userId, profileId, "SHORTLISTED");
    res.json({ message: "Profile shortlisted", profile });
  } catch (error: any) {
    if (error.message.includes("Access denied")) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

export const rejectProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const profileId = req.params.id;
    if (!userId) return res.status(403).json({ message: "Unauthorized" });

    const profile = await hiringService.updateProfileStatus(userId, profileId, "REJECTED");
    res.json({ message: "Profile rejected", profile });
  } catch (error: any) {
    if (error.message.includes("Access denied")) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};
