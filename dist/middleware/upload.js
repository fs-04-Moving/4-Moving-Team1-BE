"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProfileImage = void 0;
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        // __dirname: /home/ubuntu/4-Moving-Team1-BE/dist/controllers (예시)
        // ../upload → /home/ubuntu/4-Moving-Team1-BE/upload
        const uploadPath = path_1.default.resolve(__dirname, "../upload");
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const extension = file.originalname.split(".").slice(-1)[0];
        cb(null, file.fieldname + "-" + Date.now() + "." + extension);
    },
});
const upload = (0, multer_1.default)({ storage: storage });
exports.uploadProfileImage = upload.single("profileImage");
