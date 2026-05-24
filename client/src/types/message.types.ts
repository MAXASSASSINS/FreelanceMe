import { IFile } from "./file.types";
import { IOrder } from "./order.types";
import { IUserLite } from "./user.types";

export interface IMessage {
  _id: string;
  message: {
    text?: string;
  };
  files: IFile[];
  sender: IUserLite | string;
  receiver: IUserLite | string;
  orderId?: IOrder | string;
  markAsRead?: boolean;
  createdAt: Date;
  updatedAt?: Date;
}
