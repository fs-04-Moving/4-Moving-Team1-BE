import prisma from "../db/prisma/client";
import { EstimateRequstDto } from "../types/estimate-request.type";
import { findActiveEstimateRequest } from "./utills";

// 견적 요청 생성 함수
const createEstimateRequest = async (estimateRequstDto: EstimateRequstDto) => {
  try {
    const { customerId } = estimateRequstDto;
    const existingEstimateRequest = await prisma.estimateRequest.findFirst({
      where: {
        customerId,
        OR: [{ status: "active" }, { status: "confirmed" }],
      },
    });
    if (existingEstimateRequest) {
      throw new Error("400/active estimateRequest exist");
    }
    await prisma.estimateRequest.create({
      data: { ...estimateRequstDto },
    });
  } catch (e) {
    throw e;
  }
};

// 견적 요청 삭제 함수
const deleteEstimateRequest = async (customerId: string) => {
  try {
    const estimateRequest = await prisma.estimateRequest.findFirst({
      where: {
        customerId,
        status: "active",
      },
    });
    if (!estimateRequest) {
      throw new Error("400/estimateRequest not found");
    }
    await prisma.estimateRequest.deleteMany({
      where: {
        customerId,
        status: "active",
      },
    });
  } catch (e) {
    throw e;
  }
};

// 견적 요청의 상태를 confirm으로 변경하는함수
const confirmEstimateRequest = async (customerId: string) => {
  const { id: estimateRequestId } = await findActiveEstimateRequest(customerId);
  await prisma.estimateRequest.update({
    where: { id: estimateRequestId },
    data: { status: "confirmed" },
  });
};

const estimateRequstService = {
  createEstimateRequest,
  deleteEstimateRequest,
  confirmEstimateRequest,
};

export default estimateRequstService;
