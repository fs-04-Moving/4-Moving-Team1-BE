"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSignInContext = exports.validateSignUpContext = void 0;
const zod_1 = require("zod");
const phoneNumberRegex = new RegExp(/^(01[016789]{1})[0-9]{3,4}[0-9]{4}$/);
const passwordRegex = new RegExp(/^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+~`\-={}[\]:;"'<>,.?/\\]).{8,}$/);
const signUpvalidation = zod_1.z
    .object({
    email: zod_1.z.string().email({ message: "Invalid email address" }),
    name: zod_1.z
        .string()
        .min(1, { message: "nickname must be 1 or more characters long" })
        .max(20, { message: "nickname must be 20 or fewer characters long" }),
    password: zod_1.z
        .string()
        .min(8, { message: "password must be 8 or more characters long" })
        .regex(passwordRegex, "영문/숫자/특수문자를 모두 포함해야 합니다"),
    passwordConfirmation: zod_1.z
        .string()
        .min(8, { message: "password must be 8 or more characters long" }),
    phoneNumber: zod_1.z
        .string()
        .min(1, { message: "전화번호를 입력해주세요" })
        .regex(phoneNumberRegex, "잘못된 전화번호 형식입니다")
        .optional(),
})
    .refine((data) => data.passwordConfirmation === data.password, {
    message: "password don't match ",
});
const logInValidation = zod_1.z.object({
    email: zod_1.z.string().email({ message: "Invalid email address" }),
    password: zod_1.z
        .string()
        .min(8, { message: "password must be 8 or more characters long" }),
});
const validateSignUpContext = (req, res, next) => {
    try {
        const { email, name, password, passwordConfirmation, phoneNuber } = req.body;
        const parsedContext = signUpvalidation.safeParse({
            email: email,
            name: name,
            password: password,
            passwordConfirmation: passwordConfirmation,
            phoneNuber: phoneNuber,
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
exports.validateSignUpContext = validateSignUpContext;
const validateSignInContext = (req, res, next) => {
    try {
        const { email, password } = req.body;
        const parsedContext = logInValidation.safeParse({
            email: email,
            password: password,
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
exports.validateSignInContext = validateSignInContext;
