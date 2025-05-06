import React, {
  createRef,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { AiFillInfoCircle } from "react-icons/ai";
import { HiOutlineCheckCircle } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getOrderDetail } from "../actions/orderAction";
import { FREE_TEXT, GB } from "../constants/globalConstants";
import { useUpdateGlobalLoading } from "../context/globalLoadingContext";
import { AppDispatch, RootState } from "../store";
import { IFile } from "../types/file.types";
import { Option } from "../types/order.types";
import { axiosInstance } from "../utility/axiosInstance";
import { uploadToCloudinaryV2 } from "../utility/cloudinary";
import { CheckInput } from "../component/CheckInput";
import {
  MultipleOptionSelect,
  MultipleOptionSelectRef,
} from "../component/SubmitRequirements/MultipleOptionSelect";
import OrderedGigCard from "../component/OrderedGigCard";
import TextAnswer, { TextAnswerRef } from "../component/SubmitRequirements/TextAnswer";

type Answer = {
  answerText?: string;
  options: Option[];
  files: File[];
};

type AnswerRef = React.RefObject<TextAnswerRef | MultipleOptionSelectRef>;

export const SubmitRequirements = () => {
  const dispatch = useDispatch<AppDispatch>();
  const params = useParams();
  const navigate = useNavigate();
  const updateGlobalLoading = useUpdateGlobalLoading();

  const answersRef = useRef<AnswerRef[]>([]);
  const [approval, setApproval] = useState<boolean>(false);

  const [answerRequiredError, setAnswerRequiredError] =
    useState<boolean>(false);

  useEffect(() => {
    if (params.orderId) {
      dispatch(getOrderDetail(params.orderId));
    }
  }, [dispatch, params.orderId]);

  const { orderDetail } = useSelector((state: RootState) => state.orderDetail);

  if (orderDetail) {
    answersRef.current = orderDetail.requirements.map((question, index) => {
      if (answersRef.current[index]) {
        return answersRef.current[index];
      }
      if (question.questionType === FREE_TEXT) {
        return createRef<TextAnswerRef>();
      }
      return createRef<MultipleOptionSelectRef>();
    });
  }

  const getApprovalState = (val: boolean) => {
    setApproval(val);
  };

  const handleStartOrder = async () => {
    const answers: Answer[] = [];
    let error = false;
    orderDetail?.requirements.forEach((item, index) => {
      if (item.questionType === FREE_TEXT) {
        const ref = answersRef.current[index] as RefObject<TextAnswerRef>;

        const answer: Answer = {
          answerText: ref.current!.answer.answerText,
          files: ref.current!.answer.files,
          options: [],
        };

        answers.push(answer);
        if (
          item.answerRequired &&
          ref.current?.answer.answerText.trim() === "" &&
          ref.current?.answer.files.length === 0
        ) {
          setAnswerRequiredError(true);
          error = true;
          console.log("free text error");
        }
      } else {
        const ref = answersRef.current[
          index
        ] as RefObject<MultipleOptionSelectRef>;
        const answer: Answer = {
          files: [],
          options: [],
        };
        let answered = false;
        ref.current!.currValue.forEach((val, index) => {
          answer.options.push({
            title: item.options[index].title,
            selected: val,
          });
          if (val) {
            answered = true;
          }
        });
        answers.push(answer);
        if (!answered && item.answerRequired) {
          setAnswerRequiredError(true);
          error = true;
          console.log("multiple choice error");
          return;
        }
      }
    });

    if (error) {
      console.log("error");
      return;
    }

    updateGlobalLoading(true, "Submitting your answers");
    let filesData: File[] = [];
    let filesCountPerEachAnswer = [];
    for (let i = 0; i < answers.length; i++) {
      filesCountPerEachAnswer.push(answers[i].files.length);
      filesData.push(...answers[i].files);
    }
    const filesDataUrls: IFile[][] = [];
    try {
      const fileUrls = await uploadToCloudinaryV2(filesData, 5 * GB);
      let i = 0;
      while (fileUrls.length > 0) {
        let chunkSize = filesCountPerEachAnswer[i];
        filesDataUrls.push(fileUrls.splice(0, chunkSize));
        i++;
      }
    } catch (error) {
      console.log(error);
      return;
    }

    const payload = answers.map((answer, index) => {
      return {
        answerText: answer.answerText,
        options: answer.options,
        files: filesDataUrls[index],
      };
    });

    try {
      const { data } = await axiosInstance.put(
        `/order/update/requirements/${params.orderId}`,
        {
          answers: payload,
        }
      );
    } catch (error) {
      console.log(error);
      updateGlobalLoading(false);
      return;
    }

    setAnswerRequiredError(false);
    updateGlobalLoading(false);
    navigate(`/orders/${params.orderId}`, { replace: true });
  };

  return (
    <div className="px-8 md:px-20 xl:px-40 py-8 text-dark_grey">
      <div className="items-start grid grid-cols-6 md:grid-cols-10 gap-4">
        <div className="order-1 col-span-6 bg-green_background_color flex gap-2 items-center p-2 md:col-span-10">
          <div className="text-4xl sm:text-6xl md:text-7xl text-primary">
            <HiOutlineCheckCircle />
          </div>
          <div>
            <p className="font-bold sm:text-2xl md:text-3xl">
              Thank You for Your Purchase
            </p>
            <p className="text-xs mt-0.5 sm:mt-1">
              A receipt was sent to your email address
            </p>
          </div>
        </div>

        <div className="order-3 col-span-6 md:order-2 lg:col-span-7 border-1 border-dark_separator">
          <h3 className="px-4 py-3 font-bold min-[900px]:text-lg bg-separator">
            Submit Requirements to Start Your Order
          </h3>
          <p className="px-4 py-3 text-light_grey font-bold leading-5 text-sm sm:text-base min-[900px]:text-lg">
            The seller needs the following information to start working on your
            order:
          </p>
          <ul className="px-4">
            {orderDetail?.requirements?.map((question, index) => (
              <li
                key={index}
                className="py-3 last:border-b-0 border-b-1 my-2 border-b-dark_separator text-light_heading"
              >
                <div className="flex gap-2">
                  <div>{index + 1}.</div>
                  <div className="flex gap-x-0.5">
                    <div className="font-bold">{question.questionTitle}</div>
                    {question.answerRequired && (
                      <span className="text-error">*</span>
                    )}
                  </div>
                  {question.multipleOptionSelect && (
                    <div
                      data-tooltip-content="Multiple options can be selected"
                      data-tooltip-place="bottom"
                      data-tooltip-id="my-tooltip"
                    >
                      <AiFillInfoCircle className="text-no_focus" />
                    </div>
                  )}
                </div>
                {question.questionType === FREE_TEXT ? (
                  <TextAnswer
                    ref={answersRef.current[index] as RefObject<TextAnswerRef>}
                  />
                ) : (
                  <MultipleOptionSelect
                    options={question.options}
                    multiple={question.multipleOptionSelect}
                    ref={
                      answersRef.current[
                        index
                      ] as RefObject<MultipleOptionSelectRef>
                    }
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
        {orderDetail && (
          <div className="order-2 col-span-6 sm:col-start-2 sm:col-span-4  md:order-3 md:col-span-4 lg:col-span-3">
            <OrderedGigCard orderDetail={orderDetail} />
          </div>
        )}
        {answerRequiredError && (
          <div className="order-4 col-span-3 text-error text-sm -mt-3">
            *Please fill all the mandatory requirements
          </div>
        )}

        <div className="order-5 col-span-6 md:col-span-10  max-w-xl flex items-start text-light_heading">
          <CheckInput onChange={getApprovalState} />
          <p className="leading-5">
            The information I provided is <b>accurate and complete</b>. Any{" "}
            <b>changes</b> will require the seller's approval and may be subject
            to additional costs.
          </p>
        </div>

        <div className="order-5 flex items-center justify-end gap-4 col-start-2 col-span-5 mt-8 md:col-start-6">
          <button
            className="capitalize text-icons col-span-2 rounded hover:cursor-pointer hover:text-light_grey min-[450px]:col-start-3"
            onClick={() => navigate("/orders")}
          >
            Remind me later
          </button>

          <button
            disabled={!approval}
            onClick={handleStartOrder}
            className={`p-4 text-white text-center rounded bg-primary font-medium ${
              approval
                ? "hover:cursor-pointer hover:bg-green_hover"
                : "opacity-50"
            }`}
          >
            Start Order
          </button>
        </div>
      </div>
    </div>
  );
};
