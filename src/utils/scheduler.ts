import prisma from "../db/prisma/client";
import dayjs from "dayjs";
import notificationService from "../services/notification.service";

// 스케줄러 테스트
const today = dayjs().startOf("day");

function formatLocation(address: string): string {
  const parts = address.split(" ").filter(Boolean);

  if (parts.length < 2) return "주소 정보 없음";

  const sido = parts[0];
  const sigungu = parts[1];

  const shortSido = sido
    .replace(/특별자치도|광역시|특별시/, "")
    .replace("도", "")
    .replace("시", "");

  const refined = sigungu.replace(/(구|군|시|읍|면|동)$/, "");

  return `${shortSido}(${refined})`;
}

async function scheduler() {
  //날짜가 지난거
  const outOfDateEstimateRequests = await prisma.estimateRequest.findMany({
    where: {
      movingDate: { lt: today.toDate() },
      status: { not: "inactive" },
    },
  });

  // 업데이트
  for (const estimateRequest of outOfDateEstimateRequests) {
    await prisma.$transaction([
      prisma.estimateRequest.update({
        where: { id: estimateRequest.id },
        data: { status: "inactive" },
      }),
      prisma.user.update({
        where: { id: estimateRequest.customerId },
        data: { hasRequest: false },
      }),
    ]);
  }

  //날짜가 내일이고 확정난거
  const todayEstimates = await prisma.estimateRequest.findMany({
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
    notificationService.createNotification({
      message: `내일은 ${formatLocation(
        estimateRequest.departure
      )} → ${formatLocation(estimateRequest.destination)} 이사 예정일이에요. `,
      userId: estimateRequest.customerId,
    });
    //기사에게 메시지 보내기
    notificationService.createNotification({
      message: `내일은 ${formatLocation(
        estimateRequest.departure
      )} → ${formatLocation(estimateRequest.destination)} 이사 예정일이에요. `,
      userId: estimateRequest.estimates[0].workerId,
    });
  }

  await prisma.$disconnect();
}

scheduler().catch((e) => {
  console.error(e);
  process.exit(1);
});
