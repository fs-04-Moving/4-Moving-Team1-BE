"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIENT_URL = exports.BASE_URL = void 0;
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const error_middleware_1 = require("./middleware/error.middleware");
const routes_1 = __importDefault(require("./routes"));
// export const BASE_URL = 'http://localhost:5050';
exports.BASE_URL = "http://54.180.2.174";
exports.CLIENT_URL = process.env.CLIENT_URL;
const app = (0, express_1.default)();
const port = 5050;
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: ['https://movings.kro.kr'],
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use("/static", express_1.default.static("upload"));
app.use(routes_1.default);
app.use(error_middleware_1.errorHandler);
app.listen(port, () => {
    // console.log(`Server running http://localhost:5050`);
    console.log(`ci/cd 업데이트 완료! Server running at http://54.180.2.174 prisma: http://54.180.2.174:5555`);
});
