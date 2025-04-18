import express from "express";
import { authenticatedWithRefresh } from "../../middleware/auth.middleware";
import notification from "../../controllers/notification.controller";

const notificationRouter = express.Router();

notificationRouter.get(
  "/",
  authenticatedWithRefresh,
  notification.notificationController
);

export default notificationRouter;
