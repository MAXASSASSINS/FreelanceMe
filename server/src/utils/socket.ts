import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { Socket, Server as SocketIOServer } from "socket.io";
import User from "../models/userModel";
import ErrorHandler from "./errorHandler";

type CustomSocket = Socket & { user?: { id: string } };

const runSocket = (server: HTTPServer) => {

  let onlineUserList = new Map<string, Set<string>>();
  let socketIdtoUserIdMapping = new Map<string, string>();

  const io = new SocketIOServer(server, {
    pingTimeout: 60000,
    pingInterval: 25000,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use((socket: CustomSocket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      // console.log("user", user);
      socket.user = user;
      next();
    } catch (error) {
      socket.user = undefined;
      // console.log("user not authorised");
    }
    next();
  });

  io.on("connection", (socket: CustomSocket) => {
    
    // NO AUTHORISATION REQUIRED EVENTS
    socket.on("get_users_online_status", async (list) => {
      if (list.length == 0) return;
      const onlineStatusList = [];
      for (let id of list) {
        const online = onlineUserList.has(id.toString());
        onlineStatusList.push({
          id,
          online,
        });
      }
      // console.log("emitting users_online_status_from_server");
      socket.emit("users_online_status_from_server", onlineStatusList);
    });


    // AUTHORISATION REQUIRED EVENTS
    if (socket.user?.id) {
      // console.log('i am authorised user');
      const userId = socket.user?.id;
      if (!userId) return;
      addNewUser(userId, socket.id);
      socketIdtoUserIdMapping.set(socket.id, userId);
      // console.log(onlineUserList);

      socket.on("join_room", (data) => {
        socket.join(data);
      });

      socket.on("send_message", async (data) => {
        const { sender, receiver } = data;

        const receiverSocketIds = onlineUserList.get(receiver._id.toString());
        const senderSocketIds = onlineUserList.get(sender._id.toString());

        receiverSocketIds?.forEach((receiverSocketId: string) => {
          io.to(receiverSocketId).emit("receive_message", data);
        });

        senderSocketIds?.forEach((senderSocketId: string) => {
          console.log("senderSocketId", senderSocketId);
          io.to(senderSocketId).emit("receive_message_self", data);
        });
      });

      socket.on("typing_started", (data) => {
        const receiverSocketIds = onlineUserList.get(data.receiverId);

        receiverSocketIds?.forEach((receiverSocketId: string) => {
          socket.to(receiverSocketId).emit("typing_started_from_server", data);
        });
      });
      socket.on("typing_stopped", (data) => {
        const receiverSocketIds = onlineUserList.get(data.receiverId);

        receiverSocketIds?.forEach((receiverSocketId: string) => {
          socket.to(receiverSocketId).emit("typing_stopped_from_server", data);
        });
      });

      socket.on("is_online", (clientId) => {
        const online = onlineUserList.has(clientId);
        const newData = {
          id: clientId,
          online,
        };
        socket.emit("is_online_from_server", newData);
      });

      socket.on("online", async (userId) => {
        if (userId) {
          io.emit("online_from_server", userId);
        }
      });

      socket.on("get_online_status_of_all_clients", async (list) => {
        if (list.length == 0) return;
        const onlineStatusList = [];
        for (let clientId of list) {
          const online = onlineUserList.has(clientId.toString());
          onlineStatusList.push({
            id: clientId,
            online,
          });
        }
        socket.emit(
          "online_status_of_all_clients_from_server",
          onlineStatusList
        );
      });

      socket.on("update_order_detail", async (data) => {
        const receiverSocketIds = onlineUserList.get(
          data.seller._id.toString()
        );
        const senderSocketIds = onlineUserList.get(data.buyer._id.toString());

        receiverSocketIds?.forEach((receiverSocketId: string) => {
          io.to(receiverSocketId).emit("update_order_detail_server", data);
        });

        senderSocketIds?.forEach((senderSocketId: string) => {
          io.to(senderSocketId).emit("update_order_detail_server", data);
        });
      });

      socket.on("disconnect", () => {
        const userId = socketIdtoUserIdMapping.get(socket.id);
        if (!userId) return;
        console.log("user disconnected", userId, socket.id);
        removeUser(socket.id, userId);
        if (!onlineUserList.has(userId)) {
          console.log("user offline", userId);
          Promise.resolve(updateUserLastSeen(userId)).then(() => {
            console.log("emitting offline_from_server");
            io.emit("offline_from_server", userId);
          });
        }
      });
    }

  });

  const addNewUser = (userId: string, socketId: string) => {
    if (!onlineUserList.has(userId)) {
      const set = new Set<string>();
      set.add(socketId);
      onlineUserList.set(userId, set);
    } else {
      const set = onlineUserList.get(userId)!;
      set.add(socketId);
      onlineUserList.set(userId, set);
    }
  };

  const removeUser = async (socketId: string, userId: string) => {
    socketIdtoUserIdMapping.delete(socketId);
    const set = onlineUserList.get(userId);
    if (!set) return;
    set.delete(socketId);
    if (set.size === 0) {
      onlineUserList.delete(userId);
    } else {
      onlineUserList.set(userId, set);
    }
  };

  const updateUserLastSeen = async (userId: string) => {
    try {
      let user = await User.findById(userId);
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

  const joinRoom = async (senderId: string, receiverId: string) => {
    const r = await createRoom(senderId, receiverId);
    // socket.join(r);
  };

  const createRoom = async (senderId: string, receiverId: string) => {
    if (senderId.toString() > receiverId.toString()) {
      return senderId.toString() + "|" + receiverId.toString();
    } else {
      return receiverId.toString() + "|" + senderId.toString();
    }
  };
};

export default runSocket;
