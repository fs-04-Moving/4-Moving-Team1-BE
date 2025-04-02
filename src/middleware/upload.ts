import multer, { StorageEngine } from "multer";

const storage: StorageEngine = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./upload");
  },
  filename: function (req, file, cb) {
    const extension = file.originalname.split(".").slice(-1)[0];
    cb(null, file.fieldname + "-" + Date.now() + "." + extension);
  },
});

const upload = multer({ storage: storage });

export const uploadProfileImage = upload.single("profileImage");
