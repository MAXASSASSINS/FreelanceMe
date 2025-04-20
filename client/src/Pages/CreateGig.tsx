import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getGigDetail, resetGigDetail } from "../actions/gigAction";
import Step1 from "../component/CreateGig/Step1";
import Step2 from "../component/CreateGig/Step2";
import Step3 from "../component/CreateGig/Step3";
import Step4 from "../component/CreateGig/Step4";
import Step5 from "../component/CreateGig/Step5";
import Step6 from "../component/CreateGig/Step6";
import StepIndicator, {
  StepIndicatorRef,
} from "../component/CreateGig/StepIndicator";
import { AppDispatch } from "../store";
import { axiosInstance } from "../utility/axiosInstance";

export type StepProps = {
  handleSendData: (payload: any) => Promise<boolean>;
};

export type StepRef = {
  handleSubmit: () => Promise<boolean>;
};

export const CreateGig = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const params = useParams();
  const gigId = params.id || "null";

  const [currentStep, setCurrentStep] = useState<number>(1);
  const stepIndicatorRef = useRef<StepIndicatorRef>(null);
  const step1Ref = useRef<StepRef>(null);
  const step2Ref = useRef<StepRef>(null);
  const step3Ref = useRef<StepRef>(null);
  const step4Ref = useRef<StepRef>(null);
  const step5Ref = useRef<StepRef>(null);
  const step6Ref = useRef<StepRef>(null);

  // fetching gig details if user is editing a gig
  useEffect(() => {
    if (gigId === "null") {
      dispatch(resetGigDetail());
    } else {
      dispatch(getGigDetail(gigId));
    }
  }, [dispatch, gigId]);

  const handleSubmission = async () => {
    switch (currentStep) {
      case 1:
        const res1 = await step1Ref.current?.handleSubmit();
        return res1 || false;
      case 2:
        const res2 = await step2Ref.current?.handleSubmit();
        return res2 || false;
      case 3:
        const res3 = await step3Ref.current?.handleSubmit();
        return res3 || false;
      case 4:
        const res4 = await step4Ref.current?.handleSubmit();
        return res4 || false;
      case 5:
        const res5 = await step5Ref.current?.handleSubmit();
        return res5 || false;
      case 6:
        const res6 = await step6Ref.current?.handleSubmit();
        return res6 || false;
      default:
        return false;
    }
  };

  const handleSendData = async (payload: any) => {
    try {
      let res;
      if (params.id === "null") {
        res = await axiosInstance.post("/gig/create", payload);
        if (res.status === 201) {
          navigate(`/gig/create/new/gig/${res.data.gigId}`, { replace: true });
        }
      } else {
        res = await axiosInstance.put(`/gig/update/${params.id}`, payload);
      }
      dispatch({ type: "UPDATE_GIG_DETAIL_SUCCESS", payload: res.data.gig });
      if (currentStep === 6) {
        navigate(`/gig/details/${params.id}`);
      }
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  return (
    <div className="create-gig-main min-h-[calc(100vh-81px)] bg-separator">
      <StepIndicator
        ref={stepIndicatorRef}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        handleSubmission={handleSubmission}
      />
      <div className="mt-16 mx-4 md:mx-12 max-w-full lg:mx-auto lg:max-w-[55rem] mb-4 text-dark_grey">
        {currentStep === 1 && (
          <Step1 handleSendData={handleSendData} ref={step1Ref} />
        )}
        {currentStep === 2 && (
          <Step2 handleSendData={handleSendData} ref={step2Ref} />
        )}
        {currentStep === 3 && (
          <Step3 handleSendData={handleSendData} ref={step3Ref} />
        )}
        {currentStep === 4 && (
          <Step4 handleSendData={handleSendData} ref={step4Ref} />
        )}
        {currentStep === 5 && (
          <Step5 handleSendData={handleSendData} ref={step5Ref} />
        )}
        {currentStep === 6 && (
          <Step6 handleSendData={handleSendData} ref={step6Ref} />
        )}
      </div>

      {currentStep < 6 && (
        <div className="text-right mt-8 mx-4 md:mx-12 max-w-full lg:mx-auto lg:max-w-[55rem] pb-4">
          <button
            className="py-3 px-4 capitalize bg-primary border-none text-white rounded-[3px] hover:cursor-pointer hover:bg-primary_hover"
            onClick={() => stepIndicatorRef.current?.handleSaveAndContinue()}
          >
            Save & Continue
          </button>
        </div>
      )}

      {currentStep > 1 && (
        <div className="text-right mx-4 md:mx-12 max-w-full lg:mx-auto lg:max-w-[55rem] pb-4">
          <button
            className="py-3 px-4 text-primary border-none capitalize cursor-pointer hover:underline"
            onClick={() => stepIndicatorRef.current?.handleStepBack()}
          >
            back
          </button>
        </div>
      )}
    </div>
  );
};
