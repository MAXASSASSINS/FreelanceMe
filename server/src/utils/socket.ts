import { Server as SocketIOServer, Socket } from "socket.io";
import User from "../models/userModel";
import ErrorHandler from "./errorHandler";
import { Server as HTTPServer } from "http";
import { log } from "console";
import jwt from "jsonwebtoken";
import { arch } from "os";
import { send } from "process";
import { IMessage } from "../types/message.types";

type CustomSocket = Socket & { user?: { id: string } };
type AuthSocket = Socket & { user: { id: string } };
interface AuthTokenPayload extends jwt.JwtPayload {
  id: string;
}

const runSocket = (server: HTTPServer) => {
  const io = new SocketIOServer(server, {
    transports: ["websocket"],
    cors: {
      origin: true,
      credentials: true,
    },
  });

  let onlineUserList = new Map();

  // handling idle connections cleanup
  setInterval(() => {
    for (const [userId, socketSet] of onlineUserList.entries()) {
      for (const socketId of socketSet) {
        if (!io.sockets.sockets.has(socketId)) {
          socketSet.delete(socketId);
        }
      }

      if (socketSet.size === 0) {
        onlineUserList.delete(userId);
      }
    }
  }, 60_000);

  io.on("connection", (socket: CustomSocket) => {
    socket.user = undefined;

    socket.on("login", (token: string) => {
      console.log("login event");
      try {
        const payload = jwt.verify(
          token,
          process.env.JWT_SECRET!
        ) as AuthTokenPayload;

        if (!payload.id) {
          throw new Error("Invalid token payload");
        }

        if (socket.user) {
          io.emit("online_from_server", socket.user.id);
        }

        // If already logged in as SAME user -> ignore
        if (socket.user?.id === payload.id) return;

        // If logged in as DIFFERENT user -> clean up first
        if (socket.user && socket.user.id !== payload.id) {
          removeUserSocket(socket.id, socket.user.id);
        }

        socket.user = { id: payload.id };

        io.emit("online_from_server", socket.user.id);
        addNewUser(payload.id, socket.id);
        console.log(onlineUserList);
        const roomId = getUserRoomId(socket.user.id);
        socket.join(roomId);
      } catch {
        socket.disconnect();
      }
    });

    socket.on("logout", () => {
      console.log("logout event");
      const userId = socket.user?.id;
      if (socket.user) {
        removeUser(socket.user.id);
        socket.user = undefined;
      }
      if (userId) io.emit("offline_from_server", userId);
      console.log(onlineUserList);
    });

    socket.on("get_users_online_status", (userIds: String[]) => {
      const onlineStatusList = userIds.map((userId) => ({
        userId,
        isOnline: onlineUserList.has(userId),
      }));
      socket.emit("online_user_snapshot", onlineStatusList);
    });

    socket.on(
      "join_room",
      requireAuth(socket, (authSocket, receiverUserId) => {
        const senderId = authSocket.user.id;
        const roomId = getRoomId(senderId, receiverUserId);
        console.log("joined room", roomId);
        authSocket.join(roomId);
      })
    );

    socket.on(
      "send_message",
      requireAuth(socket, (authSocket, messageData: IMessage) => {
        console.log("inside send_message", messageData)
        const sender = authSocket.user.id;
        const {receiver} = messageData
        const newMessageData = {
          ...messageData,
          sender,
        }
        const roomId = getRoomId(sender, receiver);
        io.to(roomId).emit("receive_message", newMessageData);
      })
    );

    socket.on(
      "typing_started",
      requireAuth(socket, (authSocket, receiverUserId) => {
        const roomId = getUserRoomId(receiverUserId);
        authSocket
          .to(roomId)
          .emit("typing_started_from_server", authSocket.user.id);
      })
    );

    socket.on(
      "typing_stopped",
      requireAuth(socket, (authSocket, receiverUserId) => {
        const roomId = getUserRoomId(receiverUserId);
        authSocket
          .to(roomId)
          .emit("typing_stopped_from_server", authSocket.user.id);
      })
    );

    socket.on("is_online", (clientId) => {
      const online = onlineUserList.has(clientId);
      const newData = {
        id: clientId,
        online,
      };
      socket.emit("is_online_from_server", newData);
    });

    socket.on("get_online_status_of_all_clients", (list) => {
      if (list.length == 0) return;
      const onlineStatusList = [];
      for (let clientId of list) {
        const isOnline = onlineUserList.has(clientId.toString());
        onlineStatusList.push({
          userId: clientId,
          isOnline,
        });
      }
      socket.emit("online_status_of_all_clients_from_server", onlineStatusList);
    });

    socket.on("update_order_detail", (data) => {
      const receiverSocketIds = onlineUserList.get(data.seller._id.toString());
      const senderSocketIds = onlineUserList.get(data.buyer._id.toString());

      receiverSocketIds?.forEach((receiverSocketId: string) => {
        io.to(receiverSocketId).emit("update_order_detail_server", data);
      });

      senderSocketIds?.forEach((senderSocketId: string) => {
        io.to(senderSocketId).emit("update_order_detail_server", data);
      });
    });

    socket.on("disconnect", () => {
      const userId = getUserBySocketId(socket.id);
      // console.log("user disconnected", userId, socket.id);
      removeUserSocket(userId, socket.id);

      if (!onlineUserList.has(userId)) {
        Promise.resolve(updateUserLastSeen(userId)).then(() => {
          io.emit("offline_from_server", userId);
        });
      }
    });
  });

  const addNewUser = (userId: string, socketId: string) => {
    if (!onlineUserList.has(userId)) {
      const set = new Set();
      set.add(socketId);
      onlineUserList.set(userId, set);
    } else {
      const set = onlineUserList.get(userId);
      set.add(socketId);
      onlineUserList.set(userId, set);
    }
  };

  const removeUserSocket = (socketId: string, userId?: string) => {
    if (!userId) return;

    const set = onlineUserList.get(userId);

    if (!set) return;
    set.delete(socketId);
    if (set.size === 0) {
      onlineUserList.delete(userId);
    } else {
      onlineUserList.set(userId, set);
    }
  };

  const removeUser = (userId?: string) => {
    if (!userId) return;
    onlineUserList.delete(userId);
  };

  const getUserBySocketId = (socketId: string) => {
    for (let [key, value] of onlineUserList.entries()) {
      if (value.has(socketId)) {
        return key;
      }
    }
  };

  const updateUserLastSeen = async (userId: string) => {
    try {
      let user = await User.findById(userId);
      //
      if (!user) {
        return new ErrorHandler("User not found", 404);
      }
      await User.findByIdAndUpdate(
        userId,
        { lastSeen: Date.now() },
        {
          new: true,
          runValidators: true,
          useFindandModify: false,
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const requireAuth =
    (
      socket: CustomSocket,
      handler: (socket: AuthSocket, ...args: any[]) => void
    ) =>
    (...args: any[]) => {
      if (!socket.user) return;
      handler(socket as AuthSocket, ...args);
    };

  const getRoomId = (userId1: String, userId2: String) => {
    if (userId1 < userId2) return userId1 + "__" + userId2;
    return userId2 + "__" + userId1;
  };

  const getUserRoomId = (userId: String) => {
    const roomId = "userId:" + userId;
    return roomId;
  };
};

export default runSocket;
