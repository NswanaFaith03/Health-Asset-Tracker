import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { seedDefaultAdmin } from "./seed";
import { logger } from "./lib/logger";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

async function ensureAppSettingsTable() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS app_settings (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS app_settings_key_idx ON app_settings (key);
    `);
  } catch (error) {
    logger.error({ err: error }, "Failed to ensure app_settings table exists");
    throw error;
  }
}

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Ensure app-level settings exist before requests are processed.
ensureAppSettingsTable().catch((error) => {
  logger.error({ err: error }, "Startup failed while ensuring app settings schema");
});

// Serve uploaded files
import path from "path";
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Optionally seed default admin on startup when SEED_DEFAULT_ADMIN=true
if (process.env.SEED_DEFAULT_ADMIN === "true") {
  seedDefaultAdmin().catch((err) => {
    logger.error({ err }, "Failed to seed default admin");
  });
}

export default app;
