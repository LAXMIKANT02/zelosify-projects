import express from "express";
import vendorRequestRoutes from "./vendorRequestRoutes.js";
import vendorContractRoutes from "./vendorContractRoutes.js";

const router = express.Router();

/**
 * @route /vendor/requests
 */
router.use("/requests", vendorRequestRoutes);

// [MODIFY - SAFE INTEGRATION]
// Reason: Mounting new contract management routes without altering existing logic
router.use("/contract", vendorContractRoutes);

export default router;
