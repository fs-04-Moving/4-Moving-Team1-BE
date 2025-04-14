import prisma from "../db/prisma/client";

const updateEstimateRequest = async () => {
  const today = new Date();
  await prisma.estimateRequest.updateMany({
    where: {
      movingDate: { lt: today },
      OR: [{ status: "active" }, { status: "confirmed" }],
    },
    data: { status: "inactive" },
  });
};

(async () => {
  try {
    await updateEstimateRequest();
    console.log("✅ 만료된 요청 비활성화 완료");
  } catch (e) {
    console.error("❌ 에러 발생:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect(); // 꼭 필요!
  }
})();
