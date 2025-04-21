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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("../db/prisma/client"));
const updateEstimateRequest = () => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    yield client_1.default.estimateRequest.updateMany({
        where: {
            movingDate: { lt: today },
            OR: [{ status: "active" }, { status: "confirmed" }],
        },
        data: { status: "inactive" },
    });
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield updateEstimateRequest();
        console.log("✅ 만료된 요청 비활성화 완료");
    }
    catch (e) {
        console.error("❌ 에러 발생:", e);
        process.exit(1);
    }
    finally {
        yield client_1.default.$disconnect(); // 꼭 필요!
    }
}))();
