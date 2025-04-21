"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notification_controller_1 = require("../controllers/notification.controller");
const client_1 = __importDefault(require("../db/prisma/client"));
const sendNotification = (_a) => __awaiter(void 0, [_a], void 0, function* ({ message, userId, }) {
    const newNotification = yield client_1.default.notification.create({
        data: {
            userId,
            message,
            isRead: false,
        },
    });
    const notification = {
        id: newNotification.id,
        message: newNotification.message,
        isRead: newNotification.isRead,
        createdAt: newNotification.createdAt,
    };
    if (notification_controller_1.clientsByUserId[userId]) {
        notification_controller_1.clientsByUserId[userId].write(`data: ${JSON.stringify({ notification })}\n\n`);
    }
});
const getNotification = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const notifications = yield client_1.default.notification.findMany({
        where: { userId },
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            message: true,
            isRead: true,
            createdAt: true,
        },
    });
    return notifications;
});
const notificationService = { sendNotification, getNotification };
exports.default = notificationService;
