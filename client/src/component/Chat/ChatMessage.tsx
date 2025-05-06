import { HiDownload } from "react-icons/hi";
import { IoDocumentOutline } from "react-icons/io5";
import Moment from "react-moment";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { IMessage } from "../../types/message.types";
import { IUser } from "../../types/user.types";
import { downloadFile, getFileSize } from "../../utility/util";
import { Avatar } from "../Avatar/Avatar";
import { LazyImage } from "../LazyImage/LazyImage";
import { LazyVideo } from "../LazyVideo.js/LazyVideo";

type ChatMessageProps = {
  message: IMessage;
};

const ChatMessage = ({ message }: ChatMessageProps) => {
  const { user } = useSelector((state: RootState) => state.user);
  message.sender = message.sender as IUser;
  message.receiver = message.receiver as IUser;

  return (
    <div
      key={message._id}
      className="flex items-start text-[0.9rem] text-light_heading gap-4"
    >
      <div className="w-8 rounded-full">
        <Avatar
          avatarUrl={message.sender.avatar?.url}
          userName={message.sender.name}
          width="2rem"
        />
      </div>
      <div>
        <div className="mb-1">
          <span className="font-bold text-dark_grey">
            {message.sender._id === user!._id ? "Me" : message.sender.name}
          </span>
          &nbsp;
          <span className="text-xs text-light_heading">
            <Moment format="D MMM,  H:mm">{message.updatedAt}</Moment>
          </span>
        </div>
        <div className="leading-6 whitespace-pre-line">
          {message.message.text}
        </div>
        {message.files.length > 0 && (
          <div className="flex flex-col gap-8 mt-4">
            {message.files.map((file, index) => (
              <div key={index} className="max-w-[10rem]">
                <p className="flex flex-col justify-end max-w-[10rem] max-h-48 min-h-[5rem] min-w-[5rem] overflow-hidden">
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
                      className="max-w-[10rem]"
                      preload="none"
                      controls
                      src={file.url}
                    />
                  ) : (
                    <div className="max-w-[10rem] bg-separator w-48 h-24 flex justify-center items-center text-5xl rounded">
                      <div>
                        <IoDocumentOutline />
                      </div>
                    </div>
                  )}
                </p>
                <div
                  onClick={() => downloadFile(file.url, file.name)}
                  className="flex flex-col justify-between gap-2 cursor-pointer text-[0.8rem] bg-separator mt-2 p-2"
                >
                  <div
                    data-tooltip-id="my-tooltip"
                    data-tooltip-content={file.name}
                    data-tooltip-place="bottom"
                    className="flex justify-between items-center gap-2 hover:cursor-pointer hover:text-primary"
                  >
                    <HiDownload />
                    <div className="max-w-[15ch] whitespace-nowrap overflow-hidden">
                      {file.name}
                    </div>
                  </div>
                  <p className="text-right">
                    ({getFileSize(file.size ? file.size : 0)})
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
