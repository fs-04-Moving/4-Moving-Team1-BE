import { RequestHandler } from "express";
import { z } from "zod";

const paginationQuerySchema = z.object({
  page: z.number().min(0),
  pageSize: z.number().min(0),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

const validatePaginationQuery: RequestHandler = (req, res, next) => {
  try {
    const { page, pageSize } = req.query as {
      page: string;
      pageSize: string;
    };
    const parsedContext = paginationQuerySchema.safeParse({
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    if (!parsedContext.success) {
      throw new Error(`400/Validation error: ${parsedContext.error}`);
    }
    req.validateQuery = parsedContext.data;
    next();
  } catch (e) {
    next(e);
  }
};

export { validatePaginationQuery };
