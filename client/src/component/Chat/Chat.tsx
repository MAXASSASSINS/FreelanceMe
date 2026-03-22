import "moment-timezone";
import {
  Dispatch,
  MouseEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState
} from "react";
import { IoClose } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/socketContext";
import useLazyLoading from "../../hooks/useLazyLoading";
import { RootState } from "../../store";
import { IMessage } from "../../types/message.types";
import { IUser } from "../../types/user.types";
import { axiosInstance } from "../../utility/axiosInstance";
import { Avatar } from "../Avatar/Avatar";
import { DataSendingLoading } from "../DataSendingLoading";
import ChatForm, { ChatFormRef } from "./ChatForm";
import ChatMessageList from "./ChatMessageList";

type ChatProps = {
  chatUser: IUser;
  showChatBox: boolean;
  setShowChatBox: Dispatch<SetStateAction<boolean>>;
};

export const Chat = ({ chatUser, showChatBox, setShowChatBox }: ChatProps) => {
  const navigate = useNavigate();
  const socket = useSocket();

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  // All States
  const chatFormRef = useRef<ChatFormRef>(null);
  const [allMessages, setAllMessages] = useState<IMessage[]>([]);
  const [fileLoading, setFileLoading] = useState(false);
  const [online, setOnline] = useState(false);
  const [typing, setTyping] = useState(false);

  // All References
  const suggestionRef1 = useRef<HTMLLIElement>(null);
  const suggestionRef2 = useRef<HTMLLIElement>(null);
  const suggestionRef3 = useRef<HTMLLIElement>(null);
  const scrollToBottomDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      socket.emit("is_online", chatUser._id.toString());
    }
  }, [user, isAuthenticated, socket, chatUser._id, navigate]);

  useEffect(() => {
    user && getAllMessagesBetweenTwoUser();
  }, [user]);

  const showSuggestion = () => {
    if (suggestionRef1.current?.classList.contains("hidden")) {
      suggestionRef1.current?.classList.remove("hidden");
    }
    if (suggestionRef2.current?.classList.contains("hidden")) {
      suggestionRef2.current?.classList.remove("hidden");
    }
    if (suggestionRef3.current?.classList.contains("hidden")) {
      suggestionRef3.current?.classList.remove("hidden");
    }
  };

  // MESSAGE SCROLL DOWN TO BOTTOM EFFECT
  useEffect(() => {
    scrollToBottomDivRef.current?.scrollIntoView();
  }, [allMessages]);

  // LAZY LOADING THE IMAGES AND VIDEOS
  useLazyLoading({ dependencies: [fileLoading, allMessages] });

  // CHECKING FOR ONLINE STATUS OF GIG SELLER
  useEffect(() => {
    socket.on("is_online_from_server", (data) => {
      const onlineClientId = data.id.toString();

      if (onlineClientId === chatUser._id.toString()) {
        setOnline(data.online);
      }
    });

    return () => {
      socket.off("is_online_from_server");
      // setCurrentSelectedClientOnline(false);
    };
  }, [socket, online, chatUser._id]);

  useEffect(() => {
    socket.on("online_from_server", async (userId) => {
      if (userId === chatUser._id.toString()) {
        setOnline(true);
      }
    });
    socket.on("offline_from_server", async (userId) => {
      if (userId === chatUser._id.toString()) {
        setOnline(false);
      }
    });
    return () => {
      socket.off("online_from_server");
      socket.off("offline_from_server");
    };
  }, [socket, chatUser._id]);

  useEffect(() => {
    socket.on("receive_message", async (data) => {
      if (data.orderId) return;

      const messageData = data;
      setAllMessages((prev) => [...prev, messageData]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [socket, allMessages, fileLoading]);

  // CHECKING FOR RECEIVING MESSAGES SELF
  useEffect(() => {
    socket.on("receive_message_self", async (data) => {
      if (data.orderId) return;

      const messageData = data;
      setAllMessages((prev) => [...prev, messageData]);
    });

    return () => {
      socket.off("receive_message_self");
    };
  }, [socket, allMessages, fileLoading]);

  useEffect(() => {
    socket.on("typing_started_from_server", (data) => {
      if (chatUser._id.toString() === data.senderId.toString()) {
        setTyping(true);
      }
    });
    socket.on("typing_stopped_from_server", (data) => {
      setTyping(false);
    });

    return () => {
      socket.off("typing_started_from_server");
      socket.off("typing_stopped_from_server");
    };
  }, [socket, chatUser._id]);

  const getAllMessagesBetweenTwoUser = async () => {
    const postData = {
      from: user!._id,
      to: chatUser._id,
    };
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const { data } = await axiosInstance.post(
      "/get/all/messages/between/two/users",
      postData,
      config
    );
    const messages = data.messages;
    setAllMessages(messages);
    scrollToBottomDivRef.current?.scrollIntoView();
  };

  const handleChatSuggestion = (e: MouseEvent<HTMLLIElement>) => {
    const target = e.target as HTMLLIElement;
    target.classList.add("hidden");
    const suggestion = target.textContent!;
    chatFormRef.current?.addSuggestion(suggestion);
  };

  const checkUserOpenItsOwnGig = () => {
    if (user?._id === chatUser._id) {
      setOnline(true);
      return true;
    }
    return false;
  };

  useEffect(() => {
    checkUserOpenItsOwnGig();
  }, [user, chatUser]);

  useEffect(() => {
    if (showChatBox) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showChatBox]);

  return (
    <div
      className="fixed z-[99] w-full h-full overflow-auto bg-[rgba(0,0,0,0.4)]  inset-0"
      style={{ display: showChatBox ? "block" : "none" }}
    >
      <div className="bg-[#fefefe] w-full h-screen absolute mx-auto flex flex-col inset-0 sm:w-[600px] sm:h-[90vh] my-auto">
        {/* HEADER  */}
        <section className="flex items-center py-8 px-6 h-[113px]">
          <div className="w-12 rounded-full mr-4">
            <Avatar
              avatarUrl={chatUser.avatar?.url}
              userName={chatUser.name}
              width="3rem"
              fontSize="1.3rem"
            />
          </div>
          <div>
            <div className="font-bold text-lg">Message {chatUser.name}</div>
            <div
              className={`text-sm ${online ? "text-primary" : "text-no_focus"}`}
            >
              {typing ? "typing..." : online ? "online" : "away"}
            </div>
          </div>
          <span onClick={() => setShowChatBox(false)}>
            <IoClose className="absolute right-8 top-11 text-2xl text-no_focus hover:cursor-pointer" />
          </span>
        </section>

        <DataSendingLoading
          pos="absolute"
          show={fileLoading}
          finishedLoading={!fileLoading}
          loadingText={"Sending message..."}
        />

        {/* MESSAGES + SUGGESTIONS */}
        <section className="relative flex-grow overflow-hidden border-t-no_focus flex flex-col justify-between border-t border-solid">
          {!allMessages?.length || checkUserOpenItsOwnGig() ? (
            <div className="overflow-scroll">
              <ul className="py-4 px-6">
                <li
                  ref={suggestionRef1}
                  onClick={(e) => handleChatSuggestion(e)}
                  className={`text-[0.9rem] gap-1" p-3 border border-dark_separator mb-4 rounded text-dark_grey hover:bg-dark_separator hover:cursor-pointer max-w-max`}
                >
                  &#128075; Hey! {chatUser.name}, can you help me with...
                </li>
                <li
                  ref={suggestionRef2}
                  onClick={(e) => handleChatSuggestion(e)}
                  className={`text-[0.9rem] gap-1" p-3 border border-dark_separator mb-4 rounded text-dark_grey hover:bg-dark_separator hover:cursor-pointer max-w-max`}
                >
                  Do you have any experience with...
                </li>
                <li
                  ref={suggestionRef3}
                  onClick={(e) => handleChatSuggestion(e)}
                  className={`text-[0.9rem] gap-1" p-3 border border-dark_separator mb-4 rounded text-dark_grey hover:bg-dark_separator hover:cursor-pointer max-w-max`}
                >
                  Do you think you can deliver your order by...
                </li>
              </ul>
            </div>
          ) : (
            <div className="overflow-scroll pt-4 px-4">
              <ChatMessageList chatMessages={allMessages} />
              <div ref={scrollToBottomDivRef}></div>
            </div>
          )}
        </section>

        {/* CHAT FORM */}
        <ChatForm
          chatUser={chatUser}
          scrollToBottomDivRef={scrollToBottomDivRef}
          setFileLoading={setFileLoading}
          showSuggestion={showSuggestion}
          ref={chatFormRef}
        />
      </div>
    </div>
  );
};
