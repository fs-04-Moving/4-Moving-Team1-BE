import { RequestHandler } from "express";
import { asyncHandler } from "../middlewear/error.middleware";

const createUserProfileController: RequestHandler = asyncHandler(
  async (req, res, next) => {}
);

const createRiderProfileController: RequestHandler = asyncHandler(
  async (req, res, next) => {}
);

const profile = { createRiderProfileController, createUserProfileController };

export default profile;
