import { EstimateStatus } from "@prisma/client";
import prisma from "../db/prisma/client";
import { findActiveEstimateRequest, findEstimate, findUser } from "./utills";

// 견적 생성 함수
const createEstimate = async (
  workerId: string,
  customerId: string,
  status: EstimateStatus,
  price?: number
) => {
  try {
    const estimateRequest = await findActiveEstimateRequest(customerId);

    await findUser(workerId);

    const { id, serviceType, departure, destination, movingDate } =
      estimateRequest;

    const estimate = await prisma.estimate.findFirst({
      where: { customerId, workerId },
    });

    if (estimate) throw new Error("400/estimate already exist");

    if (status === "general" && price === undefined) {
      throw new Error("400/price is required for general estimate");
    }

    await prisma.estimate.create({
      data: {
        estimateRequestId: id,
        customerId,
        workerId,
        serviceType,
        departure,
        destination,
        movingDate,
        status,
        ...(status === "general" ? { price } : {}),
      },
    });
  } catch (e) {
    throw e;
  }
};

// 견적의 isCompleted: ture로 변경, 만약 가격이 없으면 에러 반환
const confirmEstimate = async (estimateId: string) => {
  try {
    const { price } = await findEstimate(estimateId);
    if (!price) throw new Error("400/The estimate is not yet priced");
    await prisma.estimate.update({
      where: { id: estimateId },
      data: { isCompleted: true },
    });
  } catch (e) {
    throw e;
  }
};
//
const rejectEstimate = async (estimateId: string, rejectionMessage: string) => {
  try {
    // 견적이 있는지 확인
    const { price } = await findEstimate(estimateId, "assigned");
    if (price) throw new Error("400/estimate already sent to the user.");
    await prisma.estimate.update({
      where: { id: estimateId },
      data: { status: "rejected", rejectionMessage },
    });
  } catch (e) {
    throw e;
  }
};
//
const priceEstimate = async (
  estimateId: string,
  price: number,
  comment: string
) => {
  try {
    // 견적이 있는지 확인(거부된거면 가격 못하게)
    if (!price) throw new Error("400/price is required for general estimate");
    const { price: checkPrice } = await findEstimate(estimateId, "assigned");
    if (checkPrice) throw new Error("400/estimate already sent to the user.");

    await prisma.estimate.update({
      where: { id: estimateId },
      data: { price, comment },
    });
  } catch (e) {
    throw e;
  }
};

const estimateService = {
  createEstimate,
  confirmEstimate,
  rejectEstimate,
  priceEstimate,
};

export default estimateService;
