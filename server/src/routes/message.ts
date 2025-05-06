import express from "express";
import {
  addMessage,
  addOrderMessage,
  deleteAllMessages,
  getAllMessagesBetweenTwoUsers,
  getAllMessagesForCurrentUser,
  getAllOrderMessages,
  getInitialMessagesForInbox,
  getLastMessageBetweenTwoUser,
  getListOfAllInboxClients,
  sendFileUpload,
  updateAllMessages,
} from "../controllers/messageController";
import { isAuthenticated } from "../middleware/auth";
import { uploadSingleFile } from "../utils/multer";
import { sendSMS } from "../utils/twilio";

const router = express.Router();

router.post("/add/message", isAuthenticated, addMessage);
router.post("/add/order/message/:id", isAuthenticated, addOrderMessage);

router.post(
  "/get/all/messages/between/two/users",
  isAuthenticated,
  getAllMessagesBetweenTwoUsers
);
router.get(
  "/get/all/messages/for/current/user",
  isAuthenticated,
  getAllMessagesForCurrentUser
);
router.get(
  "/list/of/all/inbox/clients/for/current/user",
  isAuthenticated,
  getListOfAllInboxClients
);
router.post(
  "/get/last/message/between/two/user",
  isAuthenticated,
  getLastMessageBetweenTwoUser
);
router.post("/send/files", isAuthenticated, uploadSingleFile, sendFileUpload);

router.delete("/delete/messages", deleteAllMessages);

router.post("/add/file", isAuthenticated, uploadSingleFile, (req, res) => {
  res.send("file uploaded successfully");
});

router.get("/update/all/messages", updateAllMessages);

router.post("/send/SMS", sendSMS);

router.get("/message/order/:id", isAuthenticated, getAllOrderMessages);

router.get(
  "/get/initial/messages",
  isAuthenticated,
  getInitialMessagesForInbox
);

export default router;
