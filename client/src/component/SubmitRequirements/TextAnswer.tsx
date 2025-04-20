import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { TextArea, TextAreaRef } from "../TextArea";
import { getFileSize } from "../../utility/util";
import { IoMdAttach } from "react-icons/io";
import { BsTrash } from "react-icons/bs";
import { GB, MB } from "../../constants/globalConstants";

type TextAnswerProps = {};

export type TextAnswerRef = {
  answer: {
    answerText: string;
    files: File[];
  };
};

const TextAnswer = (props: TextAnswerProps, ref: React.Ref<TextAnswerRef>) => {
  const [answerText, setAnswerText] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [maxSizeErrors, setMaxSizeErrors] = useState<boolean[]>([]);
  const textRef = useRef<TextAreaRef>(null);

  const handleAnswerFileRemoval = (fileIndex: number) => {
    const files = selectedFiles.filter((_, idx) => idx !== fileIndex);
    const errors = files.map((file) => file.size > 5 * GB);
    setMaxSizeErrors(errors);
    setSelectedFiles(files);
  };

  const handleAnswerFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...selectedFiles, ...files];
    const errors = newFiles.map((file) => file.size > 5 * GB);
    setMaxSizeErrors(errors);
    setSelectedFiles(newFiles);
  };

  useImperativeHandle(
    ref,
    () => ({
      answer: {
        answerText: answerText,
        files: selectedFiles,
      },
    }),
    [selectedFiles, answerText]
  );

  return (
    <div className="mt-4 rounded-none">
      <TextArea
        maxLength={2500}
        className="rounded-none h-[100px]"
        ref={textRef}
        onChange={(text) => setAnswerText(text)}
      />
      <div className="">
        <label
          data-tooltip-content="Attach files. 5GB max."
          data-tooltip-place="right"
          data-tooltip-id="my-tooltip"
          className="bg-separator text-sm font-bold border inline-flex items-center py-1 px-2 gap-1 hover:cursor-pointer hover:text-dark_grey hover:bg-dark_separator"
        >
          <input type="file" hidden multiple onChange={handleAnswerFile} />
          <IoMdAttach className="hover:text-dark_grey" />
          Attach Files
        </label>
      </div>

      {selectedFiles?.length > 0 && (
        <div className="mt-2 inline-flex flex-col gap-2">
          {selectedFiles.map((file, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between py-1 px-2 rounded gap-8 border-2 bg-separator ${
                maxSizeErrors[idx] ? "border-error" : "border-separator"
              }`}
            >
              <div className="w-40 sm:min-w-60 overflow-hidden">
                <div className="text-sm truncate">{file.name}</div>
                <div className="text-sm text-left">
                  {getFileSize(file.size)}
                </div>
              </div>
              <div
                onClick={() => handleAnswerFileRemoval(idx)}
                className="hover:bg-icons hover:text-white p-2 rounded-full hover:cursor-pointer"
              >
                <BsTrash />
              </div>
            </div>
          ))}
        </div>
      )}
      {maxSizeErrors?.length > 0 && maxSizeErrors.includes(true) && (
        <div className="text-error text-sm mt-1">
          File size should not exceed 5GB.
        </div>
      )}
    </div>
  );
};

export default forwardRef(TextAnswer);
