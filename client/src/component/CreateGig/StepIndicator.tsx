import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from "react";
import { RoundNumberIcon } from "../RoundNumberIcon";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useNavigate, useParams } from "react-router-dom";
import { useUpdateGlobalLoading } from "../../context/globalLoadingContext";

const steps = [
  {
    id: 1,
    title: "Overview",
  },
  {
    id: 2,
    title: "Pricing",
  },
  {
    id: 3,
    title: "Description",
  },
  {
    id: 4,
    title: "Requirements",
  },
  {
    id: 5,
    title: "Gallery",
  },
  {
    id: 6,
    title: "Publish",
  },
];

type StepIndicatorProps = {
  handleSubmission: () => Promise<boolean>;
  currentStep: number;
  setCurrentStep: (step: number) => void;
};

export type StepIndicatorRef = {
  handleStepBack: () => void;
  handleSaveAndContinue: () => void;
};

const StepIndicator = (
  { handleSubmission, currentStep, setCurrentStep }: StepIndicatorProps,
  ref: React.Ref<StepIndicatorRef>
) => {
  const updateGlobalLoading = useUpdateGlobalLoading();
  const navigate = useNavigate();
  const params = useParams();
  let gigId = params.id;

  // const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxStep, setMaxStep] = useState<number>(1);
  const [stepCompleted, setStepCompleted] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  const handleNavigateToStep = (step: number) => {
    if (step <= maxStep) {
      setCurrentStep(step);
    }
  };

  const handleClickOnNavigationSave = () => {
    if (currentStep < 6) {
      handleSaveAndContinue();
    }
  };

  const handleClickOnNavigationSaveAndPreview = async () => {
    if (currentStep === 6) {
      navigate(`/gig/details/${gigId}`, {
        replace: true,
      });
      return;
    }
    console.log("calling handleSaveAndContinue");
    const temp = await handleSaveAndContinue();
    console.log(temp);
    if (!temp) return;
    navigate(`/gig/details/${gigId}`, {
      replace: true,
    });
  };

  const handleSaveAndContinue = useCallback(async () => {
    try {
      updateGlobalLoading(true, "Saving Gig");
      const done = await handleSubmission();
      if (!done) return false;
      if (currentStep < 7) {
        for (let i = 1; i < 7; i++) {
          if (i === currentStep) {
            stepCompleted[i] = true;
          }
        }
        if (maxStep < currentStep + 1) {
          setMaxStep(currentStep + 1);
        }
        setCurrentStep(currentStep + 1);
      }
      return true;
    } catch (err) {
      console.log(err);
      return false;
    } finally {
      updateGlobalLoading(false);
    }
  }, [
    currentStep,
    handleSubmission,
    maxStep,
    stepCompleted,
    setCurrentStep,
    updateGlobalLoading,
  ]);

  useImperativeHandle(
    ref,
    () => ({
      handleStepBack: () => {
        if (currentStep > 1) {
          setCurrentStep(currentStep - 1);
        }
      },
      handleSaveAndContinue: handleSaveAndContinue,
    }),
    [currentStep, handleSaveAndContinue, setCurrentStep]
  );

  return (
    <nav className="py-4 px-4 sm:px-8 xl:px-16 bg-white flex flex-col 1100:flex-row justify-around text-icons border-b border-b-dark_separator items-center">
      <ul className="flex items-center justify-center gap-4 flex-wrap">
        {steps.map((step) => (
          <li
            key={step.id}
            onClick={() => handleNavigateToStep(step.id)}
            className={`flex items-center list-none ${
              step.id <= currentStep && "text-primary"
            } ${currentStep === step.id && "text-dark_grey"}`}
          >
            <div className="mr-2">
              {stepCompleted[step.id] && currentStep > step.id ? (
                <CheckCircleIcon className="text-primary" classes={{fontSizeLarge: "large"}} />
              ) : (
                <RoundNumberIcon
                  number={step.id}
                  bcgColor={currentStep === step.id ? "#1dbf73" : "#74767e"}
                />
              )}
            </div>
            <div
              className={`${step.id <= maxStep && "cursor-pointer"}`
            }
            >
              {step.title}
            </div>
            <div
              style={{
                color: "#222831",
                display: step.id === 6 ? "none" : "block",
              }}
            >
              <ChevronRightIcon
                style={{ fontSize: "20", fontWeight: "light" }}
              />
            </div>
          </li>
        ))}
      </ul>
      <hr className="my-4 w-full 1100:hidden border border-dark_separator"></hr>
      <ul className="noSelect flex justify-center gap-4 ">
        <button
          className="text-link mr-0 hover:cursor-pointer hover:underline disabled:cursor-not-allowed disabled:text-no_focus disabled:no-underline"
          disabled={currentStep === 6}
          onClick={handleClickOnNavigationSave}
        >
          Save
        </button>
        <p className="text-no_focus">|</p>
        <button
          className="text-link mr-0 hover:cursor-pointer hover:underline"
          onClick={handleClickOnNavigationSaveAndPreview}
        >
          Save & Preview
        </button>
      </ul>
    </nav>
  );
};

export default forwardRef(StepIndicator);
