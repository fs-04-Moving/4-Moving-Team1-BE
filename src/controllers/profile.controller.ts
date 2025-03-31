import { RequestHandler } from "express";
import { asyncHandler } from "../middlewear/error.middleware";
import prisma from "../db/prisma/client";
import { UserProfile, workerProfile } from "../types/profile.type";

const createUserProfileController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { livingArea, services } = req.body;
    let profileImage = null;
    if (req.file) {
      profileImage = req.file.path;
    }
    const userId = req.userId;
    if (!userId) return;
    const parsedServices =
      typeof services === "string" ? JSON.parse(services) : services;

    const data: UserProfile = {
      profileImage,
      livingArea,
      services: parsedServices,
      userId,
    };
    const existingProfile = await prisma.userProfile.findFirst({
      where:{userId}
    })
    if(existingProfile){
      throw new Error("400/profile already exist")
    }

    await prisma.userProfile.create({
      data,
    });
    res.sendStatus(201);
  }
);

const createRiderProfileController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const {
      nickname,
      experience,
      summary,
      description,
      services,
      serviceAreas,
    } = req.body;

    let profileImage = null;
    if (req.file) {
      profileImage = req.file.path;
    }
    const userId = req.userId;
    if (!userId) return;

    const parsedServices =
      typeof services === "string" ? JSON.parse(services) : services;

    const parsedArea =
      typeof serviceAreas === "string"
        ? JSON.parse(serviceAreas)
        : serviceAreas;

    const data: workerProfile = {
      profileImage,
      nickname,
      experience: Number(experience),
      summary,
      description,
      serviceAreas: parsedArea,
      services: parsedServices,
      userId,
    };

    const existingProfile = await prisma.workProfile.findFirst({
      where:{userId}
    })
    if(existingProfile){
      throw new Error("400/profile already exist")
    }


    await prisma.workProfile.create({
      data,
    });
    res.sendStatus(201);
  }
);

const profile = { createRiderProfileController, createUserProfileController };

export default profile;
