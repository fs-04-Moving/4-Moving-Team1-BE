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
const dayjs_1 = __importDefault(require("dayjs"));
const notification_service_1 = __importDefault(require("../services/notification.service"));
// 스케줄러 테스트
const today = (0, dayjs_1.default)().startOf("day");
function formatLocation(address) {
    const parts = address.split(" ").filter(Boolean);
    if (parts.length < 2)
        return "주소 정보 없음";
    const sido = parts[0];
    const sigungu = parts[1];
    const shortSido = sido
        .replace(/특별자치도|광역시|특별시/, "")
        .replace("도", "")
        .replace("시", "");
    const refined = sigungu.replace(/(구|군|시|읍|면|동)$/, "");
    return `${shortSido}(${refined})`;
}
function scheduler() {
    return __awaiter(this, void 0, void 0, function* () {
        //날짜가 지난거
        const outOfDateEstimateRequests = yield client_1.default.estimateRequest.findMany({
            where: {
                movingDate: { lt: today.toDate() },
                status: { not: "inactive" },
            },
        });
        // 업데이트
        for (const estimateRequest of outOfDateEstimateRequests) {
            yield client_1.default.$transaction([
                client_1.default.estimateRequest.update({
                    where: { id: estimateRequest.id },
                    data: { status: "inactive" },
                }),
                client_1.default.user.update({
                    where: { id: estimateRequest.customerId },
                    data: { hasRequest: false },
                }),
            ]);
        }
        //날짜가 내일이고 확정난거
        const todayEstimates = yield client_1.default.estimateRequest.findMany({
            where: {
                movingDate: {
                    gte: today.add(1, "day").toDate(), // 내일
                    lt: today.add(2, "day").toDate(), // 모레
                },
                status: "confirmed",
            },
            include: { estimates: { where: { isConfirmed: true } } },
        });
        for (const estimateRequest of todayEstimates) {
            // 유저에게 메시지 보내기
            notification_service_1.default.createNotification({
                message: `내일은 ${formatLocation(estimateRequest.departure)} → ${formatLocation(estimateRequest.destination)} 이사 예정일이에요. `,
                userId: estimateRequest.customerId,
            });
            //기사에게 메시지 보내기
            notification_service_1.default.createNotification({
                message: `내일은 ${formatLocation(estimateRequest.departure)} → ${formatLocation(estimateRequest.destination)} 이사 예정일이에요. `,
                userId: estimateRequest.estimates[0].workerId,
            });
        }
        yield client_1.default.$disconnect();
    });
}
scheduler().catch((e) => {
    console.error(e);
    process.exit(1);
});
