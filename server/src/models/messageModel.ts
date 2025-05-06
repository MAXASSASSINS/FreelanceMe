import mongoose from "mongoose";
import { IMessage } from "../types/message.types";
import fileSchema from "./fileSchema";

const messageSchema = new mongoose.Schema<IMessage>(
  {
    message: {
      text: {
        type: String,
      },
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    files: [fileSchema],
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    markAsRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMessage>("Message", messageSchema);
