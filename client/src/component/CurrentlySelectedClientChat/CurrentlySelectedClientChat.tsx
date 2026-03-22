import Picker from "@emoji-mart/react";
import "moment-timezone";
import React, {
  ChangeEvent,
  useEffect,
  useRef,
  useState
} from "react";
import Moment from "react-moment";
import { Link } from "react-router-dom";
import { IMessage } from "../../types/message.types";
import { IUser } from "../../types/user.types";
import { axiosInstance } from "../../utility/axiosInstance";

type CurrentlySelectedClientChatProps = {
  user: IUser;
  hideMessageListOnSmallDevices: boolean;
  setHideMessageListOnSmallDevices: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  currentSelectedClient: IUser;
  handleAllClientUserLastMessage: () => void;
};

type SelectedFile = {
  selectedFile: File;
  id: number;
};

export const CurrentlySelectedClientChat = ({
  user,
  hideMessageListOnSmallDevices,
  setHideMessageListOnSmallDevices,
  currentSelectedClient,
  handleAllClientUserLastMessage,
}: CurrentlySelectedClientChatProps) => {
  const [inboxMessages, setInboxMessages] = useState<IMessage[]>([]);

  const [message, setMessage] = useState("");
  const [isFilePicked, setIsFilePicked] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const chatTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const scrollToBottomDivRefInbox = useRef<HTMLDivElement>(null);

  const handleEmojiClick = (emoji: any) => {
    setShowEmojiPicker(false);
    setMessage(message + emoji.native);
  };

  const handleEmojiPickerHideOrShow = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const sendChat = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.length > 0) {
      handleSendMessage(message);
      setMessage("");
    }
    if (isFilePicked) {
      setIsFilePicked(false);
      setSelectedFiles([]);
    }
  };

  const handleSendMessage = async (message: string) => {
    const dataToPost = {
      from: user._id,
      to: currentSelectedClient._id,
      message,
    };
    const url = "/add/message";
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const { data } = await axiosInstance.post(url, dataToPost, config);
    await getAllMessagesBetweenTwoUser();
    // await handleSendMessageSocket(message);
    await handleAllClientUserLastMessage();
  };

  const getAllMessagesBetweenTwoUser = async () => {
    const clientId = currentSelectedClient._id;
    const postData = {
      from: user._id,
      to: clientId,
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
    setInboxMessages(messages);
    scrollToBottomDivRefInbox.current?.scrollIntoView();
  };

  useEffect(() => {
    getAllMessagesBetweenTwoUser();
  }, []);

  // const handleSendMessageSocket = async (message) => {
  //   const messageData = {
  //     room: "12345",
  //     author: user.name,
  //     message: message,
  //   };

  //   await socket.emit("send_message", messageData);
  // };

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

  return (
    <div
      style={{ display: hideMessageListOnSmallDevices ? "none" : "block" }}
      className="current-user-message-list"
    >
      {inboxMessages == null ? (
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
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  fill="#FFF"
                  cx="54"
                  cy="32.5"
                  rx="17"
                  ry="17.5"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  fill="#1DBF73"
                  d="M57 23c0-1.2-.8-2-2.1-2H17.1c-1.3 0-2.1.8-2.1 2s.9 2 2.1 2h37.8c1.3 0 2.1-.8 2.1-2m-22 8H17c-1.2 0-2 .8-2 2s.8 2 2 2h18c1.2 0 2-.8 2-2s-1-2-2-2"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  fill="#555"
                  d="M43.7 53.4c-.4 0-1 .2-1.5.4L24.5 69.4V54.8c0-1-.6-1.9-1.7-2.1-10.7-2-18.6-12.2-18.6-24 0-13.5 10-24.5 22.4-24.5h24.9c12.3 0 22.4 11 22.4 24.5s-10 24.5-22.4 24.5l-7.8.2zM51.4 0H26.6C11.9 0 0 12.9 0 28.7 0 42 8.4 53.4 20.3 56.5v17.4c0 .8.4 1.5 1.3 1.9.2.2.6.2.8.2.4 0 1-.2 1.5-.4l20.7-18.1h7.1C66.1 57.5 78 44.6 78 28.7 78 12.9 66.1 0 51.4 0z"
                />
                <path
                  fill="none"
                  stroke="#FFF"
                  stroke-width="4"
                  d="M43.7 51.4l7.8-.2c11.2 0 20.4-10.1 20.4-22.5S62.6 6.2 51.4 6.2H26.6c-11.2 0-20.4 10-20.4 22.5 0 10.9 7.3 20.2 17 22.1 2 .4 3.3 2 3.3 4v10.1l14.7-12.8.2-.1c.7-.4 1.5-.6 2.3-.6h0zm1.6 8.1L25 77.3l-.2.1c-.8.3-1.7.6-2.4.6-.2 0-.5 0-.7-.1-.4-.1-.8-.2-1.2-.5-1.4-.8-2.1-2-2.1-3.5V58C6.3 54.1-2 42.3-2 28.7-2 11.8 10.8-2 26.6-2h24.9C67.2-2 80 11.8 80 28.7c0 17-12.7 30.9-28.3 30.9h-6.4v-.1z"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
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
          <div className="inbox-message-list-section-1">
            <header>
              <div
                className="inbox-message-list-header-icon"
                onClick={() => setHideMessageListOnSmallDevices(true)}
              >
                <i className="fa-solid fa-chevron-left"></i>
              </div>
              <h2>
                <Link to={`/user/${currentSelectedClient._id}`}>
                  {currentSelectedClient.name}
                </Link>
              </h2>
              <div className="inbox-message-list-header-icon">
                <i className="fa-solid fa-ellipsis"></i>
              </div>
            </header>
          </div>
          <div className="inbox-message-list-section-2">
            <ul>
              {inboxMessages.map((item, index) => {
                item.sender = item.sender as IUser;
                return (
                  <li key={item._id}>
                    {item.sender.avatar?.url ? (
                      <img src={item.sender.avatar.url}></img>
                    ) : (
                      <div>
                        <i
                          className={
                            "fa-solid fa-" + item.sender.name[0].toLowerCase()
                          }
                        ></i>
                      </div>
                    )}
                    <div className="inbox-messages-list-sender-info">
                      <div className="inbox-messages-list-sender-name">
                        {item.sender.name === user.name
                          ? "Me"
                          : item.sender.name}
                      </div>
                      <p className="inbox-messages-list-sender-date">
                        <Moment format="DD MMM YYYY, HH:mm">
                          {item.createdAt}
                        </Moment>
                      </p>
                      <p className="inbox-messages-list-sender-text">
                        {item.message.text}
                      </p>
                    </div>
                  </li>
                );
              })}
              <div ref={scrollToBottomDivRefInbox}></div>
            </ul>
            <form id="inbox-chat-form" onSubmit={(e) => sendChat(e)}>
              {isFilePicked && (
                <div className="chat-attached-files-div">
                  <div className="chat-attached-files-heading">
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
                            <i className="fa-solid fa-xmark"></i>
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
          </div>
          <div className="inbox-message-list-section-3">
            <footer>
              <div>
                <div className="chat-emoji inbox-emoji-picker ">
                  <div onClick={handleEmojiPickerHideOrShow}>
                    <i className="fa-regular fa-face-smile"></i>
                  </div>
                  {showEmojiPicker && (
                    <Picker
                      onClickOutside={() => setShowEmojiPicker(false)}
                      onEmojiSelect={handleEmojiClick}
                      perLine={8}
                      skinTonePosition="none"
                      previewPosition="none"
                      maxFrequentRows={2}
                    />
                  )}
                </div>
                <div className="chat-attachment">
                  <label htmlFor="chat-inbox-input-file">
                    <i className="fa-solid fa-paperclip"></i>
                  </label>
                  <input
                    onChange={handleSelectionOfFiles}
                    id="chat-inbox-input-file"
                    multiple={true}
                    type="file"
                    hidden={true}
                  ></input>
                </div>
              </div>
              <button
                type="submit"
                form="inbox-chat-form"
                style={{
                  opacity: message.length > 0 || isFilePicked ? "1" : "0.4",
                }}
              >
                <i className="fa-regular fa-paper-plane"></i>
                &nbsp; Send Message
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};
