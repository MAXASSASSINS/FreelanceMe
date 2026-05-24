import cloudinary from "cloudinary";
import fs from "fs";
import multer from "multer";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import Message from "../models/messageModel";
import Order from "../models/orderModel";
import ErrorHandler from "../utils/errorHandler";
import { IUser } from "../types/user.types";
import mongoose from "mongoose";
import { IMessage } from "../types/message.types";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "--" + file.originalname);
  },
});

const upload = multer({ storage: storage }).single("file");

export const addMessage = catchAsyncErrors(async (req, res, next) => {
  const { from, to, message, files, orderId } = req.body;

  if (!from || !to) {
    return next(new ErrorHandler("Please provide all the fields", 400));
  }

  if (!message && !files) {
    return next(new ErrorHandler("Please provide a message or a file", 400));
  }

  if (message?.length == 0 && files?.length === 0) {
    return next(
      new ErrorHandler("Please enter a message or upload a file", 400)
    );
  }

  if (from.toString() === to.toString()) {
    return next(new ErrorHandler("You can't send message to yourself", 400));
  }

  const newMessage = await Message.create({
    message: {
      text: message,
    },
    sender: from,
    receiver: to,
    files,
    orderId,
  });

  res.status(201).json({
    success: true,
    message: "Successfully added your message",
    newMessage,
  });
});

export const addOrderMessage = catchAsyncErrors(async (req, res, next) => {
  const { from, to, message, files, orderId } = req.body;

  if (!from || !to || !orderId) {
    return next(new ErrorHandler("Please provide all the fields", 400));
  }

  if (!message && !files) {
    return next(new ErrorHandler("Please provide a message or a file", 400));
  }

  const order = await Order.findById(orderId);

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  if (
    order.status === "Completed" ||
    order.status === "Pending" ||
    order.status === "Cancelled"
  ) {
    return next(
      new ErrorHandler(
        "Order is either not started or completed or cancelled",
        400
      )
    );
  }

  if (message?.length == 0 && files?.length === 0) {
    return next(
      new ErrorHandler("Please enter a message or upload a file", 400)
    );
  }

  if (from.toString() === to.toString()) {
    return next(new ErrorHandler("You can't send message to yourself", 400));
  }

  const newMessage = await Message.create({
    message: {
      text: message,
    },
    sender: from,
    receiver: to,
    files,
    orderId,
  });

  res.status(201).json({
    success: true,
    message: "Successfully added your message",
    newMessage,
  });
});

export const getAllMessagesBetweenTwoUsers = catchAsyncErrors(
  async (req, res, next) => {
    const { from, to } = req.body;

    if (!from || !to) {
      return next(new ErrorHandler("Please provide both from and to", 400));
    }

    const messages = await Message.find()
      .or([
        { sender: from, receiver: to },
        { sender: to, receiver: from },
      ])
      .and([{ orderId: null }])
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar")
      .sort({ updatedAt: 1 });
    //
    res.status(200).json({
      success: true,
      message: "successfully fetched all messages",
      messages,
    });
  }
);

export const getAllMessagesForCurrentUser = catchAsyncErrors(
  async (req, res, next) => {
    const userId = req.user!._id;

    const messages = await Message.find()
      .or([{ sender: userId }, { receiver: userId }])
      .and([{ orderId: null }])
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar")
      .sort({ updatedAt: -1 });

    const newMessages = messages.map((message) => {
      const from = userId;
      let to =
        message.sender._id.toString() === userId
          ? message.receiver._id
          : message.sender._id;
      const newObj = {
        message,
        from,
        to,
      };
      return newObj;
    });

    interface GroupedMessages {
      [key: string]: {
        message: IMessage;
        from: string;
        to: string;
      }[];
    }

    const m = newMessages.reduce<GroupedMessages>((group, message) => {
      const { to } = message;
      group[to] = group[to] ?? [];
      group[to].push(message);
      return group;
    }, {});

    res.status(200).json({
      success: true,
      message: "successfully fetched all messages",
      m,
    });
  }
);

