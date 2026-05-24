import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useReducer,
  useRef,
  useState,
} from "react";
import { AiOutlineEllipsis } from "react-icons/ai";
import { TbGridDots } from "react-icons/tb";
import { TfiText } from "react-icons/tfi";
import { useDispatch, useSelector } from "react-redux";
import { AnyAction } from "redux";
import { REMOVE_QUESTION, RESET_ALL, UPDATE_QUESTION, UPDATE_SHOW_EDIT_QUESTION } from "../../constants/createGigQuestionConstants";
import {
  FREE_TEXT,
  MULTIPLE_CHOICE,
  QuestionType,
} from "../../constants/globalConstants";
import { StepProps, StepRef } from "../../Pages/CreateGig";
import {
  createGigQuestionReducer,
  QUESTION_DETAILS_INITIAL_STATE,
  QuestionState,
} from "../../reducers/createGigQuestionReducer";
import { AppDispatch, RootState } from "../../store";
import { IGigRequirement } from "../../types/gig.types";
import { AddorUpdateQuestion } from "./AddorUpdateQuestion";

const Step4 = ({ handleSendData }: StepProps, ref: React.Ref<StepRef>) => {
  const dispatch = useDispatch<AppDispatch>();
  const { gigDetail } = useSelector((state: RootState) => state.gigDetail);
  const [questionsDetails, questionDispatch] = useReducer(
    createGigQuestionReducer,
    QUESTION_DETAILS_INITIAL_STATE
  ) as [QuestionState[], React.Dispatch<AnyAction>];
  const [showQuestions, setShowQuestions] = useState<boolean>(true);
  const [indexOfQuestionToEdit, setIndexOfQuestionToEdit] =
    useState<number>(-1);
  const [showEditQuestion, setShowEditQuestion] = useState<boolean>(false);
  const hideEditRemoveOptionRefs = useRef<React.RefObject<HTMLDivElement>[]>(
    []
  );
  const [requirementsShortageWarning, setRequirementsShortageWarning] =
    useState(false);

  const checkForWarnings = () => {
    if (questionsDetails.length < 1) {
      setRequirementsShortageWarning(true);
      return true;
    }
  };

  const handleSubmit = async () => {
    if (checkForWarnings()) {
      return false;
    }
    const questionsDetailsData: IGigRequirement[] = [];
    questionsDetails.forEach((item, index) => {
      const questionData = {
        questionTitle: item.question,
        questionType: item.type.toString().toLowerCase() as QuestionType,
        options: item.options,
        answerRequired: item.requiredStatus,
        multipleOptionSelect: item.multipleOptionSelectionStatus,
      };
      questionsDetailsData.push(questionData);
    });
    const requirements = {
      requirements: questionsDetailsData,
    };
    console.log(requirements);
    const payload = { data: requirements, step: 4 };
    console.log(payload);

    const res = await handleSendData(payload);
    return res || false;
  };

  useImperativeHandle(ref, () => ({
    handleSubmit,
  }));

  const handleCancelAdd = () => {
    setShowQuestions(true);
    setShowEditQuestion(false);
  };

  const handleAddQuestion = (payload: QuestionState) => {
    questionDispatch({ type: "ADD_NEW_QUESTION", payload: payload });
    setShowQuestions(true);
    setShowEditQuestion(false);
    setRequirementsShortageWarning(false);
  };

  const handleRemoveQuestion = (index: number) => {
    handleShowEditQuestion(index);
    const payload = {
      questionIndex: index,
    };
    questionDispatch({ type: REMOVE_QUESTION, payload: payload });
  };

  const handleEditQuestion = (index: number) => {
    handleShowEditQuestion(index);
    setIndexOfQuestionToEdit(index);
    setShowQuestions(false);
    setShowEditQuestion(true);
  };

  const handleUpdateQuestion = (index: number, data: QuestionState) => {
    const payload = {
      ...data,
      questionIndex: index,
    }

    questionDispatch({ type: UPDATE_QUESTION, payload: payload });
    setShowQuestions(true);
    setShowEditQuestion(false);
    setIndexOfQuestionToEdit(-1);
  };

  const getQuestionOptions = (options: string[]) => {
    const string = options.join(", ");
    return string;
  };

  const handleShowEditQuestion = (index: number) => {
    const payload = {
      questionIndex: index,
      showEditQuestion: questionsDetails[index].showEditQuestion,
    };
    questionDispatch({ type: UPDATE_SHOW_EDIT_QUESTION, payload: payload });
  };

  useEffect(() => {
    if (!gigDetail) return;
    const { requirements } = gigDetail;
    console.log(requirements);
    requirements?.forEach((item, index) => {
      const data: QuestionState = {
        type: item.questionType,
        question: item.questionTitle,
        requiredStatus: item.answerRequired,
        options: item.options,
        multipleOptionSelectionStatus: item.multipleOptionSelect,
        showEditQuestion: false,
      };
      questionDispatch({ type: "ADD_NEW_QUESTION", payload: data });
    });

    return () => {
      questionDispatch({ type: RESET_ALL });
    };
  }, [gigDetail]);

  return (
    <div className="">
      <div className="rounded-[5px] border border-dark_separator p-4 sm:p-8 bg-white">
        <header className="text-lg font-semibold text-light_grey mb-4">
          Get all the information you need from buyers to get started
        </header>
        <p className="text-no_focus text-sm mb-4">
          Add questions to help buyers provide you with exactly what you need to
          start working on their order.
        </p>
        <div className="text-center flex items-center mt-2 justify-between uppercase text-[0.8rem] text-light_heading relative mb-4">
          <hr className="text-no_focus w-full" />
          <strong className="absolute translate-x-1/2 leading-4 right-1/2 z-[1] bg-white min-w-max px-8 text-xs">
            Your Questions
          </strong>
        </div>

        {showEditQuestion ? (
          <AddorUpdateQuestion
            handleCancelAdd={handleCancelAdd}
            edit={true}
            handleUpdateQuestion={handleUpdateQuestion}
            indexOfQuestionToEdit={indexOfQuestionToEdit}
            questionDetail={questionsDetails[indexOfQuestionToEdit]}
          />
        ) : !showQuestions ? (
          <AddorUpdateQuestion
            handleCancelAdd={handleCancelAdd}
            handleAddQuestion={handleAddQuestion}
            edit={false}
          />
        ) : (
          questionsDetails.map((question, index) => (
            <div className=" border border-dark_separator rounded-[3px] p-5 my-4 shadow-[0_0_3px_0] shadow-dark_separator">
              <div className=" flex items-center justify-between text-icons mb-4">
                <div className=" flex items-center gap-2 text-xs">
                  {question.type === FREE_TEXT ? (
                    <span>
                      <TfiText />
                    </span>
                  ) : (
                    <span>
                      <TbGridDots />
                    </span>
                  )}
                  <span className="capitalize">{question.type}</span>
                </div>
                <div
                  className="relative"
                  // ref={hideEditRemoveOptionRefs[index]}
                  ref={hideEditRemoveOptionRefs.current[index]}
                >
                  <div
                    className=" text-icons p-[0.2rem] hover:cursor-pointer hover:bg-separator hover:rounded-full"
                    onClick={() => handleShowEditQuestion(index)}
                  >
                    <AiOutlineEllipsis />
                  </div>
                  {question.showEditQuestion && (
                    <div>
                      {
                        <div className="border text-sm sm:text-base border-dark_separator absolute -left-12 top-6 minw-[7rem] z-[5] bg-white shadow-[0_0_3px_0] shadow-dark_separator">
                          <div
                            className="p-2 sm:p-3 text-light_heading cursor-pointer hover:bg-separator "
                            onClick={() => handleEditQuestion(index)}
                          >
                            Edit
                          </div>
                          <div
                            className="p-2 sm:p-3 text-light_heading cursor-pointer hover:bg-separator "
                            onClick={() => handleRemoveQuestion(index)}
                          >
                            Remove
                          </div>
                        </div>
                      }
                    </div>
                  )}
                </div>
              </div>
              <div className="font-bold text-light_grey text-sm mb-3">
                {question.question}
              </div>

              {question.type === MULTIPLE_CHOICE && (
                <div className="text-sm">
                  {getQuestionOptions(question.options)}
                </div>
              )}
            </div>
          ))
        )}
        {showQuestions && (
          <div className="mt-4">
            <button
              className="bg-white py-2 px-4 text-sm md:text-base md:px-6 rounded text-link border border-link transition-all duration-200 hover:bg-link hover:text-white hover:cursor-pointer"
              onClick={() => setShowQuestions(false)}
            >
              {" "}
              + Add New Question
            </button>
          </div>
        )}
        {requirementsShortageWarning && (
          <p className="text-warning text-sm mt-4">
            You must add at least 1 requirement
          </p>
        )}
      </div>
    </div>
  );
};

export default forwardRef(Step4);
