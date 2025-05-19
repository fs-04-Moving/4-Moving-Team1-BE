import { Request, RequestHandler, Response } from "express";
import notificationService from "../services/notification.service";
import { CLIENT_URL } from "../app";
import { clientsByUserId } from "../utils/notificaiotnClients";

const notificationController: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const userId = req.userId as string;
  if (!userId) {
    res.status(400).send();
  }

  // SSE에서 필요한 타입 설정
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache"); // 캐싱 방지
  res.setHeader("Connection", "keep-alive"); // 연결 유지
  res.setHeader("Access-Control-Allow-Origin", `https://movings.kro.kr`);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.flushHeaders(); // 헤더를 강제로 전송

  const latestNotifications = await notificationService.getNotification(userId);
  res.write(
    `data: ${JSON.stringify({ notification: latestNotifications })}\n\n`
  );

  clientsByUserId[userId] = res;

  req.on("close", () => {
    console.log("연결 종료");
    delete clientsByUserId[userId];
    res.end();
  });
};

const notification = { notificationController };
export default notification;