export const getListOfAllInboxClients = catchAsyncErrors(
  async (req, res, next) => {
    const userId = req.user!._id;

    let list = await Message.find()
      .or([{ sender: userId }, { receiver: userId }])
      .and([{ orderId: null }])
      .select("sender receiver");
    let set = new Set<mongoose.Types.ObjectId>();
    list.forEach((message) => {
      set.add(message.sender.toString());
      set.add(message.receiver.toString());
    });

    console.log(set.size);

    let listOfInboxClients = [...set];

    listOfInboxClients = listOfInboxClients.filter((id) => {
      return id.toString() != userId.toString();
    });

    const length = listOfInboxClients.length;

    res.status(200).json({
      success: true,
      length,
      listOfInboxClients,
    });
  }
);

export const getLastMessageBetweenTwoUser = catchAsyncErrors(
  async (req, res, next) => {
    const { from, to } = req.body;

    if (!from || !to) {
      return next(new ErrorHandler("Please provide both from and to", 400));
    }

    const messages = await Message.find()
      .or([
        { sender: from, receiver: to },
        { sender: to, receiver: from },
      ])
      .and([{ orderId: null }])
      .select("message files createdAt")
      .sort({ updatedAt: -1 })
      .limit(1)
      .lean();

    //
    res.status(200).json({
      success: true,
      message: "successfully fetched all messages",
      messages,
    });
  }
);

export const getInitialMessagesForInbox = catchAsyncErrors(
  async (req, res, next) => {
    const userId = req.user?.id;

    let list = await Message.find()
      .or([{ sender: userId }, { receiver: userId }])
      .and([{ orderId: null }])
      .populate("sender receiver", "name avatar lastSeen");

    let set = new Set<string>();
    list.forEach((message) => {
      set.add(message.sender._id.toString());
      set.add(message.receiver._id.toString());
    });
    set.delete(userId);

    const lastMessages: Map<string, IMessage> = new Map();
    for (let clientId of set) {
      for (let message of list) {
        if (
          message.sender._id.toString() !== clientId &&
          message.receiver._id.toString() !== clientId
        )
          continue;
        if (
          !lastMessages.has(clientId) ||
          message.createdAt > lastMessages.get(clientId)!.createdAt
        ) {
          lastMessages.set(clientId, message);
        }
      }
    }

    const inboxClientsDetails: Map<string, IUser> = new Map();
    for (const clientId of lastMessages.keys()) {
      const message = lastMessages.get(clientId)!;
      
      // Determine whether to use sender or receiver
      if (message.sender._id.toString() === clientId) {
        inboxClientsDetails.set(clientId, message.sender);
      } else {
        inboxClientsDetails.set(clientId, message.receiver);
      }
    }

    res.status(200).json({
      success: true,
      inboxClients: [...set],
      lastMessages: [...lastMessages],
      inboxClientsDetails: [...inboxClientsDetails],
      // list,
    });
  }
);

export const sendFileUpload = catchAsyncErrors(async (req, res, next) => {
  const file = req.file;
  //

  const fileType = req.file?.mimetype;

  let fileUrl;
  if (file) {
    let result;
    if (fileType?.includes("video")) {
      result = await cloudinary.v2.uploader.upload_large(
        file.path,
        {
          folder: "FreelanceMe",
          resource_type: "video",
          chunk_size: 6000000,
        },
        (err, result) => {
          if (err) {
            console.log(err);
          }
        }
      );
    } else {
      result = await cloudinary.v2.uploader
        .upload(file.path, {
          folder: "FreelanceMe",
        })
        .catch((err) => {
          console.log(err);
        });
    }

    // fileUrl = {
    //   public_id: result.public_id,
    //   url: result.secure_url,
    // };
    //
  }

  //
  fs.unlink(file?.path!, (err) => {
    if (err)
      return new ErrorHandler("error in deleting a file from uploads", 500);
  });

  res.status(200).json({
    success: true,
    message: "Successfully uploaded on cloudinary",
    fileUrl,
    fileType,
  });
});

export const updateAllMessages = catchAsyncErrors(async (req, res, next) => {
  const messages = await Message.find();

  await Message.updateMany(
    {},
    {
      messageType: "text",
    }
  );

  res.status(200).json({
    message: "successfully done",
  });
});

export const deleteAllMessages = catchAsyncErrors(async (req, res, next) => {
  await Message.deleteMany({});

  res.status(200).json({
    message: "successfully deleted",
  });
});

export const getAllOrderMessages = catchAsyncErrors(async (req, res, next) => {
  const orderId = req.params.id;

  const messages = await Message.find({ orderId })
    .populate("sender", "name avatar")
    .populate("receiver", "name avatar");

  res.status(200).json({
    success: true,
    messages,
  });
});
