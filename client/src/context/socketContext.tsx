import React, { createContext, useContext, useEffect, useState } from "react";
import { RootState } from "../store";
import { useSelector } from "react-redux";
import { baseURL } from "../utility/axiosInstance";
import Cookies from "js-cookie";
import { io, Socket } from "socket.io-client";

type SocketContextProviderProps = {
  children: React.ReactNode;
};

const socketInitialState = io(baseURL, {
  autoConnect: false,
  transports: ["websocket"]
});

const SocketContext = createContext<Socket>(socketInitialState);

const SocketContextProvider = ({ children }: SocketContextProviderProps) => {
  const socket = socketInitialState;

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  useEffect(() => {
    const handleConnect = () => {
      console.log("socket connected");
      if (isAuthenticated) {
        const token = Cookies.get("token");
        if (token) {
          console.log("emitting login after connect");
          socket.emit("login", token);
        }
      }
    };

    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", handleConnect);

    return () => {
      socket.off("connect", handleConnect);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    // console.log("isAuthenticated", isAuthenticated)
    if (!socket.connected) return;
    // console.log("after isAuthenticated", isAuthenticated)

    if (isAuthenticated) {
      const token = Cookies.get("token");
      if (token) {
        // console.log("emitting login event...");
        socket.emit("login", token);
      }
    } else {
      socket.emit("logout");
    }
  }, [isAuthenticated]);

  // temporary useEffect to know connection status
  useEffect(() => {
    const onConnect = () => {
      console.log("✅ socket connected:", socket.id);
    };

    const onDisconnect = (reason: string) => {
      console.log("❌ socket disconnected:", reason);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};

export default SocketContextProvider;
