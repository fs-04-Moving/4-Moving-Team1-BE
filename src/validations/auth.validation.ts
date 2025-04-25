import { ROLE } from "@prisma/client";
import { RequestHandler } from "express";
import { z } from "zod";

const phoneNumberRegex = new RegExp(/^(01[016789]{1})[0-9]{3,4}[0-9]{4}$/);
const passwordRegex = new RegExp(
  /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+~`\-={}[\]:;"'<>,.?/\\]).{8,}$/
);

const emailSchema = z.string().email({ message: "Invalid email address" });
const nameSchema = z
  .string()
  .min(1, { message: "nickname must be 1 or more characters long" })
  .max(20, { message: "nickname must be 20 or fewer characters long" });
const passwordSchema = z
  .string()
  .min(8, { message: "password must be 8 or more characters long" })
  .regex(passwordRegex, "영문/숫자/특수문자를 모두 포함해야 합니다");
const phoneNumberSchema = z
  .string()
  .min(1, { message: "전화번호를 입력해주세요" })
  .regex(phoneNumberRegex, "잘못된 전화번호 형식입니다")
  .optional();

const signUpvalidation = z
  .object({
    email: emailSchema,
    name: nameSchema,
    password: passwordSchema,
    passwordConfirm: passwordSchema,
    phoneNumber: phoneNumberSchema,
    role: z.nativeEnum(ROLE, { message: "Invalid role" }),
  })
  .refine((data) => data.passwordConfirm === data.password, {
    message: "password don't match ",
  });

const logInValidation = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: z.nativeEnum(ROLE, { message: "Invalid role" }),
});

const updateUserInfoSchema = z
  .object({
    email: emailSchema,
    name: nameSchema,
    password: passwordSchema,
    newPasswordConfirm: passwordSchema.optional(),
    phoneNumber: phoneNumberSchema,
    newPassword: z
      .string()
      .min(8, { message: "새 비밀번호는 8자 이상이어야 합니다" })
      .regex(passwordRegex, "영문/숫자/특수문자를 모두 포함해야 합니다")
      .optional(),
  })
  .refine(
    (data) =>
      data.newPasswordConfirm === data.newPassword,
    {
      message: "password don't match ",
    }
  )
  .refine((data) => !data.newPassword || data.newPassword !== data.password, {
    message: "새로운 비밀번호가 현재 비밀번호와 달라야합니다.",
  });

const validateSignUp: RequestHandler = (req, res, next) => {
  try {
    const { email, name, password, passwordConfirm, phoneNumber, role } =
      req.body;

    const parsedContext = signUpvalidation.safeParse({
      email,
      name,
      password,
      passwordConfirm,
      phoneNumber,
      role,
    });

    if (!parsedContext.success) {
      throw new Error(`400/Validation error: ${parsedContext.error}`);
    }
    req.body = parsedContext.data;
    next();
  } catch (e) {
    next(e);
  }
};

const validateSignIn: RequestHandler = (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    const parsedContext = logInValidation.safeParse({
      email,
      password,
      role,
    });

    if (!parsedContext.success) {
      throw new Error(`400/Validation error: ${parsedContext.error}`);
    }
    req.body = parsedContext.data;
    next();
  } catch (e) {
    next(e);
  }
};

const validateUpdateUserInfo: RequestHandler = (req, res, next) => {
  try {
    const {
      email,
      name,
      password,
      newPasswordConfirm,
      phoneNumber,
      newPassword,
    } = req.body;

    const parsedContext = updateUserInfoSchema.safeParse({
      email,
      name,
      password,
      newPasswordConfirm,
      phoneNumber,
      newPassword,
    });

    if (!parsedContext.success) {
      throw new Error(`400/Validation error: ${parsedContext.error}`);
    }
    req.body = parsedContext.data;
    next();
  } catch (e) {
    next(e);
  }
};

export { validateSignUp, validateSignIn, validateUpdateUserInfo };
