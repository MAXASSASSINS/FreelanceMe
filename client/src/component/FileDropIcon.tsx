import React, { forwardRef, useImperativeHandle, useState } from "react";
import { AiOutlineVideoCamera } from "react-icons/ai";
import { BsTrash } from "react-icons/bs";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { RiImage2Line } from "react-icons/ri";
import { VscFilePdf } from "react-icons/vsc";
import { IFile } from "../types/file.types";

type FileDropIconProps = {
  type: "image" | "video";
  fileAcceptType: string;
  getSelectedFile: (file?: any, index?: number) => void;
  index?: number;
  maxFileSize: number;
  getError: (error: string) => void;
  maxDuration?: number;
};

export type FileDropIconRef = {
  setFileComingFromParent: (file: IFile) => void;
};

export const FileDropIcon = forwardRef(
  (
    {
      type,
      fileAcceptType,
      getSelectedFile,
      index,
      maxFileSize,
      getError,
      maxDuration,
    }: FileDropIconProps,
    ref: React.Ref<FileDropIconRef>
  ) => {
    const [selectedFile, setSelectedFile] = useState<IFile | File | null>(null);
    const [previewUrl, setPreviewUrL] = useState<string>("");

    const preveiwImageHandler = (file: File | null) => {
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrL(reader.result as string);
      };
      reader.readAsDataURL(file);
    };

    useImperativeHandle(
      ref,
      () => ({
        setFileComingFromParent(file) {
          if (file) setSelectedFile(file);
          if (file?.url) {
            setPreviewUrL(file.url);
          }
          if (file?.url) {
            setPreviewUrL(file.url);
          }
        },
      }),
      []
    );

    const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
      getError("");
      const file = event.target.files?.[0];
      if (!file) return;
      if (file.size > maxFileSize) {
        getError(
          `File size should be less than ${maxFileSize / (1024 * 1024)}MB`
        );
        return;
      } else if (type === "video") {
        const video = document.createElement("video");
        video.preload = "metadata";

        video.onloadedmetadata = function () {
          window.URL.revokeObjectURL(video.src);
          if (video.duration >= (maxDuration || 180)) {
            getError(
              `Video duration should be less than ${maxDuration} seconds`
            );
            return;
          }
          setSelectedFile(file);
          console.log(file);
          getSelectedFile(file, index);
        };
        video.src = URL.createObjectURL(file);
      } else {
        setSelectedFile(file);
        getSelectedFile(file, index);
        preveiwImageHandler(file);
      }
    };

    const handleRemoveSelectedFile = () => {
      setSelectedFile(null);
      getSelectedFile(null, index);
      setPreviewUrL("");
    };

    return (
      <>
        {selectedFile ? (
          <div className="relative bg-white border border-dashed border-no_focus flex flex-col items-center justify-center text-center max-w-[15rem] h-40 w-full gap-1 text-[0.9rem] text-light_heading">
            {type === "image" ? (
              <img
                className="w-full h-full"
                src={previewUrl}
                alt={previewUrl}
              ></img>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <IoCheckmarkCircleOutline className="text-[3.5rem] text-primary mb-4" />
                <div className="w-full max-w-[10rem] leading-4 text-ellipsis overflow-hidden">
                  {(selectedFile as any).name}
                </div>
              </div>
            )}
            <div
              onClick={handleRemoveSelectedFile}
              className="absolute top-4 right-4 p-2 bg-light_heading rounded-lg text-white hover:cursor-pointer hover:bg-dark_grey"
            >
              <BsTrash />
            </div>
          </div>
        ) : (
          <div className="relative text-sm sm:text-base bg-white border border-dashed border-no_focus flex flex-col items-center justify-center text-no_focus text-center max-w-[15rem] w-full h-40 gap-1">
            {type === "image" ? (
              <>
                <RiImage2Line className="text-5xl" />
                <div className="leading-4">Drag & drop a Photo or</div>
              </>
            ) : type === "video" ? (
              <>
                <AiOutlineVideoCamera className="text-5xl" />
                <div>Drag & drop a Video or</div>
              </>
            ) : (
              <>
                <VscFilePdf className="text-5xl" />
                <div>Drag & drop a Pdf or</div>
              </>
            )}
            <div className="text-[0.9rem] leading-8">
              <label className="cursor-pointer block text-link">
                Browse
                <input
                  onChange={changeHandler}
                  accept={fileAcceptType}
                  type="file"
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </>
    );
  }
);
