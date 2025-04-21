"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const notification_controller_1 = __importDefault(require("../../controllers/notification.controller"));
const notificationRouter = express_1.default.Router();
notificationRouter.get("/", auth_middleware_1.authenticatedWithRefresh, notification_controller_1.default.notificationController);
exports.default = notificationRouter;
