import PermMediaIcon from "@mui/icons-material/PermMedia";
import "moment-timezone";
import { useContext, useEffect, useReducer, useRef, useState } from "react";
import Moment from "react-moment";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { windowContext } from "../App";
import { axiosInstance } from "../utility/axiosInstance";
import { Loader } from "../component/Loader/Loader";
import {
  FETCH_ALL_CHATS_WITH_CLIENT,
  FETCH_ALL_CLIENTS_DETAILS,
  FETCH_ALL_CLIENTS_LAST_MESSAGE,
  FETCH_ALL_CLIENTS_LIST,
  UPDATE_ALL_CHATS_WITH_CLIENT,
  UPDATE_CLIENT_LAST_MESSAGE,
  UPDATE_ONLINE_STATUS_OF_CLIENTS,
} from "../component/Inbox/inboxConstant";
import {
  INBOX_DETAILS_INITIAL_STATE,
  InboxMessageState,
  inboxReducer,
} from "../component/Inbox/inboxReducer";

import { BiChevronLeft } from "react-icons/bi";
import { FaSearch } from "react-icons/fa";
import { useUpdateGlobalLoading } from "../context/globalLoadingContext";
import useLazyLoading from "../hooks/useLazyLoading";
import { RootState } from "../store";
import { IMessage } from "../types/message.types";
import { IUser } from "../types/user.types";
import { Avatar } from "../component/Avatar/Avatar";
import ChatForm, { ChatFormRef } from "../component/Chat/ChatForm";
import ChatMessageList from "../component/Chat/ChatMessageList";
import { DataSendingLoading } from "../component/DataSendingLoading";
import { useSocket } from "../context/socketContext";

