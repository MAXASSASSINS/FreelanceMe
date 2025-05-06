import {
  createRef,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  Ref
} from "react";
import { CheckInput, CheckInputRef } from "../CheckInput";


type MultipleOptionSelectProps = {
  options: { title: string }[];
  multiple: boolean;
};

export type MultipleOptionSelectRef = {
  currValue: boolean[];
};

export const MultipleOptionSelect = forwardRef(({ options, multiple }: MultipleOptionSelectProps, ref:  Ref<MultipleOptionSelectRef>) => {
  const optionsRefs = useRef<React.RefObject<CheckInputRef>[]>(options.map(() => createRef<CheckInputRef>()));
  const [selectedOptions, setSelectedOptions] = useState<boolean[]>(
    options.map(() => false)
  );

  useImperativeHandle(ref, () => ({
    currValue: selectedOptions,
  }), [selectedOptions]);

  const handleChange = (index: number) => {
    const currentRef = optionsRefs.current[index].current;

    if(currentRef){
      currentRef.setIsCheckedComingFromParent(!currentRef.currValue);
    }

    setSelectedOptions(
      options.map((item, i) =>
        i === index ? !selectedOptions[index] : selectedOptions[i]
      )
    );
    if (!multiple) {
      setSelectedOptions(
        options.map((item, i) =>
          i === index ? !selectedOptions[index] : false
        )
      );
      optionsRefs.current.forEach((optionRef, i) => {
        if (i !== index) {
          optionRef.current?.setIsCheckedComingFromParent(false);
        }
      });
    }
  };

  return (
    <div>
      {options.map((option, index) => (
        <div className="my-2" key={index} onChange={() => handleChange(index)}>
          <CheckInput
            key={index}
            label={option.title}
            defaultValue={selectedOptions[index]}
            ref={optionsRefs.current[index]}
          />
        </div>
      ))}
    </div>
  );
});
