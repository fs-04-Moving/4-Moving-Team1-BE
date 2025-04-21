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
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorHandler = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = require("jsonwebtoken");
const errorHandler = (err, req, res, next) => {
    console.error("error는 ", err);
    if (err instanceof jsonwebtoken_1.TokenExpiredError) {
        res.status(419).send("token expired");
    }
    if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
        res.status(401).send("Invalid token in authentication");
    }
    const [statusCodeText, message] = err.message.split("/");
    const statusCode = Number(statusCodeText);
    if (isNaN(statusCode)) {
        res.status(500).send("unknown error");
        return;
    }
    res.status(statusCode).send(message);
};
exports.errorHandler = errorHandler;
const asyncHandler = (handler) => {
    return function (req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield handler(req, res, next);
            }
            catch (e) {
                if (e.name === "StructError" ||
                    e instanceof client_1.Prisma.PrismaClientValidationError) {
                    res.status(400).send({ message: e.message });
                }
                else if (e instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                    e.code === "P2025") {
                    res.sendStatus(404);
                }
                else {
                    next(e);
                }
            }
        });
    };
};
exports.asyncHandler = asyncHandler;
