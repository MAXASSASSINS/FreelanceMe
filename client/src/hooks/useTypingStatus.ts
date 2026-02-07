import { useEffect, useRef } from "react";
import { useSocket } from "../context/socketContext";
import { IUser, IUserLite } from "../types/user.types";

export const useTypingStatus = (
  receiver: IUserLite | null,
  message: String,
  onTypingChange: (isTyping: boolean) => void
) => {
  const socket = useSocket();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const receiverRef = useRef<IUserLite | null>(receiver)

  useEffect(() => {
    receiverRef.current = receiver
  }, [receiver])

  useEffect(() => {
    if (!receiver) return;

    const receiverUserId = receiver._id.toString();

    if (!isTypingRef.current) {
      socket.emit("typing_started", receiverUserId);
      isTypingRef.current = true;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing_stopped", receiverUserId);
      isTypingRef.current = false;
    }, 2000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, receiver]);

  useEffect(() => {
    const handleTypingStarted = (senderUserId: string) => {
      if (
        receiverRef.current &&
        receiverRef.current._id.toString() === senderUserId
      ) {
        onTypingChange(true);
      }
    };

    const handleTypingStopped = (senderUserId: string) => {
      if (
        receiverRef.current &&
        receiverRef.current._id.toString() === senderUserId
      ) {
        onTypingChange(false);
      }
    };

    socket.on("typing_started_from_server", handleTypingStarted);
    socket.on("typing_stopped_from_server", handleTypingStopped);

    return () => {
      socket.off("typing_started_from_server", handleTypingStarted);
      socket.off("typing_stopped_from_server", handleTypingStopped);
    };
  }, [socket, onTypingChange]);
};
