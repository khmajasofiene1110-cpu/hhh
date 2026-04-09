import express from "express";
import cors from "cors";

import adminRoutes from "./routes/admin.mjs";

function buildCorsOptions() {
  const origin = process.env.CORS_ORIGIN;
  if (!origin) return { origin: true };
  return { origin };
}

export function createApp() {
  const app = express();

  app.use(cors(buildCorsOptions()));
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/admin", adminRoutes);

  return app;
}

