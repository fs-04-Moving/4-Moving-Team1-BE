import prisma from "../db/prisma/client";
import { EstimateRequstDto } from "../types/estimate-request.type";

const createEstimateRequest = async (estimateRequstDto: EstimateRequstDto) => {
  try {
    await prisma.estimateRequest.create({
      data: { ...estimateRequstDto },
    });
  } catch (e) {
    throw e;
  }
};

const estimateRequstService = { createEstimateRequest };

export default estimateRequstService;
