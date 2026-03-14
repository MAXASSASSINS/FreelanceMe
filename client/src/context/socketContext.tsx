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

const SocketContextProvider = ({
  children,
}: SocketContextProviderProps) => {
  const [socket, setSocket] = useState<Socket>(socketInitialState);

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  useEffect(() => {
    socket.connect();

    return () => {
      // console.log("disconnecting socket");
      socket.disconnect();
    }
  }, [socket])

  useEffect(() => {
    let newSocket: Socket | null = null;
    if (user && isAuthenticated) {
      newSocket = io(baseURL, {
        auth: {
          token: Cookies.get("token"),
        },
        autoConnect: false,
      });
      newSocket.connect();
      setSocket(newSocket);
    }
    return () => {
      // console.log("disconnecting new socket");
      newSocket?.disconnect();
      setSocket(socketInitialState);
    }
  }, [user, isAuthenticated]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};

export default SocketContextProvider;
