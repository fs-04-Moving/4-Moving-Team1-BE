import express from "express";
import { authenticatedWithRefresh } from "../../middleware/auth.middleware";
import notification from "../../controllers/notification.controller";

const notificationRouter = express.Router();

notificationRouter.get(
  "/",
  authenticatedWithRefresh,
  notification.notificationController
);

notificationRouter.patch("/:id/read", notification.readNotificationController);

export default notificationRouter;
