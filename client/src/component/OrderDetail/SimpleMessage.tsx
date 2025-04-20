import { HiDownload } from "react-icons/hi";
import { IoDocumentOutline } from "react-icons/io5";
import Moment from "react-moment";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../../store";
import { IUser } from "../../types/user.types";
import { downloadFile, getFileSize } from "../../utility/util";
import { Avatar } from "../Avatar/Avatar";
import { LazyImage } from "../LazyImage/LazyImage";
import { LazyVideo } from "../LazyVideo.js/LazyVideo";
import { GroupedMessage } from "./Activities";

type SimpleMessageProps = {
  message: GroupedMessage;
};

const SimpleMessage = ({ message }: SimpleMessageProps) => {
  const { user } = useSelector((state: RootState) => state.user);

  message.sender = message.sender as IUser;
  message.receiver = message.receiver as IUser;
  return (
    <div className="">
      <div
        key={message._id}
        className="flex items-center gap-4 font-semibold text-light_heading"
      >
        <div className="aspect-square rounded-full">
          <Avatar
            avatarUrl={message.sender.avatar?.url}
            userName={message.sender.name}
            width="2rem"
            fontSize="1rem"
            alt={message.sender.name}
          />
        </div>
        <div className="[&>*]:leading-5 flex-grow pr-6 py-2 border-b border-b-dark_separator">
          <span className="mr-2">
            {message.sender._id === user!._id ? (
              "You"
            ) : (
              <Link
                to={`/user/${message.sender._id}`}
                className="text-primary hover:underline"
              >
                {message.sender.name}
              </Link>
            )}
            &nbsp; sent &nbsp;
            {message.receiver._id === user!._id ? (
              "You "
            ) : (
              <Link
                to={`/user/${message.receiver._id}`}
                className="text-primary hover:underline"
              >
                {message.receiver.name}
              </Link>
            )}
            &nbsp; a message
          </span>
          <span className="text-icons font-normal text-xs">
            <Moment format="MMM DD, H:mm A">{message.createdAt}</Moment>
          </span>
        </div>
      </div>
      <div className="pt-2 ml-12 pb-4 border-b">
        <p className="leading-5 whitespace-pre-wrap pr-6 text-dark_grey max-w-2xl">
          {message.message.text}
        </p>
        <div className="mt-8 pr-6 flex flex-col gap-8 min-[500px]:grid min-[500px]:grid-cols-2 min-[500px]:items-end min-[1200px]:grid-cols-3">
          {message.files?.map((file, index) => (
            <div key={index} className="">
              <p className="flex flex-col justify-end max-w-[8rem] max-h-48 min-h-[5rem] min-w-[5rem] overflow-hidden min-[500px]:max-w-[10rem] min-[1000px]:max-w-[12rem]">
                {file.type.includes("video") ? (
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    <LazyVideo file={file} aspectRatio="16/9" />
                  </a>
                ) : file.type.includes("image") ? (
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    <LazyImage file={file} aspectRatio="16/9" />
                  </a>
                ) : file.type.includes("audio") ? (
                  <audio
                    className="max-w-[10rem] min-[1000px]:max-w-[12rem]"
                    preload="none"
                    controls
                    src={file.url}
                  />
                ) : (
                  <div className="bg-separator w-40 h-24 flex justify-center items-center text-5xl rounded min-[1000px]:w-48 min-[1000px]:h-28">
                    <div>
                      <IoDocumentOutline />
                    </div>
                  </div>
                )}
              </p>
              <div
                onClick={() => downloadFile(file.url, file.name)}
                className="max-w-[8rem] flex flex-col justify-between gap-2 cursor-pointer mt-2 text-xs bg-separator p-2 min-[500px]:max-w-[10rem] min-[1000px]:max-w-[12rem]"
              >
                <div className="flex justify-between items-center hover:cursor-pointer hover:text-primary">
                  <HiDownload />
                  <div
                    data-tooltip-id="my-tooltip"
                    data-tooltip-content={file.name}
                    data-tooltip-place="bottom"
                    className="w-[12ch] sm:w-[15ch] text-right whitespace-nowrap overflow-hidden"
                  >
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
      </div>
    </div>
  );
};

export default SimpleMessage;
