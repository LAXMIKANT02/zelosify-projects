// [AI MODULE]
// [SAFE]
// [NO NEW DEPENDENCIES]

import express, { RequestHandler } from "express";
import { getHiringManagerOpenings, getOpeningProfiles, shortlistProfile, rejectProfile } from "../../controllers/hiring/hiringContractController.js";
import { authenticateUser } from "../../middlewares/auth/authenticateMiddleware.js";
import { authorizeRole } from "../../middlewares/auth/authorizeMiddleware.js";

const router = express.Router();

// [RBAC]
router.use(authenticateUser as RequestHandler);
router.use(authorizeRole("HIRING_MANAGER") as RequestHandler);

router.get("/openings", getHiringManagerOpenings as RequestHandler);
router.get("/openings/:id/profiles", getOpeningProfiles as RequestHandler);
router.patch("/profiles/:id/shortlist", shortlistProfile as RequestHandler);
router.patch("/profiles/:id/reject", rejectProfile as RequestHandler);

export default router;
