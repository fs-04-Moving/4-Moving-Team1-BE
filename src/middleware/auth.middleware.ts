import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import prisma from "../db/prisma/client";

const jwtSecretKey = process.env.JWT_SECRET_KEY;

if (!jwtSecretKey) {
  throw new Error("jwtSerectKey is not exist");
}

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

const customerOnly: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await prisma.user.findFirstOrThrow({ where: { id: userId } });
    if (user.role === "customer") {
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

const authenticatedWithRefresh: RequestHandler = (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token) res.status(401).send("Unauthenticated");

  try {
    const payload = jwt.verify(token, jwtSecretKey) as { sub: string };
    req.userId = payload.sub;
    next();
  } catch (err) {
    res.status(401).send("Invalid refresh token");
  }
};

export {
  authMiddleware,
  authenticatedOnly,
  customerOnly,
  workerOnly,
  authenticatedWithRefresh,
};
