/**
 * @module Base API Routing
 * @file index.ts
 * @developer Joshua
 * @role Senior Security, Authentication, & Core Platform Lead
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import consultationsRouter from "./consultations";
import queueRouter from "./queue";
import prescriptionsRouter from "./prescriptions";
import labRouter from "./lab";
import notificationsRouter from "./notifications";
import mentalHealthRouter from "./mental-health";
import hivSupportRouter from "./hiv-support";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin";
import emergencyRouter from "./emergency";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(consultationsRouter);
router.use(queueRouter);
router.use(prescriptionsRouter);
router.use(labRouter);
router.use(notificationsRouter);
router.use(mentalHealthRouter);
router.use(hivSupportRouter);
router.use(dashboardRouter);
router.use(adminRouter);
router.use(emergencyRouter);

export default router;
