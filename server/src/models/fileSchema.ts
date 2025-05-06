import mongoose from "mongoose";
import { IFile } from "../types/file.types";

const fileSchema = new mongoose.Schema<IFile>(
  {
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    blurhash: {
      type: String,
    },
    height: {
      type: Number,
    },
    width: {
      type: Number,
    },
  }
);

export default fileSchema;