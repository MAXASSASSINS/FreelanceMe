import data from "@emoji-mart/data";
import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  MouseEvent,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
// @ts-ignore
import Picker from "@emoji-mart/react";
import "moment-timezone";
import { BsEmojiSmile } from "react-icons/bs";
import { FaRegPaperPlane } from "react-icons/fa";
import { FiPaperclip } from "react-icons/fi";
import { HiDownload } from "react-icons/hi";
import { IoClose, IoDocumentOutline } from "react-icons/io5";
import Moment from "react-moment";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../utility/axiosInstance";
import "./chat.css";
// @ts-ignore
import { toast } from "react-toastify";
import { windowContext } from "../../App";
import { useUpdateGlobalLoading } from "../../context/globalLoadingContext";
import { SocketContext } from "../../context/socket/socket";
import { AppDispatch, RootState } from "../../store";
import { uploadToCloudinaryV2 } from "../../utility/cloudinary";
import { downloadFile, getFileSize } from "../../utility/util";
import { Avatar } from "../Avatar/Avatar";
import { DataSendingLoading } from "../DataSendingLoading/DataSendingLoading";
import { LazyImage } from "../LazyImage/LazyImage";
import { LazyVideo } from "../LazyVideo.js/LazyVideo";
import { IMessage } from "../../types/message.types";
import { IFile } from "../../types/file.types";
import { IUser } from "../../types/user.types";

type ChatProps = {
  gigDetail: any;
  showChatBox: boolean;
  setShowChatBox: Dispatch<SetStateAction<boolean>>;
};

type SelectedFile = {
  selectedFile: File;
  id: number;
};

