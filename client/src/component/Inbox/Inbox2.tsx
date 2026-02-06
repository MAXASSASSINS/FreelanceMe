import data from "@emoji-mart/data";
// @ts-ignore
import Picker from "@emoji-mart/react";
import "moment-timezone";
import {
  ChangeEvent,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import Moment from "react-moment";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { axiosInstance } from "../../utility/axiosInstance";
import "./inbox.css";
// import '../Chat/chat.css'
import PermMediaIcon from "@mui/icons-material/PermMedia";
import { windowContext } from "../../App";
import { Loader } from "../Loader/Loader";
import {
  FETCH_ALL_CHATS_WITH_CLIENT,
  FETCH_ALL_CLIENTS_DETAILS,
  FETCH_ALL_CLIENTS_LAST_MESSAGE,
  FETCH_ALL_CLIENTS_LIST,
  UPDATE_ALL_CHATS_WITH_CLIENT,
  UPDATE_CLIENT_LAST_MESSAGE,
  UPDATE_ONLINE_STATUS_OF_CLIENTS,
} from "./inboxConstant";
import {
  INBOX_DETAILS_INITIAL_STATE,
  InboxMessageState,
  inboxReducer,
} from "./inboxReducer";

import { HiDownload } from "react-icons/hi";
import { uploadToCloudinaryV2 } from "../../utility/cloudinary";
import { downloadFile, getFileSize } from "../../utility/util";

import { BiChevronLeft } from "react-icons/bi";
import { BsEmojiSmile } from "react-icons/bs";
import { FaEllipsisH, FaRegPaperPlane, FaSearch } from "react-icons/fa";
import { FiPaperclip } from "react-icons/fi";
import { IoClose, IoDocumentOutline } from "react-icons/io5";
import { Avatar } from "../Avatar/Avatar";
import { DataSendingLoading } from "../DataSendingLoading/DataSendingLoading";
import { LazyImage } from "../LazyImage/LazyImage";
import { LazyVideo } from "../LazyVideo.js/LazyVideo";
import { RootState } from "../../store";
import { IUser } from "../../types/user.types";
import { IFile } from "../../types/file.types";
import { useSocket } from "../../context/socketContext";

type SelectedFile = {
  selectedFile: File;
  id: number;
};

export const Inbox = () => {
  const { windowWidth } = useContext(windowContext);
  const socket = useSocket()

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  const [search, setSearch] = useState("");
  const [searchList, setSearchList] = useState<string[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!search) {
        setSearchList([]);
        return;
      }
      const list = allClientsDetails.keys()
        ? Object.keys(allClientsDetails).filter((key) => {
            const client = allClientsDetails.get(key);
            return client?.name.startsWith(search);
          })
        : [];
      console.log(list);
      setSearchList(list);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

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

  new Picker({ data });

  const [typing, setTyping] = useState(false);

  const [hideMessageListOnSmallDevices, setHideMessageListOnSmallDevices] =
    useState(true);
  const [showMessageListOnDevices, setShowMessageListOnDevices] =
    useState(true);

  const [currentSelectedClient, setCurrentSelectedClient] =
    useState<IUser | null>(null);
  const [currentSelectedClientOnline, setCurrentSelectedClientOnline] =
    useState(false);

  const [message, setMessage] = useState("");
  const [isFilePicked, setIsFilePicked] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);

  const scrollToBottomDivRefInbox = useRef<HTMLDivElement>(null);
  const chatTextAreaRef = useRef<HTMLTextAreaElement>(null);

  const inboxChatFormRef = useRef<HTMLFormElement>(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerOpenerIconRef = useRef<HTMLDivElement>(null);

  const [fileLoading, setFileLoading] = useState(false);

  const handleEmojiClick = (emoji: any) => {
    setShowEmojiPicker(false);
    setMessage(message + emoji.native);
  };

  // GET LOGGED IN USER AND FETCH LIST OF ALL CLIENTS IF LOGGED IN
  useEffect(() => {
    if (isAuthenticated && user) getInitialInboxMessages();
  }, [isAuthenticated, user]);

  const getInitialInboxMessages = async () => {
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
  };

  // LAZY LOADING THE IMAGES AND VIDEOS
  useEffect(() => {
    const images = document.querySelectorAll("img[data-src]");
    const videoImages = document.querySelectorAll("video[data-poster]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (entry.target.attributes.getNamedItem("poster")) {
            entry.target.attributes.getNamedItem("poster")!.value =
              entry.target.attributes.getNamedItem("data-poster")!.value;
          } else {
            entry.target.attributes.getNamedItem("src")!.value =
              entry.target.attributes.getNamedItem("data-src")!.value;
          }
          observer.unobserve(entry.target);
        });
      },
      {
        root: document.getElementById("inbox-message-ul-id"),
        rootMargin: "300px",
      }
    );

    images.forEach((image) => {
      observer.observe(image);
    });

    videoImages.forEach((image) => {
      observer.observe(image);
    });

    return () => {
      observer.disconnect();
    };
  }, [fileLoading, inboxMessages]);

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

  const handleEmojiPickerHideOrShow = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleSubmissionOfInboxForms = async () => {
    await sendChat();
  };

  const sendChat = async () => {
    setFileLoading(true);

    let files: IFile[] = [];
    try {
      // upload files to cloudinary
      files = await sendFileClientCloudinary(selectedFiles);

      // add message to database
      const res = await addMessageToDatabase(message, files);

      // send message to socket
      await handleSendMessageSocket(message, files);
    } catch (error) {
      console.log(error);
    } finally {
      setFileLoading(false);
    }
  };

  // client side uploading to cloudinary
  const sendFileClientCloudinary = async (files: SelectedFile[]) => {
    if (isFilePicked) {
      const arr = files.map((file) => {
        return file.selectedFile;
      });

      try {
        const res = await uploadToCloudinaryV2(arr, 5 * 1024 * 1024 * 1024);
        return res;
      } catch (error) {
        console.log(error);
        throw error;
      } finally {
        setIsFilePicked(false);
        setSelectedFiles([]);
      }
    }
    return [];
  };

  // add message to database
  const addMessageToDatabase = async (message: string, files: IFile[] = []) => {
    try {
      const messageData = {
        message,
        from: user!._id,
        to: currentSelectedClient?._id,
        files,
      };

      const { data } = await axiosInstance.post("/add/message", messageData);
      console.log(data);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setMessage("");
    }
  };

  const handleSendMessageSocket = async (message: string, files: IFile[]) => {
    const sender = {
      avatar: user!.avatar,
      name: user!.name,
      _id: user!._id,
    };
    const receiver = {
      avatar: currentSelectedClient?.avatar,
      name: currentSelectedClient?.name,
      _id: currentSelectedClient?._id,
    };

    if (receiver._id !== currentSelectedClient?._id) return;

    const messageData = {
      message: {
        text: message,
      },
      sender,
      receiver,
      createdAt: new Date().getTime(),
      files,
    };
    await socket.emit("send_message", messageData);
  };

  // MESSAGE SCROLL DOWN TO BOTTOM EFFECT
  useEffect(() => {
    scrollToBottomDivRefInbox.current?.scrollIntoView();
    const timeout = setTimeout(() => {
      scrollToBottomDivRefInbox.current?.scrollIntoView();
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [inboxMessages?.length, fileLoading]);

  // SHOW TYPING STATUS
  useEffect(() => {
    const data = {
      senderId: user!._id.toString(),
      receiverId: currentSelectedClient?._id.toString(),
    };
    socket.emit("typing_started", data);
    const timeout = setTimeout(() => {
      socket.emit("typing_stopped", data);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [message]);

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
  }, [user, isAuthenticated]);

  useEffect(() => {
    socket.emit("get_online_status_of_all_clients", listOfAllClients || []);
  }, [listOfAllClients]);

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
  }, [currentSelectedClient, socket, currentSelectedClientOnline]);

  // CHECKING FOR RECEIVING MESSAGES
  useEffect(() => {
    socket.on("receive_message", async (messageData) => {
      if (messageData.orderId) return;
      const { sender } = messageData;
      const clientId = sender._id.toString();

      if (listOfAllClients.includes(clientId)) {
        const map = { ...allClientUserLastMessage };
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
  }, [socket, listOfAllClients, currentSelectedClientOnline]);

  // CHECKING FOR RECEIVING MESSAGES SELF
  useEffect(() => {
    socket.on("receive_message_self", async (messageData) => {
      if (messageData.orderId) return;
      const { receiver } = messageData;
      const clientId = receiver._id;

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
      socket.off("receive_message_self");
    };
  }, [listOfAllClients, currentSelectedClient]);

  const handleSelectionOfFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files || [];
    let arr = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      arr.push(selectedFiles[i]);
    }
    for (let i = 0; i < files.length; i++) {
      let index = 0;
      if (selectedFiles != null) {
        index = selectedFiles.length + i;
      } else {
        index = i;
      }
      const file = {
        selectedFile: files[i],
        id: index,
      };
      arr.push(file);
    }
    (
      document.getElementById("chat-inbox-input-file") as HTMLInputElement
    ).value = "";
    if (arr.length === 0) {
      setSelectedFiles([]);
      setIsFilePicked(false);

      return;
    }
    setIsFilePicked(true);
    setSelectedFiles(arr);
    scrollToBottomDivRefInbox.current?.scrollIntoView();
  };

  const handleFileClickedRemoval = (id: number) => () => {
    let arr = selectedFiles;
    arr = arr.filter((file) => {
      return file.id !== id;
    });
    if (arr.length === 0) {
      setIsFilePicked(false);
      setSelectedFiles([]);
      (
        document.getElementById("chat-inbox-input-file") as HTMLInputElement
      ).value = "";
      return;
    }
    setSelectedFiles(arr);
  };

  useEffect(() => {
    if (windowWidth < 600) setShowMessageListOnDevices(false);
    else setShowMessageListOnDevices(true);
  }, [windowWidth]);

  const handleClientSelectionClick = async (detail: IUser) => {
    if (currentSelectedClient?._id.toString() !== detail._id.toString()) {
      setIsFilePicked(false);
      setSelectedFiles([]);
      setShowEmojiPicker(false);
      await getAllMessagesBetweenTwoUser(detail._id);
    }
    setHideMessageListOnSmallDevices(false);
    setCurrentSelectedClient(detail);
    setCurrentSelectedClientOnline(onlineStatusOfClients.get(detail._id)!);
  };

  useEffect(() => {
    const handleClickOutside = (event: WindowEventMap["click"]) => {
      const target = event.target as HTMLElement;
      if (
        target !== document.querySelector("em-emoji-picker") &&
        !emojiPickerOpenerIconRef.current?.contains(target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  console.log('render');

  return (
    <div className="inbox-main">
      <div
        className="inbox-clients-list"
        style={{
          display:
            windowWidth < 600 && !hideMessageListOnSmallDevices
              ? "none"
              : "block",
        }}
      >
        <div className="inbox-search">
          <input
            type="text"
            spellCheck={false}
            value={search}
            placeholder="Search for a username"
            onChange={(e) => setSearch(e.target.value)}
          ></input>
          <FaSearch />
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
                      avatarUrl={client.avatar.url}
                      userName={client.name}
                      alt={client.name}
                      width="1.5rem"
                      fontSize="0.75rem"
                    />
                    {client.name}
                  </div>
                );
              })}
            </ul>
          </div>
        )}
        <ul className="client-list-ul">
          {listOfAllClients?.map((key) => {
            const detail = allClientsDetails.get(key)!;
            return (
              <li
                onClick={() => handleClientSelectionClick(detail)}
                className="inbox-user-client"
                key={key}
              >
                <div className="client-list-client-profile-image">
                  <Avatar
                    userName={detail.name}
                    onlineStatus={onlineStatusOfClients.get(key) || false}
                    avatarUrl={detail.avatar.url}
                    width="2.75rem"
                    onlineStatusWidth="1rem"
                  />
                </div>
                <div className="client-list-detail-plus-last-message">
                  <div className="client-list-client-name">{detail.name}</div>
                  <div className="client-list-last-message">
                    {allClientUserLastMessage.get(key)!.files?.length > 0 ? (
                      <PermMediaIcon
                        fontSize="small"
                        style={{ color: "#74767e" }}
                      />
                    ) : (
                      <p>{allClientUserLastMessage.get(key)!.message.text}</p>
                    )}
                  </div>
                  {/* <div>{onlineStatusOfClients[index] ? "online" : "xxxxxx"}</div> */}
                </div>
                <div className="client-list-last-message-time">
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
        className="current-user-message-list"
      >
        {inboxMessages.length === 0 ? (
          <div className="inbox-message-list-default">
            <div className="inbox-message-list-default-wrapper">
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
              <div className="inbox-message-list-default-message-title">
                Select a Conversation
              </div>
              <p className="inbox-message-list-default-message-body">
                Try selecting a conversation or searching for someone specific.
              </p>
            </div>
          </div>
        ) : (
          <div className="inbox-message-list">
            {inboxMessagesLoading ? (
              <Loader />
            ) : (
              <>
                <div className="inbox-message-list-section-1">
                  <header>
                    <div
                      style={{
                        display: windowWidth < 600 ? "block" : "none",
                      }}
                      className="inbox-message-list-header-icon"
                      onClick={() => setHideMessageListOnSmallDevices(true)}
                    >
                      <BiChevronLeft />
                    </div>
                    <h2>
                      <div className="inbox-client-name">
                        <span
                          className="currently-selected-client-online-status"
                          style={{
                            backgroundColor: currentSelectedClientOnline
                              ? "#1dbf73"
                              : "#a6a5a5",
                          }}
                        ></span>
                        <Link to={`/user/${currentSelectedClient?._id}`}>
                          {currentSelectedClient?.name}
                        </Link>
                      </div>
                      <div className="client-status">
                        {typing && (
                          <div className="client-typing-status">
                            {"typing..."}
                          </div>
                        )}
                        {!typing && currentSelectedClientOnline && (
                          <div className="client-online-status">online</div>
                        )}
                        {!typing && !currentSelectedClientOnline && (
                          <div className="client-last-seen-status">
                            Last seen:{" "}
                            <Moment fromNow>
                              {currentSelectedClient?.lastSeen}
                            </Moment>
                          </div>
                        )}
                      </div>
                    </h2>
                    <div className="inbox-message-list-header-icon">
                      <FaEllipsisH />
                    </div>
                  </header>
                </div>

                <DataSendingLoading
                  pos="absolute"
                  show={fileLoading}
                  finishedLoading={!fileLoading}
                  loadingText={"Sending message..."}
                />
                <div className="inbox-message-list-section-2">
                  <ul id="inbox-message-ul-id">
                    {inboxMessages.map((item, index) => {
                      item.sender = item.sender as IUser;
                      return (
                        <li className="inbox-message-list-info" key={item._id}>
                          <div className="mr-2">
                            <Avatar
                              avatarUrl={item.sender.avatar.url}
                              userName={item.sender.name}
                              width="2rem"
                            />
                          </div>
                          <div className="inbox-messages-list-sender-info">
                            <div className="inbox-messages-list-sender-details">
                              <div className="inbox-messages-list-sender-name">
                                {item.sender.name === user!.name
                                  ? "Me"
                                  : item.sender.name}
                              </div>
                              <p className="inbox-messages-list-sender-date">
                                <Moment format="DD MMM YYYY, HH:mm">
                                  {item.createdAt}
                                </Moment>
                              </p>
                            </div>
                            <p className="inbox-messages-list-sender-text">
                              {item.message.text}
                            </p>
                            <div className="inbox-messages-list-sender-files">
                              {item.files?.map((file, index) => (
                                <div
                                  key={index}
                                  className="inbox-messages-list-sender-file"
                                >
                                  <p>
                                    {file.type.includes("video") ? (
                                      <a
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <LazyVideo file={file} />
                                      </a>
                                    ) : file.type.includes("image") ? (
                                      <a
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <LazyImage file={file} />
                                      </a>
                                    ) : file.type.includes("audio") ? (
                                      <audio
                                        className="inbox-messages-list-sender-file-audio"
                                        preload="none"
                                        controls
                                        src={file.url}
                                      />
                                    ) : (
                                      <div className="inbox-messages-list-sender-file-document">
                                        <div>
                                          <IoDocumentOutline />
                                        </div>
                                      </div>
                                    )}
                                  </p>
                                  <div
                                    onClick={() =>
                                      downloadFile(file.url, file.name)
                                    }
                                    className="inbox-messages-list-sender-file-info"
                                  >
                                    <div
                                      data-tooltip-id="my-tooltip"
                                      data-tooltip-content={file.name}
                                      data-tooltip-place="bottom"
                                    >
                                      <HiDownload />
                                      <div className="inbox-messages-list-sender-file-name">
                                        {file.name}
                                      </div>
                                    </div>
                                    <p className="inbox-messages-list-sender-file-size">
                                      ({getFileSize(file.size ? file.size : 0)})
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                    {fileLoading && (
                      <div className="inbox-message-list-info">
                        <Avatar
                          avatarUrl={user!.avatar.url}
                          userName={user!.name}
                          width="2rem"
                        />
                        <div className="inbox-messages-list-sender-info">
                          <div className="inbox-messages-list-sender-details">
                            <div className="inbox-messages-list-sender-name">
                              Me
                            </div>
                            <p className="inbox-messages-list-sender-date">
                              <Moment format="DD MMM YYYY, HH:mm">
                                {Date.now()}
                              </Moment>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={scrollToBottomDivRefInbox}></div>
                  </ul>
                  <form
                    ref={inboxChatFormRef}
                    id="inbox-chat-form"
                    onSubmit={(e) => e.preventDefault()}
                  >
                    {isFilePicked && (
                      <div className="inbox-attached-files-div">
                        <div className="inbox-attached-files-heading">
                          ATTACHED FILES (
                          {selectedFiles &&
                            selectedFiles.length !== 0 &&
                            selectedFiles.length}
                          )
                        </div>
                        <ul>
                          {selectedFiles &&
                            selectedFiles.length > 0 &&
                            selectedFiles.map((file, index) => (
                              <li key={index}>
                                <div>{file.selectedFile.name}</div>
                                <button
                                  type="button"
                                  onClick={handleFileClickedRemoval(file.id)}
                                >
                                  <IoClose />
                                </button>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                    <textarea
                      ref={chatTextAreaRef}
                      rows={1}
                      onFocus={(e) =>
                        (e.target.parentElement!.style.borderColor = "#222831")
                      }
                      maxLength={2500}
                      onChange={(e) => setMessage(e.target.value)}
                      value={message}
                      placeholder="Type your message here..."
                      spellCheck={false}
                      onBlur={(e) =>
                        (e.target.parentElement!.style.borderColor = "#a6a5a5")
                      }
                    />
                  </form>
                </div>
                <div className="inbox-message-list-section-3">
                  <footer>
                    <div>
                      <div
                        ref={emojiPickerOpenerIconRef}
                        onClick={handleEmojiPickerHideOrShow}
                        className="inbox-emoji inbox-emoji-picker"
                      >
                        <div>
                          <BsEmojiSmile />
                        </div>
                      </div>
                      <div className="inbox-emoji-picker-wrapper">
                        {showEmojiPicker && (
                          <Picker
                            onEmojiSelect={handleEmojiClick}
                            perLine={windowWidth > 768 ? 8 : 7}
                            skinTonePosition="none"
                            previewPosition="none"
                            maxFrequentRows={2}
                          />
                        )}
                      </div>
                      <div
                        data-tooltip-content="Max 5GB"
                        data-tooltip-place="top"
                        data-tooltip-id="my-tooltip"
                      >
                        <label
                          className="inbox-attachment"
                          htmlFor="chat-inbox-input-file"
                        >
                          <FiPaperclip />
                        </label>
                        <input
                          onChange={handleSelectionOfFiles}
                          id="chat-inbox-input-file"
                          multiple={true}
                          type="file"
                          // accept="image/*,video/*"
                          hidden={true}
                        ></input>
                      </div>
                    </div>
                    <button
                      disabled={message.length <= 0 && !isFilePicked}
                      onClick={handleSubmissionOfInboxForms}
                      style={{
                        opacity:
                          message.length > 0 || isFilePicked ? "1" : "0.4",
                      }}
                    >
                      <FaRegPaperPlane style={{ display: "inline" }} />
                      &nbsp; Send Message
                    </button>
                  </footer>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
