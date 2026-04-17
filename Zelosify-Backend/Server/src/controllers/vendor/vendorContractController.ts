// [AI MODULE]
// [SAFE]
// [NO NEW DEPENDENCIES]

import type { Request, Response } from "express";
import { VendorContractService } from "../../services/contract/vendorContractService.js";

const vendorService = new VendorContractService();

export const getVendorOpenings = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenant?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "No tenant context found" });

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const data = await vendorService.getOpenings(tenantId, page, limit);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getVendorOpeningById = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenant?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "No tenant context found" });

    const openingId = req.params.id;
    const data = await vendorService.getOpeningById(tenantId, openingId);
    if (!data) return res.status(404).json({ message: "Opening not found" });

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const presignProfileUpload = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenant?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "No tenant context found" });

    const openingId = req.params.id;
    const { filename } = req.body;
    
    if (!filename) return res.status(400).json({ message: "Filename is required" });

    const presignedData = await vendorService.generatePresignedUrl(tenantId, openingId, filename);
    res.json(presignedData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadProfile = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenant?.tenantId;
    const userId = req.user?.id;
    if (!tenantId || !userId) return res.status(403).json({ message: "Unauthorized" });

    const openingId = req.params.id;
    const { s3Key } = req.body;

    if (!s3Key) return res.status(400).json({ message: "s3Key is required" });

    const profile = await vendorService.uploadProfileAndTriggerAI(tenantId, openingId, userId, s3Key);

    res.status(202).json({
      message: "Profile uploaded successfully. AI recommendation is processing.",
      profileId: profile.id
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
