import Gig from "../models/gigModel.js"
import User from "../models/userModel.js"
import Message from "../models/messageModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import Features from "../utils/features.js";
import axios from 'axios'
import cloudinary from 'cloudinary'
import fs from "fs"

import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '--' + file.originalname)
    }
})

const upload = multer({ storage: storage }).single("file")


export const addMessage = catchAsyncErrors(async (req, res, next) => {
    const { from, to, message } = req.body;

    await Message.create({
        message: {
            text: message
        },
        users: [from, to],
        sender: from,
        receiver: to,
    });

    res.status(201).json({
        success: true,
        message: "Successfully added your message",
        message,
    })
})

export const getAllMessagesBetweenTwoUsers = catchAsyncErrors(async (req, res, next) => {
    const { from, to } = req.body;


    const messages = await Message.find().or([{ sender: from, receiver: to }, { sender: to, receiver: from }])
        .populate('sender', 'name avatar')
        .populate('receiver', 'name avatar')
        .sort({ updatedAt: 1 });
    // console.log(messages);
    res.status(200).json({
        success: true,
        message: "successfully fetched all messages",
        messages,
    })
})

export const getAllMessagesForCurrentUser = catchAsyncErrors(async (req, res, next) => {
    // const userId = req.user._id;
    const userId = "62c1cb91cba98afc7f33f9a4";

    const messages = await Message.find().or([{ sender: userId }, { receiver: userId }])
        .populate('sender', 'name avatar')
        .populate('receiver', 'name avatar')
        .sort({ updatedAt: -1 })


    const newMessages = messages.map((message) => {
        const from = userId;
        let to = message.sender._id.toString() === userId ? message.receiver._id : message.sender._id;
        const newObj = {
            message,
            from,
            to,
        }
        return newObj;
    })
    // console.log(messages);

    // const groups = [...new Set(messages.map(message => message.sender._id))];

    // newMessages.sort((a, b) => {
    //     const id1 = a.to.toString();
    //     const id2 = b.to.toString();
    //     if (id1 < id2) {
    //         return -1;
    //     }
    //     if (id1 > id2) {
    //         return 1;
    //     }
    //     return 0;
    // })


    const temp = newMessages.map(message => {
        return {
            from: message.from,
            to: message.to
        }
    })

    const temp2 = messages.map(message => {
        return {
            from: message.sender._id,
            to: message.receiver._id
        }
    })


    // const m = newMessages.groupBy(message => {
    //     return message.sender._id;
    // })

    const m = newMessages.reduce((group, message) => {
        const { to } = message;
        group[to] = group[to] ?? [];
        group[to].push(message);
        return group;
    }, {})


    res.status(200).json({
        success: true,
        message: "successfully fetched all messages",
        // messages,
        // newMessages,
        // temp,
        m,
        // temp2,
        // groups,
        // obj,

    })

})

export const getListOfAllInboxClients = catchAsyncErrors(async (req, res, next) => {
    // const userId = "62c1cb91cba98afc7f33f9a4";
    const userId = req.user._id;
    let list = await Message.find().or([{ sender: userId }, { receiver: userId }])
        .populate('sender', 'name avatar')
        .distinct('sender')

    list = list.filter(id => {
        return id.toString() != userId.toString();
    })

    const length = list.length;

    res.status(200).json({
        success: true,
        length,
        list,
    })


})

export const getLastMessageBetweenTwoUser = catchAsyncErrors(async (req, res, next) => {
    const { from, to } = req.body;

    const messages = await Message.find().or([{ sender: from, receiver: to }, { sender: to, receiver: from }])
        .select('message createdAt')
        .sort({ updatedAt: -1 })
        .limit(1)
        .lean()

    // console.log(messages);
    res.status(200).json({
        success: true,
        message: "successfully fetched all messages",
        messages,
    })
})

export const sendFileUpload = catchAsyncErrors(async (req, res, next) => {

    const file = req.file;
    console.log(file);

    const fileType = req.file.mimetype;
    console.log(fileType);

    let fileUrl;
    if (file) {
        let result;
        if (fileType.includes("video")) {
            result = await cloudinary.v2.uploader.upload(file.path, {
                folder: "FreelanceMe",
                resource_type: "video",
                chunk_size: 6000000, 
            })
                .catch(err => {
                    console.log(err);
                })
        }
        else {

            result = await cloudinary.v2.uploader.upload(file.path, {
                folder: "FreelanceMe",
            })
                .catch(err => {
                    console.log(err);
                })
        }

        fileUrl = {
            public_id: result.public_id,
            url: result.secure_url,
        }
    }

    console.log(file.path);
    fs.unlink(file.path, err => {
        if (err) return new ErrorHandler("error in deleting a file from uploads", 500);
    })

    res.status(200).json({
        success: true,
        message: "Successfully uploaded on cloudinary",
        fileUrl,
        fileType,
    })
})


export const updateAllMessages = catchAsyncErrors(async (req, res, next) => {

    const messages = await Message.find();
    console.log(messages);

    await Message.updateMany({}, {
        messageType: "text"
    })

    res.status(200).json({
        message: "successfully done"
    })
})


