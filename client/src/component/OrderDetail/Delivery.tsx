import { useContext } from "react";
import { HiDownload } from "react-icons/hi";
import { IoDocumentOutline } from "react-icons/io5";
import Moment from "react-moment";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { windowContext } from "../../App";
import { IOrder } from "../../types/order.types";
import { downloadFile, getFileSize } from "../../utility/util";
import { Avatar } from "../Avatar/Avatar";
import { LazyImage } from "../LazyImage/LazyImage";
import { LazyVideo } from "../LazyVideo.js/LazyVideo";
import { RootState } from "../../store";
import { IUser } from "../../types/user.types";

type DeliveryProps = {
  orderDetail: IOrder;
};

export const Delivery = ({ orderDetail }: DeliveryProps) => {
  let { deliveries, seller, buyer } = orderDetail;

  const { user } = useSelector((state: RootState) => state.user);

  return (
    <div className="bg-white p-8 text-dark_grey rounded shadow-md ">
      {deliveries.length === 0 ? (
        <div className="text-no_focus min-h-[10rem] h-full flex justify-center items-center">
          {user!._id === (buyer as IUser)._id ? (
            <p>You haven't received any deliveries yet.</p>
          ) : (
            <p>You haven't made any deliveries yet.</p>
          )}
        </div>
      ) : (
        deliveries.map((delivery, index) => {
          seller = seller as IUser;
          return (
            <div className="relative pb-8 mb-8 border-b last:border-b-0">
              <div className="border rounded">
                <div className="flex items-center justify-between uppercase py-3 px-4 bg-separator text-light_heading font-semibold">
                  <p>delivery #{index + 1}</p>
                  <Moment className="text-sm" format="MMM DD, h:mm A">
                    {delivery.deliveredAt}
                  </Moment>
                </div>
                <div className="p-4">
                  <div
                    key={delivery._id}
                    className="flex items-center gap-4 font-semibold text-light_heading"
                  >
                    <div className="aspect-square rounded-full">
                      <Avatar
                        avatarUrl={seller.avatar?.url}
                        userName={seller.name}
                        width="2rem"
                        fontSize="1rem"
                        alt={seller.name}
                      />
                    </div>
                    <div className="[&>*]:leading-5 flex-grow pr-6 py-2">
                      <span className="mr-2">
                        {seller._id === user!._id ? (
                          "Me"
                        ) : (
                          <>
                            <Link
                              to={`/user/${seller._id}`}
                              className="text-primary hover:underline"
                            >
                              {seller.name}
                            </Link>
                            's delivery
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="ml-12 pb-4">
                    <p className="leading-5 whitespace-pre-wrap pr-6 text-dark_grey max-w-2xl">
                      {delivery.message}
                    </p>
                    <div className="mt-8 pr-6 flex flex-col gap-8 min-[500px]:grid min-[500px]:grid-cols-2 min-[500px]:items-end min-[1200px]:grid-cols-3">
                      {delivery.files?.map((file, index) => (
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
        })
      )}
    </div>
  );
};
