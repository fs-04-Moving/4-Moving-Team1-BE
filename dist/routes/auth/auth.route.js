"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("../../controllers/auth.controller"));
const auth_validation_1 = require("../../validations/auth.validation");
const authRouter = express_1.default.Router();
authRouter.post("/log-in", auth_validation_1.validateSignIn, auth_controller_1.default.logInController);
authRouter.post("/sign-up", auth_validation_1.validateSignUp, auth_controller_1.default.signUpController);
authRouter.post("/refresh-token", auth_controller_1.default.refreshTokenController);
authRouter.delete("/log-out", auth_controller_1.default.logOutController);
exports.default = authRouter;
