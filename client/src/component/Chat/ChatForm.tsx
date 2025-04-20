import Picker from "@emoji-mart/react";
import React, {
  ChangeEvent,
  FormEvent,
  forwardRef,
  Ref,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { FaRegPaperPlane } from "react-icons/fa";
import { FiPaperclip } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { windowContext } from "../../App";
import { RootState } from "../../store";
import { IFile } from "../../types/file.types";
import { IUser } from "../../types/user.types";
import { axiosInstance } from "../../utility/axiosInstance";
import { uploadToCloudinaryV2 } from "../../utility/cloudinary";
import { useSocket } from "../../context/socketContext";

type SelectedFile = {
  selectedFile: File;
  id: number;
};

type ChatFormProps = {
  setFileLoading: React.Dispatch<React.SetStateAction<boolean>>;
  chatUser: IUser;
  scrollToBottomDivRef: React.RefObject<HTMLDivElement>;
  showSuggestion?: () => void;
};

export type ChatFormRef = {
  addSuggestion: (suggestion: string) => void;
};

const ChatForm = (
  {
    setFileLoading,
    chatUser,
    scrollToBottomDivRef,
    showSuggestion,
  }: ChatFormProps,
  ref: Ref<ChatFormRef>
) => {
  const socket = useSocket();
  const { windowWidth } = useContext(windowContext);

  const { user } = useSelector((state: RootState) => state.user);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [message, setMessage] = useState("");
  const [isFilePicked, setIsFilePicked] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const emojiPickerOpenerIconRef = useRef<HTMLDivElement>(null);
  const chatTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        to: (chatUser as IUser)._id,
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
    chatUser = chatUser as IUser;
    const sender = {
      avatar: user!.avatar,
      name: user!.name,
      _id: user!._id,
    };
    const receiver = {
      avatar: chatUser.avatar,
      name: chatUser.name,
      _id: chatUser._id,
    };

    if (receiver._id !== chatUser._id) return;

    const messageData = {
      message: {
        text: message,
      },
      sender,
      receiver,
      createdAt: new Date().getTime(),
      files,
    };
    socket.emit("send_message", messageData);
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

  const handleEmojiClick = (emoji: any) => {
    setShowEmojiPicker(false);
    setMessage(message + emoji.native);
  };

  const handleEmojiPickerHideOrShow = () => {
    setShowEmojiPicker(!showEmojiPicker);
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

  useEffect(() => {
    if (chatTextAreaRef.current) {
      const lineHeight = parseInt(
        window.getComputedStyle(chatTextAreaRef.current).lineHeight,
        10
      );
      chatTextAreaRef.current.style.height = lineHeight + "px";
      const scrollHeight = chatTextAreaRef.current.scrollHeight;
      const maxHeight = lineHeight * 5;
      chatTextAreaRef.current.style.height =
        Math.min(scrollHeight, maxHeight) + "px";
    }

    if (message.length === 0 && showSuggestion) {
      showSuggestion();
    }
  }, [message]);

  useImperativeHandle(
    ref,
    () => {
      return {
        addSuggestion: (suggestion: string) => {
          let newMsg = message.length !== 0 ? message + "\n" : message;
          newMsg += suggestion.substring(0, suggestion.length - 3) + " ";
          chatTextAreaRef.current?.focus();
          setMessage(newMsg);
        },
      };
    },
    [message]
  );

  const handleTextMessageChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const data = {
      senderId: user!._id.toString(),
      receiverId: (chatUser as IUser)._id.toString(),
    };
    setMessage(e.target.value);
    if (!isTyping){
      setIsTyping(true);
      socket.emit("typing_started", data);
    } 

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("typing_stopped", data);
    }, 2000);
  };

  return (
    <form
      id="chat-form"
      className="w-full border-t border-t-dark_separator flex flex-col gap-4 p-4 pt-6"
      onSubmit={(e) => sendChat(e)}
    >
      {selectedFiles && isFilePicked && (
        <div className="text-light_heading border border-no_focus max-h-[124px] overflow-y-scroll rounded p-4">
          <div className="text-[10px] font-semibold">
            ATTACHED FILES ({selectedFiles.length})
          </div>
          <ul>
            {selectedFiles.length > 0 &&
              selectedFiles.map((file, index) => (
                <li
                  key={index}
                  className="border border-dark_separator bg-separator inline-flex items-center max-w-[200px] text-[0.9rem] mr-2 mt-2 px-3 py-0.5 rounded-[5px] border-solid"
                >
                  <div className="overflow-ellipsis whitespace-nowrap overflow-hidden text-right [direction:rtl]">
                    {file.selectedFile.name}
                  </div>
                  <button
                    className="ml-2 border-none"
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
        className="focus:border-dark_grey border-no_focus text-[0.9rem] border block w-full max-h-32 leading-[1.6] resize-none p-2 rounded-[3px] border-[none] border-solid outline-none placeholder-no_focus"
        rows={1}
        maxLength={2500}
        onChange={handleTextMessageChange}
        value={message}
        placeholder="Type your message here..."
        spellCheck={false}
      />
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-4">
          <div
            ref={emojiPickerOpenerIconRef}
            onClick={handleEmojiPickerHideOrShow}
            className="text-2xl flex justify-center items-center w-10 h-10 p-2 rounded-[50%] text-light_heading hover:bg-off_white hover:text-primary [&>*]:cursor-pointer"
          >
            <div>
              <BsEmojiSmile />
            </div>
          </div>
          <div className="absolute bottom-36">
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
              className="text-2xl flex justify-center items-center w-10 h-10 p-2 rounded-[50%] text-light_heading hover:bg-off_white hover:text-primary [&>*]:cursor-pointer"
              htmlFor="chat-input-file"
            >
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
          className="disabled:opacity-40 py-2 px-4 border-none bg-primary text-white rounded"
          disabled={message.length > 0 || isFilePicked ? false : true}
        >
          <FaRegPaperPlane style={{ display: "inline" }} />
          &nbsp; Send Message
        </button>
      </div>
    </form>
  );
};

export default forwardRef(ChatForm);