export const Chat = ({ gigDetail, showChatBox, setShowChatBox }: ChatProps) => {
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  const { windowWidth } = useContext(windowContext);

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  new Picker({ data });
  // All States
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [message, setMessage] = useState("");
  const [isFilePicked, setIsFilePicked] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [allMessages, setAllMessages] = useState<IMessage[]>([]);
  const [fileLoading, setFileLoading] = useState(false);
  const [online, setOnline] = useState(false);
  const [typing, setTyping] = useState(false);

  // All References
  const chatTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionRef1 = useRef<HTMLLIElement>(null);
  const suggestionRef2 = useRef<HTMLLIElement>(null);
  const suggestionRef3 = useRef<HTMLLIElement>(null);
  const scrollToBottomDivRef = useRef<HTMLDivElement>(null);
  const emojiPickerOpenerIconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      socket.emit("is_online", gigDetail.user._id.toString());
    }
  }, [user]);

  useEffect(() => {
    user && getAllMessagesBetweenTwoUser();
  }, [user]);

  useEffect(() => {
    if (chatTextAreaRef.current) {
      chatTextAreaRef.current.style.height = "32px";
      const scrollHeight = chatTextAreaRef.current.scrollHeight;
      chatTextAreaRef.current.style.height = scrollHeight + "px";
    }
    if (user && !allMessages && message.length === 0) {
      if (suggestionRef1.current)
        suggestionRef1.current.style.display = "inline-flex";
      if (suggestionRef2.current)
        suggestionRef2.current.style.display = "inline-flex";
      if (suggestionRef3.current)
        suggestionRef3.current.style.display = "inline-flex";
    }
  }, [message]);

  // MESSAGE SCROLL DOWN TO BOTTOM EFFECT
  useEffect(() => {
    scrollToBottomDivRef.current?.scrollIntoView();
    const timeout = setTimeout(() => {
      scrollToBottomDivRef.current?.scrollIntoView();
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [allMessages?.length]);

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
  }, [fileLoading, allMessages]);

  // CHECKING FOR ONLINE STATUS OF GIG SELLER
  useEffect(() => {
    socket.on("is_online_from_server", (data) => {
      const onlineClientId = data.id.toString();

      if (onlineClientId === gigDetail.user._id.toString()) {
        setOnline(data.online);
      }
    });

    return () => {
      socket.off("is_online_from_server");
      // setCurrentSelectedClientOnline(false);
    };
  }, [socket, online]);

  useEffect(() => {
    socket.on("online_from_server", async (userId) => {
      if (userId === gigDetail.user._id.toString()) {
        setOnline(true);
      }
    });
    socket.on("offline_from_server", async (userId) => {
      if (userId === gigDetail.user._id.toString()) {
        setOnline(false);
      }
    });
    return () => {
      socket.off("online_from_server");
      socket.off("offline_from_server");
    };
  }, [socket]);

  const handleEmojiPickerHideOrShow = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleSelectionOfFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files || [];
    let arr: SelectedFile[] = [];
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
    (document.getElementById("chat-input-file") as HTMLInputElement).value = "";
    if (arr.length === 0) {
      setSelectedFiles([]);
      setIsFilePicked(false);
      return;
    }
    setIsFilePicked(true);
    setSelectedFiles(arr);

    scrollToBottomDivRef.current?.scrollIntoView();
  };

  const handleFileClickedRemoval = (id: number) => () => {
    let arr = selectedFiles;
    arr = arr.filter((file) => {
      return file.id !== id;
    });
    if (arr.length === 0) {
      setIsFilePicked(false);
      setSelectedFiles([]);
      (document.getElementById("chat-input-file") as HTMLInputElement).value =
        "";
      return;
    }
    setSelectedFiles(arr);
  };

  const sendChat = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFileLoading(true);

    try {
      // upload files to cloudinary
      let files = await sendFileClientCloudinary(selectedFiles);

      // add message to database
      const res = await addMessageToDatabase(message, files);

      // send message to socket
      await handleSendMessageSocket(message, files);
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.message);
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
        to: gigDetail.user._id,
        files,
      };

      const { data } = await axiosInstance.post("/add/message", messageData);
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
      avatar: gigDetail.user.avatar,
      name: gigDetail.user.name,
      _id: gigDetail.user._id,
    };

    if (receiver._id !== gigDetail.user._id) return;

    const messageData = {
      message: {
        text: message,
      },
      sender,
      receiver,
      createdAt: new Date().getTime(),
      files,
    };
    const clientId = gigDetail.user._id.toString();
    await socket.emit("send_message", messageData);
  };

  // CHECKING FOR RECEIVING MESSAGES
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

  // SHOW TYPING STATUS
  useEffect(() => {
    const data = {
      senderId: user!._id.toString(),
      receiverId: gigDetail.user._id.toString(),
    };
    socket.emit("typing_started", data);
    const timeout = setTimeout(() => {
      socket.emit("typing_stopped", data);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [message, socket, user, gigDetail]);

  useEffect(() => {
    socket.on("typing_started_from_server", (data) => {
      if (gigDetail.user._id.toString() === data.senderId.toString()) {
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
  }, [socket, gigDetail.user._id]);

  const getAllMessagesBetweenTwoUser = async () => {
    const postData = {
      from: user!._id,
      to: gigDetail.user._id,
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
    const suggestion = target.textContent!;
    target.style.display = "none";
    let newMsg = message.length !== 0 ? message + "\n" : message;
    newMsg += suggestion.substr(0, suggestion.length - 3) + " ";
    chatTextAreaRef.current?.focus();
    setMessage(newMsg);
  };

  const checkUserOpenItsOwnGig = () => {
    if (user && gigDetail) {
      if (user._id === gigDetail.user._id) {
        return true;
      }
      return false;
    }
    return false;
  };

  useEffect(() => {
    checkUserOpenItsOwnGig();
  }, [user]);

  useEffect(() => {
    if (allMessages?.length === 0 && message?.length === 0) {
      if (suggestionRef1.current) suggestionRef1.current.style.display = "";
      if (suggestionRef2.current) suggestionRef2.current.style.display = "";
      if (suggestionRef3.current) suggestionRef3.current.style.display = "";
    }
  }, [message]);

  const handleEmojiClick = (emoji: any) => {
    setShowEmojiPicker(false);
    setMessage(message + emoji.native);
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

  return (
    <div
      className="chat-background"
      style={{ display: showChatBox ? "block" : "none" }}
    >
      <div className="chat-content">
        <header>
          <div className="chat-header-img">
            <Avatar
              avatarUrl={gigDetail.user.avatar.url}
              userName={gigDetail.user.name}
              width="3rem"
              fontSize="1.3rem"
            />
          </div>
          <div>
            <div className="chat-seller-name">
              Message {gigDetail.user.name}
            </div>
            <div
              className="chat-seller-online-status"
              style={{ color: online ? "#1dbf73" : "" }}
            >
              {typing ? "typing..." : online ? "online" : "away"}
            </div>
          </div>
          <span onClick={() => setShowChatBox(false)}>
            <IoClose />
          </span>
        </header>

        <DataSendingLoading
          pos="absolute"
          show={fileLoading}
          finishedLoading={!fileLoading}
          loadingText={"Sending message..."}
        />
        <main>
          {!allMessages?.length || checkUserOpenItsOwnGig() ? (
            <div className="chat-suggestion-div">
              <ul>
                <li
                  ref={suggestionRef1}
                  onClick={(e) => handleChatSuggestion(e)}
                >
                  &#128075; Hey! {gigDetail.user.name}, can you help me with...
                </li>
                <li
                  ref={suggestionRef2}
                  onClick={(e) => handleChatSuggestion(e)}
                >
                  Do you have any experience with...
                </li>
                <li
                  ref={suggestionRef3}
                  onClick={(e) => handleChatSuggestion(e)}
                >
                  Do you think you can deliver your order by...
                </li>
              </ul>
            </div>
          ) : (
            <div className="chat-show-div">
              <ul id="chat-list-id" className="chat-box">
                {allMessages &&
                  allMessages.map((message) => {
                    message.sender = message.sender as IUser;
                    return (
                      <li key={message._id}>
                        <Avatar
                          avatarUrl={message.sender.avatar.url}
                          userName={message.sender.name}
                          width="2.5rem"
                          fontSize="1.3rem"
                        />
                        <div>
                          <div className="chat-message-owner-time-div">
                            <span className="chat-message-owner">
                              {message.sender._id === user!._id
                                ? "Me"
                                : message.sender.name}
                            </span>
                            &nbsp;
                            <span className="chat-message-time">
                              <Moment format="D MMM,  H:mm">
                                {message.updatedAt}
                              </Moment>
                            </span>
                          </div>
                          <div className="chat-message-text">
                            {message.message.text}
                          </div>
                          <div className="chat-messages-list-sender-files">
                            {message.files?.map((file, index) => (
                              <div
                                key={index}
                                className="chat-messages-list-sender-file"
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
                                      className="chat-messages-list-sender-file-audio"
                                      preload="none"
                                      controls
                                      src={file.url}
                                    />
                                  ) : (
                                    <div className="chat-messages-list-sender-file-document">
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
                                  className="chat-messages-list-sender-file-info"
                                >
                                  <div
                                    data-tooltip-id="my-tooltip"
                                    data-tooltip-content={file.name}
                                    data-tooltip-place="bottom"
                                  >
                                    <HiDownload />
                                    <div className="chat-messages-list-sender-file-name">
                                      {file.name}
                                    </div>
                                  </div>
                                  <p className="chat-messages-list-sender-file-size">
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
                <div ref={scrollToBottomDivRef}></div>
              </ul>
            </div>
          )}
          <form id="chat-form" onSubmit={(e) => sendChat(e)}>
            {selectedFiles && isFilePicked && (
              <div className="chat-attached-files-div">
                <div className="chat-attached-files-heading">
                  ATTACHED FILES ({selectedFiles.length})
                </div>
                <ul>
                  {selectedFiles.length > 0 &&
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
                (e.target!.parentElement!.style.borderColor = "#222831")
              }
              maxLength={2500}
              onChange={(e) => setMessage(e.target.value)}
              value={message}
              placeholder="Type your message here..."
              spellCheck={false}
              onBlur={(e) =>
                (e.target!.parentElement!.style.borderColor = "#a6a5a5")
              }
            />
          </form>
        </main>
        <footer>
          <div>
            <div
              ref={emojiPickerOpenerIconRef}
              onClick={handleEmojiPickerHideOrShow}
              className="chat-emoji contact-seller-emoji-picker"
            >
              <div>
                <BsEmojiSmile />
              </div>
            </div>
            <div className="chat-emoji-picker-wrapper">
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
              <label className="chat-attachment" htmlFor="chat-input-file">
                <FiPaperclip />
                <input
                  onChange={handleSelectionOfFiles}
                  id="chat-input-file"
                  multiple={true}
                  type="file"
                  hidden={true}
                ></input>
              </label>
            </div>
          </div>
          <button
            type="submit"
            form="chat-form"
            className="disabled:opacity-40"
            disabled={message.length > 0 || isFilePicked ? false : true}
          >
            <FaRegPaperPlane style={{ display: "inline" }} />
            &nbsp; Send Message
          </button>
        </footer>
      </div>
    </div>
  );
};
