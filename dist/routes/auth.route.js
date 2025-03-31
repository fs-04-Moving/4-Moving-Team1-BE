"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const auth_validation_1 = require("../vaildataions/auth.validation");
const authRouter = express_1.default.Router();
authRouter.post("/logIn", auth_validation_1.validateSignInContext, auth_controller_1.default.logInController);
authRouter.post("/signUp", auth_validation_1.validateSignUpContext, auth_controller_1.default.signUpController);
authRouter.post("/refresh-token");
exports.default = authRouter;
