// Core Express and Node.js libraries
import express from "express";
import dotenv from "dotenv";

// Authentication and session management
import { setupKeycloakConfig } from "./config/keycloak/keycloak.js";
import session from "express-session";

// Security and middleware libraries
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

// Database connection utilities
import connectPrisma from "./utils/prisma/connectPrisma.js";

// Application route handlers organized by feature domain
import authRoutes from "./routers/auth/authRoute.js";
import awsRouter from "./routers/aws/awsRoute.js";
import vendorRoutes from "./routers/vendor/vendorRoutes.js";
import hiringManagerRoutes from "./routers/hiring/hiringManagerRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

async function startServer() {
  try {
    // -----------------------------
    // KEYCLOAK SETUP (SAFE)
    // -----------------------------
    let keycloak: any = null;
    let memoryStore: any = null;

    try {
      const kc = await setupKeycloakConfig();
      keycloak = kc.keycloak;
      memoryStore = kc.memoryStore;
    } catch (error) {
      console.warn("⚠️ Keycloak not available, continuing without authentication");
    }

    // -----------------------------
    // DATABASE CONNECTION
    // -----------------------------
    await connectPrisma();
    console.log("✅ Connected to PostgreSQL");

    // -----------------------------
    // GLOBAL MIDDLEWARE
    // -----------------------------
    app.use(helmet());
    app.use(express.json());
    app.use(cookieParser());

    app.use(
      cors({
        origin: ["http://localhost:5173"],
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
        exposedHeaders: ["set-cookie"],
      })
    );

    // -----------------------------
    // SESSION (SAFE)
    // -----------------------------
    app.use(
      session({
        secret: process.env.SESSION_SECRET || "my-secret",
        resave: false,
        saveUninitialized: true,
        store: memoryStore || undefined, // ✅ SAFE fallback
      })
    );

    // -----------------------------
    // KEYCLOAK MIDDLEWARE (FIXED)
    // -----------------------------
    // [MODIFY - SAFE NULL HANDLING]
    if (keycloak) {
      app.use(keycloak.middleware());
    } else {
      console.warn("⚠️ Keycloak middleware skipped (not available)");
    }

    // -----------------------------
    // ROUTES
    // -----------------------------
    app.use("/api/v1/auth", authRoutes);
    app.use("/api/v1/aws", awsRouter);
    app.use("/api/v1/vendor", vendorRoutes);
    app.use("/api/v1/hiring-manager", hiringManagerRoutes);

    // -----------------------------
    // DEBUG LOGGER
    // -----------------------------
    app.use((req, _, next) => {
      console.log("[Server] Incoming request:", {
        method: req.method,
        path: req.path,
      });
      next();
    });

    // -----------------------------
    // HEALTH CHECK
    // -----------------------------
    app.get("/", (_, res) => {
      res.send("Server Connected!");
    });

    // -----------------------------
    // ERROR HANDLER
    // -----------------------------
    app.use(
      (
        err: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        console.error("Global error handler:", err);
        res.status(500).json({
          error: "Internal Server Error",
          message: err.message,
        });
      }
    );

    // -----------------------------
    // START SERVER
    // -----------------------------
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error during server initialization:", error);
    process.exit(1);
  }
}

// Start server
await startServer();