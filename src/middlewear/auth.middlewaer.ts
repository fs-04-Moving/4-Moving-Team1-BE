import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import prisma from "../db/prisma/client";

const jwtSecretKey = process.env.JWT_SECRET_KEY;

const authMiddleware: RequestHandler = (req, res, next) => {
  try {
    if (req.url === "/auth/sign-up" || req.url === "/auth/log-in")
      return next();
    const token = req.headers.authorization;
    if (!token) {
      return next();
    }

    const accessToken = token.split("Bearer ")[1];
    if (!jwtSecretKey) {
      throw new Error("401/JWT_SECRET is not defined in environment variables");
    }
    const { sub } = jwt.verify(accessToken, jwtSecretKey);

    if (typeof sub !== "string") {
      throw new Error("400/sub is not string");
    }

    req.userId = sub;

    next();
  } catch (e) {
    next(e);
  }
};

const authenticatedOnly: RequestHandler = (req, res, next) => {
  try {
    const userId = req.userId;
    const isAuthenticated = !!userId;
    if (!isAuthenticated) throw new Error("401/Unauthenticated");

    next();
  } catch (e) {
    next(e);
  }
};

const userOnly: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await prisma.user.findFirstOrThrow({ where: { id: userId } });
    if (user.role === "user") {
      next();
    } else {
      throw new Error("403/Unauthenticated : user only");
    }
  } catch (e) {
    next(e);
  }
};

const workerOnly: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await prisma.user.findFirstOrThrow({ where: { id: userId } });
    if (user.role === "worker") {
      next();
    } else {
      throw new Error("403/Unauthenticated : work only");
    }
  } catch (e) {
    next(e);
  }
};

export { authMiddleware, authenticatedOnly, userOnly, workerOnly };
