import { HiDownload } from "react-icons/hi";
import { IoDocumentOutline } from "react-icons/io5";
import { MULTIPLE_CHOICE } from "../../constants/globalConstants";
import { IOrder } from "../../types/order.types";
import { downloadFile, getFileSize } from "../../utility/util";
import { LazyImage } from "../LazyImage/LazyImage";
import { LazyVideo } from "../LazyVideo.js/LazyVideo";

type RequirementsProps = {
  orderDetail: IOrder;
};

export const Requirements = ({ orderDetail }: RequirementsProps) => {
  const { requirements } = orderDetail;

  return (
    <div className="bg-white p-8 text-dark_grey rounded shadow-md">
      {requirements.map((requirement, index) => (
        <div className="flex justify-between mb-8" key={index}>
          <div>
            <div className="flex gap-3">
              <p className="p-2 flex text-sm w-5 h-5 justify-center items-center text-white bg-no_focus rounded-full">
                {index + 1}
              </p>
              <h6 className="font-semibold mb-3">
                {requirement.questionTitle}
              </h6>
            </div>
            <div className="pl-8">
              {requirement.questionType === MULTIPLE_CHOICE &&
              requirement.options.filter((option) => option.selected).length >
                0 ? (
                <div className="flex flex-wrap gap-2">
                  {requirement.options.map(
                    (option, index) =>
                      option.selected && (
                        <div
                          key={index}
                          className="p-2 bg-separator text-light_heading rounded"
                        >
                          {option.title}
                        </div>
                      )
                  )}
                </div>
              ) : requirement.answerText || requirement.files.length > 0 ? (
                <>
                  <p className="text-light_heading">{requirement.answerText}</p>
                  {requirement.files?.length > 0 && (
                    <div className="mt-8 pr-6 flex flex-col gap-8 sm:gap-12 min-[500px]:grid min-[500px]:grid-cols-2 min-[500px]:items-end min-[1200px]:grid-cols-3">
                      {requirement.files?.map((file, index) => (
                        <div key={index} className="">
                          <p className="flex flex-col justify-end max-w-[8rem] max-h-48 min-h-[5rem] min-w-[5rem] min-[500px]:max-w-[10rem] min-[1000px]:max-w-[12rem]">
                            {file.type.includes("video") ? (
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <LazyVideo
                                  file={file}
                                  aspectRatio="16/9"
                                />
                              </a>
                            ) : file.type.includes("image") ? (
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <LazyImage
                                  file={file}
                                  aspectRatio="16/9"
                                />
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
                  )}
                </>
              ) : (
                <p className="text-light_heading">Not answered</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
