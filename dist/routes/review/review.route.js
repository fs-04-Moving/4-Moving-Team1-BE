"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const review_controller_1 = __importDefault(require("../../controllers/review.controller"));
const common_validation_1 = require("../../validations/common.validation");
const reviewRouter = express_1.default.Router();
reviewRouter.post("/:estimateId", auth_middleware_1.authenticatedOnly, auth_middleware_1.customerOnly, review_controller_1.default.createReviewController);
reviewRouter.get("/", auth_middleware_1.authenticatedOnly, auth_middleware_1.customerOnly, common_validation_1.validatePaginationQuery, review_controller_1.default.getMyReviewController);
reviewRouter.get("/:workerId", common_validation_1.validatePaginationQuery, review_controller_1.default.getWorkerReviewsController);
exports.default = reviewRouter;
