import { IFile } from "./file.types";
import { IOrder } from "./order.types";
import { IUser } from "./user.types";

export interface IMessage {
  _id: string;
  message: {
    text?: string;
  };
  files: IFile[];
  sender: IUser | string;
  receiver: IUser | string;
  orderId?: IOrder | string;
  markAsRead?: boolean;
  createdAt: Date;
  updatedAt?: Date;
}
