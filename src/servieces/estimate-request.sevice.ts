import prisma from "../db/prisma/client";
import { EstimateRequstDto } from "../types/estimate-request.type";

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

const estimateRequstService = { createEstimateRequest, deleteEstimateRequest };

export default estimateRequstService;
