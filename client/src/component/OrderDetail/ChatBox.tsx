import { useDispatch, useSelector } from "react-redux";
import { updateOrderDetail } from "../../actions/orderAction";
import { useSocket } from "../../context/socketContext";
import { AppDispatch, RootState } from "../../store";
import { IFile } from "../../types/file.types";
import { IMessage } from "../../types/message.types";
import { IUser } from "../../types/user.types";
import { axiosInstance } from "../../utility/axiosInstance";
import { uploadToCloudinaryV2 } from "../../utility/cloudinary";
import { OrderMessageInput } from "./OrderMessageInput";

type ChatBoxProps = {
  setFileLoading: (loading: boolean) => void;
  isDeliveryMessage?: boolean;
  isRevisionMessage?: boolean;
};

type GroupedMessage = IMessage & {
  forDelivery?: boolean;
  forRevision?: boolean;
};

export const ChatBox = ({
  setFileLoading,
  isDeliveryMessage = false,
  isRevisionMessage = false,
}: ChatBoxProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const socket = useSocket();

  const { user } = useSelector((state: RootState) => state.user);

  const { orderDetail } = useSelector((state: RootState) => state.orderDetail);
  if (!orderDetail) return null;

  const sendChat = async (message: string, selectedFiles: File[]) => {
    setFileLoading(true);
    let files: IFile[] = [];
    try {
      // upload files to cloudinary
      files = await sendFileClientCloudinary(selectedFiles);

      let res;
      if (isDeliveryMessage) {
        res = await addDeliveryToOrder(message, files);
        dispatch(updateOrderDetail(res.order));
        const delivery = res.order.deliveries[res.order.deliveries.length - 1];
        const deliveryMessage: GroupedMessage = {
          _id: delivery._id,
          sender: orderDetail.seller,
          receiver: orderDetail.buyer,
          files: delivery.files,
          message: {
            text: delivery.message,
          },
          createdAt: delivery.deliveredAt,
          orderId: orderDetail._id,
          forDelivery: true,
        };
        await handleSendMessageSocket(deliveryMessage, files);
        await socket.emit("update_order_detail", res.order);
      } else if (isRevisionMessage) {
        res = await addRevisionToOrder(message, files);
        dispatch(updateOrderDetail(res.order));
        const revision = res.order.revisions[res.order.revisions.length - 1];
        const revisionMessage: GroupedMessage = {
          _id: revision._id,
          sender: orderDetail.buyer,
          receiver: orderDetail.seller,
          files: revision.files,
          message: {
            text: revision.message,
          },
          createdAt: revision.requestedAt,
          orderId: orderDetail._id,
          forRevision: true,
        };
        await handleSendMessageSocket(revisionMessage, files);
        await socket.emit("update_order_detail", res.order);
      } else {
        res = await addMessageToDatabase(message, files);
        await handleSendMessageSocket(res.newMessage, files);
      }

      // send message to socket
    } catch (error) {
      console.log(error);
    } finally {
      setFileLoading(false);
    }
  };

  // client side uploading to cloudinary
  const sendFileClientCloudinary = async (files: File[]) => {
    try {
      const res = await uploadToCloudinaryV2(files, 5 * 1024 * 1024 * 1024);
      return res;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // add message to database
  const addMessageToDatabase = async (message: string, files: IFile[] = []) => {
    try {
      orderDetail.seller = orderDetail.seller as IUser;
      orderDetail.buyer = orderDetail.buyer as IUser;
      const messageData = {
        message,
        from: user!._id,
        to:
          user!._id === orderDetail.buyer._id
            ? orderDetail.seller._id
            : orderDetail.buyer._id,
        files,
        orderId: orderDetail._id,
      };

      const { data } = await axiosInstance.post(
        `/add/order/message/${orderDetail._id}`,
        messageData
      );
      return data;
    } catch (error) {
      throw error;
    }
  };

  // add delivery to order
  const addDeliveryToOrder = async (message: string, files: IFile[] = []) => {
    try {
      const deliveryData = {
        message,
        files,
      };
      const { data } = await axiosInstance.post(
        `/order/add/delivery/${orderDetail._id}`,
        deliveryData
      );
      //
      return data;
    } catch (error) {
      throw error;
    }
  };

  // add revision to order
  const addRevisionToOrder = async (message: string, files: IFile[] = []) => {
    try {
      const deliveryData = {
        message,
        files,
      };
      const { data } = await axiosInstance.post(
        `/order/add/revision/${orderDetail._id}`,
        deliveryData
      );
      //
      return data;
    } catch (error) {
      throw error;
    }
  };

  const handleSendMessageSocket = async (
    message: GroupedMessage,
    files: IFile[]
  ) => {
    orderDetail.buyer = orderDetail.buyer as IUser;
    orderDetail.seller = orderDetail.seller as IUser;
    const rec =
      user!._id === orderDetail.buyer._id
        ? orderDetail.seller
        : orderDetail.buyer;

    const sender = {
      avatar: user!.avatar,
      name: user!.name,
      _id: user!._id,
    };
    const receiver = {
      avatar: rec.avatar,
      name: rec.name,
      _id: rec._id,
    };

    if (receiver._id !== rec._id) return;

    const messageData = {
      ...message,
      sender,
      receiver,
    };

    await socket.emit("send_message", messageData);
  };

  return (
    <div>
      <OrderMessageInput
        handleSubmissionOfForm={sendChat}
        placeholder={
          isRevisionMessage
            ? "Specifying what you'de like to change will help the seller perfect your project."
            : undefined
        }
      />
    </div>
  );
};
