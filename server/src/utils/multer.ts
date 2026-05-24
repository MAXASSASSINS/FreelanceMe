import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "--" + file.originalname);
  },
});

export const uploadSingleFile = multer({ storage: storage }).single(
  "fileUpload"
);
export const uploadMultipleFiles = multer({ storage: storage }).array(
  "fileUploads"
);
