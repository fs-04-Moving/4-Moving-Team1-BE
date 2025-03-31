import { RequestHandler } from "express";
import { asyncHandler } from "../middlewear/error.middleware";
import prisma from "../db/prisma/client";

const createUserProfileController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { livingArea, services } = req.body;
    let profileImage = null;
    if (req.file) {
      profileImage = req.file.path;
    }

    // const userProfile = await prisma.userProfile.create({
    //   data: {
    //     profileImage,
    //     livingArea,
    //     services,
    //     userId: req.userId,
    //   },
    // });
  }
);

const createRiderProfileController: RequestHandler = asyncHandler(
  async (req, res, next) => {}
);

const profile = { createRiderProfileController, createUserProfileController };

export default profile;
