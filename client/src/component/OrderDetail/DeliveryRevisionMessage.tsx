import React from "react";
import { FiPackage } from "react-icons/fi";
import { IUser } from "../../types/user.types";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import Moment from "react-moment";
import { Link } from "react-router-dom";
import { LazyVideo } from "../LazyVideo.js/LazyVideo";
import { LazyImage } from "../LazyImage/LazyImage";
import { IoDocumentOutline } from "react-icons/io5";
import { downloadFile, getFileSize } from "../../utility/util";
import { HiDownload } from "react-icons/hi";
import { GroupedMessage } from "./Activities";
import { Avatar } from "../Avatar/Avatar";
import { BiRevision } from "react-icons/bi";
import SpecialMessage from "./SpecialMessage";

type DeliveryRevisionMessageProps = {
  message: GroupedMessage;
};

const DeliveryRevisionMessage = ({ message }: DeliveryRevisionMessageProps) => {
  const { user } = useSelector((state: RootState) => state.user);

  message.sender = message.sender as IUser;
  message.receiver = message.receiver as IUser;
  return (
    <div className="">
      <SpecialMessage
        icon={message.forDelivery ? <FiPackage /> : <BiRevision />}
        iconBgColor={"bg-pink-100"}
        iconColor={"text-pink-400"}
        date={message.createdAt}
      >
        {(message.sender as IUser)._id === user!._id ? (
          message.forDelivery ? (
            "You delivered the order"
          ) : (
            "You requested a revision"
          )
        ) : (
          <>
            <Link
              to={`/user/${message.sender._id}`}
              className="text-primary hover:underline"
            >
              {message.sender.name}
            </Link>
            &nbsp;{" "}
            {message.forDelivery
              ? "delivered the order"
              : "requested a revision"}
          </>
        )}
      </SpecialMessage>
      <div className="border mr-6 rounded mt-4">
        <div className="uppercase py-3 px-4 bg-separator text-light_heading font-semibold">
          {message.forDelivery
            ? `delivery #${message.deliveryNumber}`
            : "Revision Request"}
        </div>
        <div className="p-4">
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
            <div className="[&>*]:leading-5 flex-grow pr-6 py-2">
              <span className="mr-2">
                {message.sender._id === user!._id ? (
                  "Me"
                ) : (
                  <>
                    <Link
                      to={`/user/${message.sender._id}`}
                      className="text-primary hover:underline"
                    >
                      {message.sender.name}
                    </Link>
                    's message
                  </>
                )}
              </span>
            </div>
          </div>
          <div className="ml-12 pb-4">
            <p className="leading-5 whitespace-pre-wrap pr-6 text-dark_grey max-w-2xl">
              {message.message.text}
            </p>
            <div className="mt-8 pr-6 flex flex-col gap-8 min-[500px]:grid min-[500px]:grid-cols-2 min-[500px]:items-end min-[1200px]:grid-cols-3">
              {message.files?.map((file, index) => (
                <div key={index} className="">
                  <p className="flex flex-col justify-end max-w-[8rem] max-h-48 min-h-[5rem] min-w-[5rem] overflow-hidden min-[500px]:max-w-[10rem] min-[1000px]:max-w-[12rem]">
                    {file.type.includes("video") ? (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <LazyVideo file={file} aspectRatio="16/9" />
                      </a>
                    ) : file.type.includes("image") ? (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
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
      </div>
    </div>
  );
};

export default DeliveryRevisionMessage;
