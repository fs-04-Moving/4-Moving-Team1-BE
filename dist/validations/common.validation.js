"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePaginationQuery = void 0;
const zod_1 = require("zod");
const paginationQuerySchema = zod_1.z.object({
    page: zod_1.z.number().min(0),
    pageSize: zod_1.z.number().min(0),
});
const validatePaginationQuery = (req, res, next) => {
    try {
        const { page, pageSize } = req.query;
        const parsedContext = paginationQuerySchema.safeParse({
            page: page ? Number(page) : 1,
            pageSize: pageSize ? Number(pageSize) : 10,
        });
        if (!parsedContext.success) {
            throw new Error(`400/Validation error: ${parsedContext.error}`);
        }
        req.validateQuery = parsedContext.data;
        next();
    }
    catch (e) {
        next(e);
    }
};
exports.validatePaginationQuery = validatePaginationQuery;
