import prisma from "../db/prisma/client";
import { EstimateRequstDto } from "../types/estimate-request.type";

const createEstimateRequest = async (estimateRequstDto: EstimateRequstDto) => {
  try {
    // const existingEstimateRequest = await prisma.e
    await prisma.estimateRequest.create({
      data: { ...estimateRequstDto },
    });
  } catch (e) {
    throw e;
  }
};

const estimateRequstService = { createEstimateRequest };

export default estimateRequstService;
