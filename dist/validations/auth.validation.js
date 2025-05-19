"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateUserInfo = exports.validateSignIn = exports.validateSignUp = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const phoneNumberRegex = new RegExp(/^(01[016789]{1})[0-9]{3,4}[0-9]{4}$/);
const passwordRegex = new RegExp(/^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+~`\-={}[\]:;"'<>,.?/\\]).{8,}$/);
const emailSchema = zod_1.z.string().email({ message: "Invalid email address" });
const nameSchema = zod_1.z
    .string()
    .min(1, { message: "nickname must be 1 or more characters long" })
    .max(20, { message: "nickname must be 20 or fewer characters long" });
const passwordSchema = zod_1.z
    .string()
    .min(8, { message: "password must be 8 or more characters long" })
    .regex(passwordRegex, "영문/숫자/특수문자를 모두 포함해야 합니다");
const phoneNumberSchema = zod_1.z
    .string()
    .min(1, { message: "전화번호를 입력해주세요" })
    .regex(phoneNumberRegex, "잘못된 전화번호 형식입니다")
    .optional();
const signUpvalidation = zod_1.z
    .object({
    email: emailSchema,
    name: nameSchema,
    password: passwordSchema,
    passwordConfirm: passwordSchema,
    phoneNumber: phoneNumberSchema,
    role: zod_1.z.nativeEnum(client_1.ROLE, { message: "Invalid role" }),
})
    .refine((data) => data.passwordConfirm === data.password, {
    message: "password don't match ",
});
const logInValidation = zod_1.z.object({
    email: emailSchema,
    password: passwordSchema,
    role: zod_1.z.nativeEnum(client_1.ROLE, { message: "Invalid role" }),
});
const updateUserInfoSchema = zod_1.z
    .object({
    email: emailSchema,
    name: nameSchema,
    password: passwordSchema.optional(),
    newPasswordConfirm: passwordSchema.optional(),
    phoneNumber: phoneNumberSchema,
    provider: zod_1.z
        .nativeEnum(client_1.Provider, { message: "Invalid provider" })
        .optional(),
    newPassword: zod_1.z
        .string()
        .min(8, { message: "새 비밀번호는 8자 이상이어야 합니다" })
        .regex(passwordRegex, "영문/숫자/특수문자를 모두 포함해야 합니다")
        .optional(),
})
    .refine((data) => data.newPasswordConfirm === data.newPassword, {
    message: "password don't match ",
})
    .refine((data) => !data.newPassword || data.newPassword !== data.password, {
    message: "새로운 비밀번호가 현재 비밀번호와 달라야합니다.",
});
const validateSignUp = (req, res, next) => {
    try {
        const { email, name, password, passwordConfirm, phoneNumber, role } = req.body;
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
    }
    catch (e) {
        next(e);
    }
};
exports.validateSignUp = validateSignUp;
const validateSignIn = (req, res, next) => {
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
    }
    catch (e) {
        next(e);
    }
};
exports.validateSignIn = validateSignIn;
const validateUpdateUserInfo = (req, res, next) => {
    try {
        const { email, name, password, newPasswordConfirm, phoneNumber, newPassword, provider, } = req.body;
        const parsedContext = updateUserInfoSchema.safeParse({
            email,
            name,
            password,
            newPasswordConfirm,
            phoneNumber,
            newPassword,
            provider,
        });
        if (!parsedContext.success) {
            throw new Error(`400/Validation error: ${parsedContext.error}`);
        }
        req.body = parsedContext.data;
        next();
    }
    catch (e) {
        next(e);
    }
};
exports.validateUpdateUserInfo = validateUpdateUserInfo;
