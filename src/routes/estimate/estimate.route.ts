import express from "express";

import customerEstimateRouter from "./customer/estimate.route";
import workerEstimateRouter from "./worker/estimate.route";

const estimateRouter = express.Router();

estimateRouter.use("/", customerEstimateRouter);
estimateRouter.use("/", workerEstimateRouter);

export default estimateRouter;
