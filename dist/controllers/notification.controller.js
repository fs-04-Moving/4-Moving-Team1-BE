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
exports.clientsByUserId = void 0;
const notification_service_1 = __importDefault(require("../services/notification.service"));
exports.clientsByUserId = {};
const notificationController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId) {
        res.status(400).end();
    }
    // SSE에서 필요한 타입 설정
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache"); // 캐싱 방지
    res.setHeader("Connection", "keep-alive"); // 연결 유지
    res.flushHeaders(); // 헤더를 강제로 전송
    const latestNotifications = yield notification_service_1.default.getNotification(userId);
    res.write(`data: ${JSON.stringify({ notification: latestNotifications })}\n\n`);
    // notificationService.sendNotification("테스트해야지1212.", userId);
    exports.clientsByUserId[userId] = res;
    req.on("close", () => {
        console.log("연결 종료");
        delete exports.clientsByUserId[userId];
        res.end();
    });
});
const notification = { notificationController };
exports.default = notification;
