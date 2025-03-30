import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

const jwtSecretKey = process.env.JWT_SECRET_KEY;

const authMiddleware: RequestHandler = (req, res, next) => {
  try {
    if (req.url === "/auth/signUp" || req.url === "/auth/lo") return next();
    const token = req.headers.authorization;
    if (!token) {
      return next();
    }

    const accessToken = token.split("Bearer ")[1];
    if (!jwtSecretKey) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const { sub } = jwt.verify(accessToken, jwtSecretKey);

    if (typeof sub !== "string") {
      throw new Error("sub is not string");
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

export { authMiddleware, authenticatedOnly };
