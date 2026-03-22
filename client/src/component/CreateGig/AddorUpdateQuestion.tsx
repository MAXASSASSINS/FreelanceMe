import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { FREE_TEXT, MULTIPLE_CHOICE } from "../../constants/globalConstants";
import { QuestionState } from "../../reducers/createGigQuestionReducer";
import { CheckInput } from "../CheckInput";
import SelectInput2 from "../SelectInput2";
import { TextArea } from "../TextArea";
import { questionTypeData } from "./createGigData";

type AddorUpdateQuestionProps = {
  handleCancelAdd: () => void;
  handleAddQuestion?: (payload: QuestionState) => void;
  edit: boolean;
  handleUpdateQuestion?: (index: number, payload: QuestionState) => void;
  indexOfQuestionToEdit?: number;
  questionDetail?: QuestionState;
};

export const AddorUpdateQuestion = ({
  questionDetail,
  handleCancelAdd,
  handleAddQuestion,
  edit,
  handleUpdateQuestion,
  indexOfQuestionToEdit,
}: AddorUpdateQuestionProps) => {
  const [questionType, setQuestionType] = useState<string>(FREE_TEXT);
  const [questionTitle, setQuestionTitle] = useState<string>("");
  const [questionRequiredInput, setQuestionRequiredInput] =
    useState<boolean>(false);
  const [enableMultipleOptionsInput, setEnableMultipleOptionsInput] =
    useState<boolean>(false);
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [warnings, setWarnings] = useState<string[]>(["", ""]);
  const [warningEnabled, setWarningEnabled] = useState<boolean>(false);

  const getRequiredStatusOfQuestion = (val: boolean) => {
    setQuestionRequiredInput(val);
  };

  const getQuestionTitle = (val: string) => {
    setQuestionTitle(val);
  };

  const getQuestionType = (val: string) => {
    setQuestionType(val);
  };

  const getMultipleOptionSelectionStatus = (val: boolean) => {
    setEnableMultipleOptionsInput(val);
  };

  const handleAddNewOption = () => {
    setOptions([...options, ""]);
    setWarnings([...warnings, ""]);
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = options.filter((item, i) => i !== index);
    setOptions(newOptions);
  };

  const handleOptionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newOptions = options.map((item, i) => {
      if (i === index) {
        return e.target.value;
      } else {
        return item;
      }
    });
    setOptions(newOptions);
  };

  const checkForAnyEmptyFieldsForQuestion = () => {
    let error = false;

    if (questionTitle.toString().trim().length < 2) {
      error = true;
      setWarningEnabled(true);
    }
    if (questionType === MULTIPLE_CHOICE) {
      options.forEach((item, index) => {
        if (item.toString().trim().length === 0) {
          error = true;
          setWarningEnabled(true);
        }
      });
    }
    return error;
  };

  const handleSubmit = () => {
    let error = checkForAnyEmptyFieldsForQuestion();
    if (error) return;
    const payload: QuestionState = {
      question: questionTitle,
      type: questionType,
      requiredStatus: questionRequiredInput,
      multipleOptionSelectionStatus: enableMultipleOptionsInput,
      options: options,
      showEditQuestion: false,
    };
    commonForEditAddCancelQuestion();
    if(indexOfQuestionToEdit !== undefined && indexOfQuestionToEdit !== -1 && edit !== undefined){
      handleUpdateQuestion!(indexOfQuestionToEdit, payload);
    }
    else{
      handleAddQuestion!(payload);
    }
  }

  const commonForEditAddCancelQuestion = () => {
    setOptions(["", ""]);
    setQuestionType(FREE_TEXT);
    setWarningEnabled(false);
    setQuestionTitle("");
    setEnableMultipleOptionsInput(false);
    setQuestionRequiredInput(false);
  };

  useEffect(() => {
    if(indexOfQuestionToEdit === -1 || !questionDetail) return;
    setEnableMultipleOptionsInput(questionDetail.multipleOptionSelectionStatus);
    setQuestionTitle(questionDetail.question);
    setQuestionType(questionDetail.type);
    setQuestionRequiredInput(questionDetail.requiredStatus);
    setOptions(questionDetail.options);
  }, [indexOfQuestionToEdit, questionDetail])

  return (
    <div className="bg-separator border border-dark_separator p-3 text-sm sm:text-base sm:p-6 text-light_heading">
      <header className="font-normal flex justify-between sm:text-base mb-3">
        <h6 className="text-light_grey font-semibold text-base">Add a question</h6>
        <CheckInput
          label="Required"
          onChange={getRequiredStatusOfQuestion}
          defaultValue={questionRequiredInput}
          value={questionRequiredInput}
        />
      </header>

      <div className="mb-4 relative text-sm sm:text-base">
        <TextArea
          maxLength={400}
          minLength={2}
          placeholder={
            "Request necessary details such as dimensions, brand guidelines, and more"
          }
          className="h-32 "
          onChange={getQuestionTitle}
          value={questionTitle}
        />
        <div
          className="absolute text-warning text-sm bottom-0"
          style={{
            display:
              questionTitle.trim().length < 2 && warningEnabled
                ? "block"
                : "none",
          }}
        >
          Description should be at least 2 characters long
        </div>
      </div>

      <div>
        <h6 className="font-semibold text-light_heading mb-4">
          Get it in a form of:
        </h6>
        <div className="flex flex-col gap-4 md:items-center md:flex-row justify-between">
          <div>
            <SelectInput2
              data={questionTypeData}
              defaultOption={questionType}
              onChange={getQuestionType}
              style={{ width: "15rem", textTransform: "capitalize" }}
              value={questionType}
            />
          </div>

          {questionType === MULTIPLE_CHOICE && (
            <div>
              <CheckInput
                label="Enable to choose more than 1 option"
                onChange={getMultipleOptionSelectionStatus}
                defaultValue={enableMultipleOptionsInput}
                value={enableMultipleOptionsInput}
              />
            </div>
          )}
        </div>
      </div>

      {questionType === MULTIPLE_CHOICE && (
        <div className="mt-5">
          {options.map((option, index) => (
            <div className="option" key={"option" + index}>
              <div className="relative w-full flex items-center">
                <input
                  className="block w-full my-2 p-2 pr-10 border border-no_focus rounded placeholder:text-no_focus hover:border-light_heading focus:outline-none"
                  placeholder="Add Option"
                  onChange={(e) => handleOptionChange(e, index)}
                  value={option}
                />
                <span
                  style={{ display: options.length <= 2 ? "none" : "block" }}
                  className="absolute right-4 text-dark_grey hover:cursor-pointer"
                  onClick={() => handleRemoveOption(index)}
                >
                  <IoClose />
                </span>
              </div>
              <div
                className="text-warning text-sm -mt-2 mb-4"
                style={{
                  display:
                    options[index].trim().length === 0 && warningEnabled
                      ? "block"
                      : "none",
                }}
              >
                Description should be at least 1 character long
              </div>
            </div>
          ))}
          <button
            onClick={handleAddNewOption}
            className="bg-white py-2 px-4 text-sm md:text-base md:px-6 rounded text-link border border-link transition-all duration-200 hover:bg-link hover:text-white hover:cursor-pointer"
            >
            + Add New Option
          </button>
        </div>
      )}

      <div className="flex mt-8 sm:mt-4 justify-end">
        <button
          className="px-8 py-2 rounded transition-all duration-200 hover:cursor-pointer border border-light_heading text-light_heading mr-4 hover:bg-light_heading hover:text-white"
          onClick={handleCancelAdd}
        >
          Cancel
        </button>
        <button
          className="text-white rounded transition-all duration-200  px-8 py-2 bg-primary border-none hover:bg-primary_hover hover:cursor-pointer"
          // onClick={handleAddQuestion}
          onClick={handleSubmit}
        >
          {edit ? "Update" : "Add"}
        </button>
        {/* <button
          className="text-white transition-all duration-200 hover:cursor-pointer rounded  px-8 py-3 bg-primary border-none hover:bg-primary_hover"
          style={{ display: edit ? "block" : "none" }}
          onClick={() => handleUpdateQuestion!(indexOfQuestionToEdit!)}
        >
          Update
        </button> */}
      </div>
    </div>
  );
};
