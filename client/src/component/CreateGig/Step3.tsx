import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { StepProps, StepRef } from "../../Pages/CreateGig";
import { RootState } from "../../store";
import { TextEditor, TextEditorRef } from "../TextEditor/TextEditor";

const Step3 = ({ handleSendData }: StepProps, ref: React.Ref<StepRef>) => {
  const { gigDetail } = useSelector((state: RootState) => state.gigDetail);
  const gigDescriptionRef = useRef<TextEditorRef>(null);
  const [descriptionError, setDescriptionError] = useState<string>("");

  const checkForWarnings = () => {
    if (gigDescriptionRef.current?.getDescriptionLength()! < 120) {
      setDescriptionError(
        "Description should be at least 120 characters long."
      );
      return true;
    }
    if (gigDescriptionRef.current?.getDescriptionLength()! > 1200) {
      setDescriptionError(
        "Description should be at most 1200 characters long."
      );
      return true;
    }
    setDescriptionError("");
  };

  const handleSubmit = async () => {
    if (checkForWarnings()) {
      return false;
    }
    const text = gigDescriptionRef.current?.getDescription();
    const payload = { data: text, step: 3 };
    const res = await handleSendData(payload);
    return res || false;
  };

  useEffect(() => {
    if (!gigDetail) return;
    const { description } = gigDetail;

    gigDescriptionRef.current?.setDescriptionComingFromParent(
      description || ""
    );
  }, [gigDetail]);

  useImperativeHandle(ref, () => ({
    handleSubmit,
  }));

  return (
    <div>
      <div className="">
        <h1 className="pb-4 text-2xl sm:text-3xl text-light_heading border-b border-b-no_focus mb-12">
          Description
        </h1>
        <h3 className="text-base text-light_heading mb-6 capitalize">
          Briefly Describe Your Gig
        </h3>
        <TextEditor maxLength={1200} ref={gigDescriptionRef} />
        {descriptionError && (
          <p className="text-warning text-sm -mt-6">{descriptionError}</p>
        )}
      </div>
    </div>
  );
};

export default forwardRef(Step3);
