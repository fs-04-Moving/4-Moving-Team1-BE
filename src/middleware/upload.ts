import path from "path";
import multer, { StorageEngine } from "multer";

const storage: StorageEngine = multer.diskStorage({
  destination: function (req, file, cb) {
    // __dirname: /home/ubuntu/4-Moving-Team1-BE/dist/controllers (예시)
    // ../upload → /home/ubuntu/4-Moving-Team1-BE/upload
    const uploadPath = path.resolve(__dirname, "../upload");
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const extension = file.originalname.split(".").slice(-1)[0];
    cb(null, file.fieldname + "-" + Date.now() + "." + extension);
  },
});

const upload = multer({ storage: storage });

export const uploadProfileImage = upload.single("profileImage");
