import React, {
  createRef,
  RefObject,
  useEffect,
  useRef,
  useState
} from "react";
import { AiFillInfoCircle } from "react-icons/ai";
import { BsTrash } from "react-icons/bs";
import { FiCheck } from "react-icons/fi";
import { HiOutlineCheckCircle } from "react-icons/hi";
import { IoMdAttach } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import Moment from "react-moment";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getOrderDetail } from "../../actions/orderAction";
import { FREE_TEXT } from "../../constants/globalConstants";
import { useUpdateGlobalLoading } from "../../context/globalLoadingContext";
import { AppDispatch, RootState } from "../../store";
import { axiosInstance } from "../../utility/axiosInstance";
import { uploadToCloudinaryV2 } from "../../utility/cloudinary";
import { getFileSize, numberToCurrency } from "../../utility/util";
import { CheckInput } from "../CheckInput/CheckInput";
import {
  MultipleOptionSelect,
  MultipleOptionSelectRef,
} from "../MultipleOptionSelect/MultipleOptionSelect";
import { TextArea, TextAreaRef } from "../TextArea/TextArea";

type Answer = {
  answer: string;
  files: File[];
};

type AnswerRef = React.RefObject<TextAreaRef | MultipleOptionSelectRef>;

export const SubmitRequirements = () => {
  const dispatch = useDispatch<AppDispatch>();
  const params = useParams();
  const navigate = useNavigate();
  const updateGlobalLoading = useUpdateGlobalLoading();

  const answersRef = useRef<AnswerRef[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [approval, setApproval] = useState<boolean>(false);

  const [answerRequiredError, setAnswerRequiredError] =
    useState<boolean>(false);
  const [fileSizeErrors, setFileSizeErrors] = useState<boolean[]>([]);

  useEffect(() => {
    if (params.orderId) {
      dispatch(getOrderDetail(params.orderId));
    }
  }, [dispatch, params.orderId]);

  const { orderDetail } = useSelector((state: RootState) => state.orderDetail);

  const packageDetail = orderDetail?.packageDetails!;

  if (orderDetail) {
    answersRef.current = orderDetail.requirements.map((question, index) => {
      if(answersRef.current[index]) {
        return answersRef.current[index];
      }
      if (question.questionType === FREE_TEXT) {
        return createRef<TextAreaRef>();
      }
      return createRef<MultipleOptionSelectRef>();
    });
  }

  useEffect(() => {
    if (orderDetail) {
      setAnswers(
        orderDetail.requirements.map((question, index) => {
          return {
            answer: "",
            files: [],
          };
        })
      );
      setFileSizeErrors(
        orderDetail.requirements.map((question, index) => {
          return false;
        })
      );
    }
  }, [orderDetail]);

  const handleAnswerFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const files = Array.from(e.target.files || []);
    setAnswers((prevState) => {
      const newState = [...prevState];
      newState[index].files = [...newState[index].files, ...files];
      return newState;
    });
  };

  const handleAnswerFileRemoval = (index: number, fileIndex: number) => {
    setAnswers((prevState) => {
      const newState = [...prevState];
      newState[index].files.splice(fileIndex, 1);
      return newState;
    });
  };

  const getApprovalState = (val: boolean) => {
    setApproval(val);
  };

  const handleStartOrder = async () => {
    // check if any answer is required and not answered
    let error = false;
    orderDetail?.requirements.forEach((item, index) => {
      if (item.answerRequired) {
        if (item.questionType === FREE_TEXT) {
          if (
            answersRef.current[index].current?.currValue === "" &&
            answers[index].files.length === 0
          ) {
            setAnswerRequiredError(true);
            error = true;
            return;
          }
        } else {
          let flag = false;
          (
            answersRef.current[index].current as MultipleOptionSelectRef
          ).currValue.forEach((val, index) => {
            if (val) {
              flag = true;
              return;
            }
          });
          if (!flag) {
            setAnswerRequiredError(true);
            error = true;
            return;
          }
        }
      }
    });

    // check if any file size is greater than 5GB
    fileSizeErrors.forEach((item, index) => {
      if (item) {
        error = true;
        return;
      }
    });

    if (error) {
      return;
    }

    updateGlobalLoading(true, "Submitting your answers");
    let filesData: File[] = [];
    let filesCountPerEachAnswer = [];
    for (let i = 0; i < answers.length; i++) {
      filesCountPerEachAnswer.push(answers[i].files.length);
      filesData = [...filesData, ...answers[i].files];
    }

    const filesDataUrls: any[] = [];
    try {
      const fileUrls = await uploadToCloudinaryV2(
        filesData,
        5 * 1024 * 1024 * 1024
      );
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

    const payload = answersRef.current.map((answer, index) => {
      return {
        answer: answer.current?.currValue,
        files: filesDataUrls[index],
      };
    });

    try {
      const { data } = await axiosInstance.put(
        `/order/update/requirements/${params.orderId}`,
        {
          requirements: payload,
        }
      );
    } catch (error) {
      console.log(error);
      updateGlobalLoading(false);
      return;
    }

    setFileSizeErrors(
      orderDetail?.requirements.map((question, index) => {
        return false;
      }) || []
    );
    setAnswerRequiredError(false);
    updateGlobalLoading(false);
    navigate(`/orders/${params.orderId}`, { replace: true });
  };

  // after any change in files check for errors
  useEffect(() => {
    if (!orderDetail) return;
    const newFileSizeErrors = orderDetail.requirements.map(
      (question, index) => {
        return false;
      }
    );
    answers.forEach((answer, index) => {
      answer.files.forEach((file, fileIndex) => {
        if (file.size > 5 * 1024 * 1024 * 1024) {
          newFileSizeErrors![index] = true;
        }
      });
    });
    setFileSizeErrors(newFileSizeErrors);
  }, [answers, orderDetail]);

  return (
    <div className="px-8 md:px-20 xl:px-48 py-8 text-dark_grey">
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
                className="py-3 border-b-1 my-2 border-b-dark_separator text-light_heading"
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
                  <div className="mt-4 rounded-none">
                    <TextArea
                      maxLength={2500}
                      style={{ borderRadius: "0px", height: "100px" }}
                      ref={answersRef.current[index] as  RefObject<TextAreaRef>}
                    />
                    <div className="">
                      <label
                        data-tooltip-content="Attach files. 5GB max."
                        data-tooltip-place="right"
                        data-tooltip-id="my-tooltip"
                        className="bg-separator text-sm font-bold border inline-flex items-center py-1 px-2 gap-1 hover:cursor-pointer hover:text-dark_grey hover:bg-dark_separator"
                      >
                        <input
                          type="file"
                          hidden
                          multiple
                          // onClick={(e) => (e.target.value = "")}
                          onChange={(e) => handleAnswerFile(e, index)}
                        />
                        <IoMdAttach className="hover: text-dark_grey" />
                        Attach Files
                      </label>
                    </div>

                    {answers[index]?.files?.length > 0 && (
                      <div className="mt-2 inline-flex flex-col gap-2">
                        {answers[index].files.map((file, idx) => (
                          <>
                            <div
                              key={idx}
                              className="flex items-center justify-between py-1 px-2 rounded gap-8 border bg-separator"
                            >
                              <div className="w-40 sm:min-w-60 overflow-hidden">
                                <div className="text-sm truncate">
                                  {file.name}
                                </div>
                                <div className="text-sm text-left">
                                  {getFileSize(file.size)}
                                </div>
                              </div>
                              <div
                                onClick={() =>
                                  handleAnswerFileRemoval(index, idx)
                                }
                                className="hover:bg-icons hover:text-white p-2 rounded-full hover:cursor-pointer"
                              >
                                <BsTrash />
                              </div>
                            </div>
                          </>
                        ))}
                      </div>
                    )}
                    {fileSizeErrors?.length > 0 && fileSizeErrors[index] && (
                      <div className="text-error text-sm mt-1">
                        File size should not exceed 5GB.
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <MultipleOptionSelect
                      options={question.options}
                      multiple={question.multipleOptionSelect}
                      ref={answersRef.current[index] as RefObject<MultipleOptionSelectRef>}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
        {orderDetail && (
          <div className="border-1 border-dark_separator order-2 col-span-6 sm:col-start-2 sm:col-span-4  md:order-3 md:col-span-4 lg:col-span-3">
            <img className="aspect-[16/10]" src={orderDetail.image.url}></img>
            <div className="p-3">
              <div className="border-b-1 border-b-dark_separator">
                <h5 className="font-bold">{orderDetail.gigTitle}</h5>
                <div className="mt-3">
                  <ul className="flex flex-col gap-1 mb-3">
                    <li className="grid grid-cols-[30px_auto] items-center">
                      <FiCheck className="text-primary font-bold text-xl" />
                      <span>
                        {packageDetail.revisions < 1e6
                          ? packageDetail.revisions
                          : "Unlimited"}{" "}
                        {packageDetail.revisions === 1
                          ? "revision"
                          : "revisions"}
                      </span>
                    </li>
                    <li className="grid grid-cols-[30px_auto] items-center">
                      {packageDetail.commercialUse ? (
                        <FiCheck className="text-primary font-bold text-xl" />
                      ) : (
                        <IoClose className="text-error font-bold text-xl" />
                      )}
                      <span className="">Commercial Use</span>
                    </li>
                    <li className="grid grid-cols-[30px_auto] items-center">
                      {packageDetail.sourceFile ? (
                        <FiCheck className="text-primary font-bold text-xl" />
                      ) : (
                        <IoClose className="text-error text-xl" />
                      )}
                      <span>Source File</span>
                    </li>
                  </ul>
                </div>
              </div>
              {orderDetail && (
                <div className="flex flex-col gap-3 py-4 [&>*]:flex [&>*]:justify-between">
                  <div>
                    <span>Status</span>
                    <span className="py-1 px-2 bg-yellow-500 text-white uppercase text-[10px] rounded-[3px]">
                      {orderDetail.status}
                    </span>
                  </div>
                  <div>
                    <span>Order</span>
                    <span>#{orderDetail.orderId}</span>
                  </div>
                  <div>
                    <span>Order Date</span>
                    <span>
                      <Moment format="ll">{orderDetail.createdAt}</Moment>
                    </span>
                  </div>
                  <div>
                    <span>Price</span>
                    <span>₹{numberToCurrency(orderDetail.amount)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {answerRequiredError && (
          <div className="order-4 col-span-3 text-error text-sm -mt-3">
            *Please fill all the mandatory requirements
          </div>
        )}

        <div className="order-5 col-span-6 md:col-span-10  max-w-xl flex items-start text-light_heading">
          <CheckInput getInputCheckedVal={getApprovalState} />
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
