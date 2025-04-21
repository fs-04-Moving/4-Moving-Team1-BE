"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const estimate_route_1 = __importDefault(require("./customer/estimate.route"));
const estimate_route_2 = __importDefault(require("./worker/estimate.route"));
const estimateRouter = express_1.default.Router();
estimateRouter.use("/", estimate_route_1.default);
estimateRouter.use("/", estimate_route_2.default);
exports.default = estimateRouter;
