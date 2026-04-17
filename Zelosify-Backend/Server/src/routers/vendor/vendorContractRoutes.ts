// [AI MODULE]
// [SAFE]
// [NO NEW DEPENDENCIES]

import express, { RequestHandler } from "express";
import { getVendorOpenings, getVendorOpeningById, presignProfileUpload, uploadProfile } from "../../controllers/vendor/vendorContractController.js";
import { authenticateUser } from "../../middlewares/auth/authenticateMiddleware.js";
import { authorizeRole } from "../../middlewares/auth/authorizeMiddleware.js";

const router = express.Router();

// [RBAC]
router.use(authenticateUser as RequestHandler);
router.use(authorizeRole("IT_VENDOR") as RequestHandler);

router.get("/", getVendorOpenings as RequestHandler);
router.get("/:id", getVendorOpeningById as RequestHandler);
router.post("/:id/presign", presignProfileUpload as RequestHandler);
router.post("/:id/upload", uploadProfile as RequestHandler);

export default router;
