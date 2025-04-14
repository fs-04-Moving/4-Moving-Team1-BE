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
