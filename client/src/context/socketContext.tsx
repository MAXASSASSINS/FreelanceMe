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
});

const SocketContext = createContext<Socket>(socketInitialState);

const SocketContextProvider = ({ children }: SocketContextProviderProps) => {
  const socket = socketInitialState;

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  useEffect(() => {
    if (!socket.connected){
      console.log("connecting to socket...")
      socket.connect();
    }

    return () => {
      console.log("disconnecting socket...")
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket.connected) return;

    if (isAuthenticated) {
      const token = Cookies.get("token");
      if (token){
        console.log("emitting login event...")
        socket.emit("login", token);
      }
    } else {
      socket.emit("logout");
    }
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};

export default SocketContextProvider;
