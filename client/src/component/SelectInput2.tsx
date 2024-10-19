import React, { forwardRef, useImperativeHandle, useState } from "react";

type SelectInput2Props = {
  data: string[];
  defaultOption: string;
  style?: React.CSSProperties;
  getChoosenOption?: (option: string) => void;
  disabled?: boolean;
  warning?: string;
};

export type SelectInput2Ref = {
  currValue: string;
  setChoosedOptionComingFromParent: (option: string) => void;
};

const SelectInput2 = (
  {
    data,
    defaultOption,
    style,
    getChoosenOption,
    disabled = false,
    warning = "",
  }: SelectInput2Props,
  ref: React.Ref<SelectInput2Ref>
) => {
  const [choosedOption, setChoosedOption] = useState<string>(
    defaultOption.toLowerCase()
  );

  useImperativeHandle(
    ref,
    () => ({
      currValue: choosedOption,
      setChoosedOptionComingFromParent: (option) => {
        setChoosedOption(option.toString().toLowerCase());
      },
    }),
    [choosedOption]
  );

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setChoosedOption(e.target.value.toLowerCase());
    getChoosenOption && getChoosenOption(e.target.value.toLowerCase());
  };

  return (
    <div className="select-input-main w-full relative">
      <select
        disabled={disabled}
        className={`w-full p-2 rounded-none border  text-sm disabled:bg-separator disabled:cursor-not-allowed ${
          warning ? "border-warning" : "border-no_focus"
        } ${
          choosedOption.toLowerCase() === defaultOption.toLowerCase()
            ? "text-no_focus"
            : "text-dark_grey"
        }`}
        style={style}
        value={choosedOption}
        onChange={handleChange}
      >
        <option
          className="max-h-64 overflow-hidden"
          value={defaultOption.toLowerCase()}
        >
          {defaultOption}
        </option>
        {data?.map((item, index) => {
          if (defaultOption.toLowerCase() !== item.toLowerCase()) {
            return (
              <option key={index + item} value={item.toLowerCase()}>
                {item}
              </option>
            );
          } else {
            return null;
          }
        })}
      </select>
      <p className="text-sm absolute -bottom-5 text-warning leading-[1.4]">
        {warning}
      </p>
    </div>
  );
};

export default forwardRef(SelectInput2);
