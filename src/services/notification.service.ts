import prisma from "../db/prisma/client";
import { clientsByUserId } from "../utils/notificaiotnClients";

const sendNotification = async ({
  message,
  userId,
}: {
  message: string;
  userId: string;
}) => {
  const newNotification = await prisma.notification.create({
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

  if (clientsByUserId[userId]) {
    clientsByUserId[userId].write(
      `data: ${JSON.stringify({ notification })}\n\n`
    );
  }
};

const getNotification = async (userId: string) => {
  const notifications = await prisma.notification.findMany({
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
};

const createNotification = async ({
  message,
  userId,
}: {
  message: string;
  userId: string;
}) => {
  await prisma.notification.create({
    data: {
      userId,
      message,
      isRead: false,
    },
  });
};

const notificationService = {
  sendNotification,
  getNotification,
  createNotification,
};
export default notificationService;
