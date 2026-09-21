import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// CORS middleware - must be first
app.use(cors({
  origin: ['https://mockup-sandbox-zeta-lime.vercel.app', 'https://health-asset-tracker.vercel.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to unwrap data wrapper from API client
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object' && 'data' in req.body) {
    req.body = req.body.data;
  }
  next();
});

app.use("/api", router);

export default app;
