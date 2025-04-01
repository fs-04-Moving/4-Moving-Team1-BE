import { ErrorRequestHandler, RequestHandler } from "express";
import { Prisma } from "@prisma/client";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error("error는 ", err);
  const [statusCodeText, message] = err.message.split("/");
  const statusCode = Number(statusCodeText);

  if (isNaN(statusCode)) {
    res.status(500).send("unknown error");
    return;
  }

  res.status(statusCode).send(message);
};

const asyncHandler = (handler: RequestHandler): RequestHandler => {
  return async function (req, res, next) {
    try {
      await handler(req, res, next);
    } catch (e: any) {
      if (
        e.name === "StructError" ||
        e instanceof Prisma.PrismaClientValidationError
      ) {
        res.status(400).send({ message: e.message });
      } else if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2025"
      ) {
        res.sendStatus(404);
      } else {
        next(e);
      }
    }
  };
};

export { errorHandler, asyncHandler };
