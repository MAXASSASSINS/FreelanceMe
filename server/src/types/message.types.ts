import { Document, PopulatedDoc } from "mongoose";
import { IFile } from "./file.types";
import { IOrder } from "./order.types";
import { IUser } from "./user.types";

export interface IMessage extends Document {
  message: {
    text?: string;
  };
  files: IFile[];
  sender: PopulatedDoc<IUser & Document>;
  receiver: PopulatedDoc<IUser & Document>;
  orderId?: PopulatedDoc<IOrder & Document>;
  markAsRead?: boolean;
  createdAt: Date;
  updatedAt?: Date;
}