export const Inbox = () => {
  const { windowWidth } = useContext(windowContext);
  const socket = useSocket();
  const updateGlobalLoading = useUpdateGlobalLoading();

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  const chatFormRef = useRef<ChatFormRef>(null);
  const [search, setSearch] = useState("");
  const [searchList, setSearchList] = useState<string[]>([]);

  const [inboxDetails, dispatch] = useReducer(
    inboxReducer,
    INBOX_DETAILS_INITIAL_STATE
  );

  const {
    listOfAllClients,
    inboxMessages,
    allClientUserLastMessage,
    allClientsDetails,
    onlineStatusOfClients,
  }: InboxMessageState = inboxDetails;

  const [inboxMessagesLoading, setInboxMessagesLoading] = useState(false);

  const [typing, setTyping] = useState(false);

  const [hideMessageListOnSmallDevices, setHideMessageListOnSmallDevices] =
    useState(true);

  const [currentSelectedClient, setCurrentSelectedClient] =
    useState<IUser | null>(null);
  const [currentSelectedClientOnline, setCurrentSelectedClientOnline] =
    useState(false);

  const scrollToBottomDivRefInbox = useRef<HTMLDivElement>(null);

  const [fileLoading, setFileLoading] = useState(false);

  // SEARCH FUNCTIONALITY
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!search) {
        setSearchList([]);
        return;
      }
      const keysArray = Array.from(allClientsDetails.keys());
      const list =
        keysArray.length > 0
          ? keysArray.filter((key) => {
              const client = allClientsDetails.get(key);
              return client?.name.startsWith(search);
            })
          : [];
      console.log(list);
      setSearchList(list);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, allClientsDetails]);

  // GET LOGGED IN USER AND FETCH LIST OF ALL CLIENTS IF LOGGED IN
  useEffect(() => {
    if (isAuthenticated && user) getInitialInboxMessages();
  }, [isAuthenticated, user]);

  const getInitialInboxMessages = async () => {
    updateGlobalLoading(true);
    try {
      const { data } = await axiosInstance.get("/get/initial/messages");
      console.log(data);
      dispatch({ type: FETCH_ALL_CLIENTS_LIST, payload: data.inboxClients });
      dispatch({
        type: FETCH_ALL_CLIENTS_DETAILS,
        payload: data.inboxClientsDetails,
      });
      dispatch({
        type: FETCH_ALL_CLIENTS_LAST_MESSAGE,
        payload: data.lastMessages,
      });
    } catch (error) {
      console.log(error);
    } finally {
      updateGlobalLoading(false);
    }
  };

  // LAZY LOADING THE IMAGES AND VIDEOS
  useLazyLoading({ dependencies: [fileLoading, inboxMessages] });

  const getAllMessagesBetweenTwoUser = async (clientId: string) => {
    const postData = {
      from: user!._id,
      to: clientId,
    };
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    setInboxMessagesLoading(true);
    const { data } = await axiosInstance.post(
      "/get/all/messages/between/two/users",
      postData,
      config
    );
    const messages = data.messages;
    dispatch({ type: FETCH_ALL_CHATS_WITH_CLIENT, payload: messages });
    setInboxMessagesLoading(false);
    scrollToBottomDivRefInbox.current?.scrollIntoView();
  };

  // // MESSAGE SCROLL DOWN TO BOTTOM EFFECT
  useEffect(() => {
    scrollToBottomDivRefInbox.current?.scrollIntoView();
  }, [inboxMessages]);

  useEffect(() => {
    socket.on("typing_started_from_server", (data) => {
      if (
        currentSelectedClient &&
        currentSelectedClient._id.toString() === data.senderId.toString()
      ) {
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
  }, [socket, currentSelectedClient]);

  // SHOW ONLINE STATUS OF ALL CLIENTS + CURRENTLY SELECTED CLIENT
  useEffect(() => {
    if (isAuthenticated && user!._id)
      socket.emit("online", user!._id.toString());
  }, [user, isAuthenticated, socket]);

  useEffect(() => {
    socket.emit("get_online_status_of_all_clients", listOfAllClients || []);
  }, [listOfAllClients, socket]);

  useEffect(() => {
    socket.on(
      "online_status_of_all_clients_from_server",
      (data: { id: string; online: boolean }[]) => {
        const temp = new Map();
        data.forEach(({ id, online }) => {
          temp.set(id, online);
        });
        dispatch({ type: UPDATE_ONLINE_STATUS_OF_CLIENTS, payload: temp });
      }
    );

    return () => {
      socket.off("online_status_of_all_clients_from_server");
    };
  }, [socket, listOfAllClients]);

  useEffect(() => {
    socket.on("online_from_server", async (userId) => {
      if (
        currentSelectedClient &&
        currentSelectedClient._id.toString() === userId
      ) {
        setCurrentSelectedClientOnline(true);
      }
      const map = new Map(onlineStatusOfClients);
      if (map.has(userId)) {
        map.set(userId, true);
        dispatch({ type: UPDATE_ONLINE_STATUS_OF_CLIENTS, payload: map });
      }
    });

    socket.on("offline_from_server", async (userId) => {
      if (
        currentSelectedClient &&
        currentSelectedClient._id.toString() === userId
      ) {
        setCurrentSelectedClientOnline(false);
      }
      const map = new Map(onlineStatusOfClients);
      if (map.has(userId)) {
        map.set(userId, false);
        dispatch({ type: UPDATE_ONLINE_STATUS_OF_CLIENTS, payload: map });
      }
    });
    return () => {
      socket.off("online_from_server");
      socket.off("offline_from_server");
    };
  }, [
    socket,
    onlineStatusOfClients,
    currentSelectedClient,
    currentSelectedClientOnline,
  ]);

  useEffect(() => {
    socket.on("is_online_from_server", (data) => {
      const onlineClientId = data.id.toString();
      if (onlineClientId === currentSelectedClient?._id.toString()) {
        setCurrentSelectedClientOnline(data.online);
      }
      const temp = new Map();
      listOfAllClients?.map((id: string) => {
        if (id === onlineClientId) {
          temp.set(id, data.online);
        } else {
          temp.set(id, onlineStatusOfClients.get(id) || false);
        }
      });
      dispatch({ type: UPDATE_ONLINE_STATUS_OF_CLIENTS, payload: temp });
    });

    return () => {
      socket.off("is_online_from_server");
    };
  }, [
    currentSelectedClient,
    socket,
    currentSelectedClientOnline,
    listOfAllClients,
    onlineStatusOfClients,
  ]);

  // CHECKING FOR RECEIVING MESSAGES
  useEffect(() => {
    socket.on("receive_message", async (messageData) => {
      if (messageData.orderId) return;
      const { sender } = messageData;
      const clientId = sender._id.toString();

      if (listOfAllClients.includes(clientId)) {
        const map = new Map(allClientUserLastMessage);
        map.set(clientId, messageData);
        dispatch({ type: UPDATE_CLIENT_LAST_MESSAGE, payload: map });
      }

      if (currentSelectedClient?._id === clientId) {
        const newInboxMessages = [...inboxMessages, messageData];
        dispatch({
          type: UPDATE_ALL_CHATS_WITH_CLIENT,
          payload: newInboxMessages,
        });
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [
    socket,
    listOfAllClients,
    currentSelectedClientOnline,
    allClientUserLastMessage,
    currentSelectedClient,
    inboxMessages,
  ]);

  // CHECKING FOR RECEIVING MESSAGES SELF
  useEffect(() => {
    socket.on("receive_message_self", async (messageData: IMessage) => {
      if (messageData.orderId) return;
      console.log(messageData);
      const { receiver } = messageData;
      const clientId = (receiver as IUser)._id;

      if (listOfAllClients.includes(clientId)) {
        const map = new Map(allClientUserLastMessage);
        map.set(clientId, messageData);
        dispatch({ type: UPDATE_CLIENT_LAST_MESSAGE, payload: map });
      }

      if (currentSelectedClient?._id === clientId) {
        const newInboxMessages = [...inboxMessages, messageData];
        console.log(newInboxMessages);
        dispatch({
          type: UPDATE_ALL_CHATS_WITH_CLIENT,
          payload: newInboxMessages,
        });
      }
    });

    return () => {
      socket.off("receive_message_self");
    };
  }, [
    listOfAllClients,
    currentSelectedClient,
    inboxMessages,
    socket,
    allClientUserLastMessage,
  ]);

  const handleClientSelectionClick = async (detail: IUser) => {
    if (currentSelectedClient?._id.toString() !== detail._id.toString()) {
      await getAllMessagesBetweenTwoUser(detail._id);
    }
    setHideMessageListOnSmallDevices(false);
    setCurrentSelectedClient(detail);
    setCurrentSelectedClientOnline(onlineStatusOfClients.get(detail._id)!);
  };

  return (
    <div className="relative sm:flex">
      <div
        className="relative sm:min-w-[18rem] sm:border-r sm:border-r-dark_separator overflow-y-auto scroll-smooth overflow-x-hidden"
        style={{
          display:
            windowWidth < 600 && !hideMessageListOnSmallDevices
              ? "none"
              : "block",
        }}
      >
        <div className="flex py-8 px-6 items-center border-b border-b-dark_separator">
          <input
            className="pr-8 w-full py-2 px-4 border border-no_focus rounded placeholder:text-sm focus:outline-none focus:border-dark_grey"
            type="text"
            spellCheck={false}
            value={search}
            placeholder="Search for a username"
            onChange={(e) => setSearch(e.target.value)}
          ></input>
          <FaSearch className="absolute right-8 text-no_focus" />
        </div>
        {searchList.length > 0 && (
          <div className="bg-separator shadow-lg w-4/5 mx-6 absolute top-20 rounded-sm z-50">
            <ul>
              {searchList.map((key) => {
                const client = allClientsDetails.get(key)!;
                return (
                  <div
                    className="hover:underline flex items-center gap-2 hover:bg-dark_separator p-4 py-3 hover:cursor-pointer"
                    key={key}
                    onClick={() => {
                      handleClientSelectionClick(client);
                      setSearchList([]);
                    }}
                  >
                    <Avatar
                      avatarUrl={client.avatar?.url}
                      userName={client.name}
                      alt={client.name}
                      width="1.5rem"
                      fontSize="0.75rem"
                      useWebp={true}
                    />
                    {client.name}
                  </div>
                );
              })}
            </ul>
          </div>
        )}
        <ul className="w-full">
          {listOfAllClients?.map((key) => {
            const detail = allClientsDetails.get(key)!;
            return (
              <li
                onClick={() => handleClientSelectionClick(detail)}
                className="relative flex p-6 border-b border-b-dark_separator items-center h-20 overflow-hidden hover:cursor-pointer"
                key={key}
              >
                <div className="mr-3 relative">
                  <Avatar
                    userName={detail.name}
                    onlineStatus={onlineStatusOfClients.get(key) || false}
                    avatarUrl={detail.avatar?.url}
                    width="2.75rem"
                    onlineStatusWidth="1rem"
                    useWebp={true}
                  />
                </div>
                <div className="overflow-hidden w-full">
                  <div className="text-dark_grey font-bold mb-[0.4rem] text-sm">
                    {detail.name}
                  </div>
                  <div className="text-[0.8rem] text-light_heading whitespace-nowrap overflow-hidden text-ellipsis">
                    {allClientUserLastMessage.get(key)!.files?.length > 0 ? (
                      <PermMediaIcon
                        fontSize="small"
                        style={{ color: "#74767e" }}
                      />
                    ) : (
                      <p>{allClientUserLastMessage.get(key)!.message.text}</p>
                    )}
                  </div>
                </div>
                <div className="text-xs text-no_focus absolute right-7 top-6">
                  <Moment fromNow ago>
                    {allClientUserLastMessage.get(key)!.createdAt}
                  </Moment>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div
        style={{
          display:
            windowWidth < 600 && hideMessageListOnSmallDevices
              ? "none"
              : "block",
        }}
        className="w-full"
      >
        {inboxMessages.length === 0 ? (
          <div className="flex w-screen h-screen flex-col justify-center items-center text-center sm:w-[calc(100vw-18rem)] sm:h-[calc(100vh-81px)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="108"
              height="88"
              viewBox="0 0 108 88"
            >
              <g transform="translate(4 4)">
                <ellipse
                  fillRule="evenodd"
                  clipRule="evenodd"
                  fill="#FFF"
                  cx="54"
                  cy="32.5"
                  rx="17"
                  ry="17.5"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  fill="#1DBF73"
                  d="M57 23c0-1.2-.8-2-2.1-2H17.1c-1.3 0-2.1.8-2.1 2s.9 2 2.1 2h37.8c1.3 0 2.1-.8 2.1-2m-22 8H17c-1.2 0-2 .8-2 2s.8 2 2 2h18c1.2 0 2-.8 2-2s-1-2-2-2"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  fill="#555"
                  d="M43.7 53.4c-.4 0-1 .2-1.5.4L24.5 69.4V54.8c0-1-.6-1.9-1.7-2.1-10.7-2-18.6-12.2-18.6-24 0-13.5 10-24.5 22.4-24.5h24.9c12.3 0 22.4 11 22.4 24.5s-10 24.5-22.4 24.5l-7.8.2zM51.4 0H26.6C11.9 0 0 12.9 0 28.7 0 42 8.4 53.4 20.3 56.5v17.4c0 .8.4 1.5 1.3 1.9.2.2.6.2.8.2.4 0 1-.2 1.5-.4l20.7-18.1h7.1C66.1 57.5 78 44.6 78 28.7 78 12.9 66.1 0 51.4 0z"
                />
                <path
                  fill="none"
                  stroke="#FFF"
                  strokeWidth="4"
                  d="M43.7 51.4l7.8-.2c11.2 0 20.4-10.1 20.4-22.5S62.6 6.2 51.4 6.2H26.6c-11.2 0-20.4 10-20.4 22.5 0 10.9 7.3 20.2 17 22.1 2 .4 3.3 2 3.3 4v10.1l14.7-12.8.2-.1c.7-.4 1.5-.6 2.3-.6h0zm1.6 8.1L25 77.3l-.2.1c-.8.3-1.7.6-2.4.6-.2 0-.5 0-.7-.1-.4-.1-.8-.2-1.2-.5-1.4-.8-2.1-2-2.1-3.5V58C6.3 54.1-2 42.3-2 28.7-2 11.8 10.8-2 26.6-2h24.9C67.2-2 80 11.8 80 28.7c0 17-12.7 30.9-28.3 30.9h-6.4v-.1z"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  fill="#555"
                  d="M83.6 30.2c-1.2 0-2.1.8-2.1 2.1 0 1.2.8 2.1 2.1 2.1 8.3 0 15.2 7.5 15.2 16.8 0 9.1-6.4 16.6-14.7 16.8-1 0-2.1 1-2.1 2.1v6.6l-7.7-8.1c-.4-.4-1-.6-1.5-.6h-6.6c-4.8 0-9.1-2.5-12-6.6-.6-1-1.9-1.2-2.9-.6s-1.2 1.9-.6 2.9c3.5 5.4 9.6 8.5 15.6 8.5H72l10.8 11.2c.4.4 1 .6 1.5.6.2 0 .6 0 .8-.2.8-.4 1.2-1 1.2-1.9V72c9.6-1.5 16.8-10.2 16.8-20.8.1-11.4-8.7-21-19.5-21"
                />
              </g>
            </svg>
            <div className="text-[2rem] text-light_heading font-bold mb-4">
              Select a Conversation
            </div>
            <p className="max-w-[300px] px-5 py-0 text-no_focus leading-[1.6]">
              Try selecting a conversation or searching for someone specific.
            </p>
          </div>
        ) : (
          <div className="relative flex flex-col h-[calc(100vh-146.5px)] sm:h-[calc(100vh-81px)]">
            {inboxMessagesLoading ? (
              <Loader />
            ) : (
              <>
                <div>
                  <header className="p-6 flex justify-between border-b border-b-dark_separator">
                    <div
                      style={{
                        display: windowWidth < 600 ? "block" : "none",
                      }}
                      onClick={() => setHideMessageListOnSmallDevices(true)}
                    >
                      <BiChevronLeft className="text-2xl text-icons hover:cursor-pointer" />
                    </div>
                    <h2>
                      <div className="flex items-center text-xl underline text-dark_grey">
                        <span
                          className={`w-[0.6rem] aspect-square rounded-full mr-2 inline-block ${
                            currentSelectedClientOnline
                              ? "bg-primary"
                              : "bg-no_focus"
                          }`}
                        />
                        <Link
                          className="hover:text-primary"
                          to={`/user/${currentSelectedClient?._id}`}
                        >
                          {currentSelectedClient?.name}
                        </Link>
                      </div>
                      <div className="text-[0.8rem] text-light_heading mt-1">
                        {typing && <div>typing...</div>}
                        {!typing && currentSelectedClientOnline && (
                          <div>online</div>
                        )}
                        {!typing && !currentSelectedClientOnline && (
                          <div>
                            Last seen:{" "}
                            <Moment fromNow>
                              {currentSelectedClient?.lastSeen}
                            </Moment>
                          </div>
                        )}
                      </div>
                    </h2>
                    {/* <div className="inbox-message-list-header-icon">
                      <FaEllipsisH />
                    </div> */}
                  </header>
                </div>

                <DataSendingLoading
                  pos="absolute"
                  show={fileLoading}
                  finishedLoading={!fileLoading}
                  loadingText={"Sending message..."}
                />
                <div className="relative p-4 flex flex-col flex-grow overflow-hidden justify-between border-t border-t-dark_separator">
                  <div className="overflow-scroll">
                    <ChatMessageList chatMessages={inboxMessages} />
                    <div ref={scrollToBottomDivRefInbox}></div>
                  </div>
                </div>
                {currentSelectedClient && (
                  <ChatForm
                    chatUser={currentSelectedClient}
                    scrollToBottomDivRef={scrollToBottomDivRefInbox}
                    setFileLoading={setFileLoading}
                    ref={chatFormRef}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
