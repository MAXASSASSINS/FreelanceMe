import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

type TextAreaProps = {
  maxLength: number;
  minLength?: number;
  className?: string;
  placeholder?: string;
  defaultText?: string;
  warning?: string;
  onChange?: (text: string) => void;
  value?: string;
};

export type TextAreaRef = {
  currValue: string;
  setTextComingFromParent: (txt: string) => void;
};

export const TextArea = forwardRef(
  (
    {
      maxLength = Number.MAX_SAFE_INTEGER,
      minLength = 0,
      className,
      placeholder = "",
      defaultText = "",
      warning = "",
      onChange,
      value,
    }: TextAreaProps,
    ref: React.Ref<TextAreaRef>
  ) => {
    const isControlled = value !== undefined;
    const [currentTextLength, setCurrentTextLength] = useState<number>(
      defaultText.length
    );
    const [text, setText] = useState<string>(defaultText);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange && onChange(e.target.value);
      if (!isControlled) {
        setCurrentTextLength(e.target.value.length);
        setText(e.target.value);
      }
    };
    
    useEffect(() => {
      if (isControlled) {
        setText(value);
        setCurrentTextLength(value.length);
      }
    }, [value, isControlled]);

    useImperativeHandle(
      ref,
      () => ({
        currValue: text,
        setTextComingFromParent: (txt: string) => {
          setText(txt);
          setCurrentTextLength(txt.length);
        },
      }),
      [text]
    );

    return (
      <div className="w-full relative">
        <textarea
          maxLength={maxLength}
          minLength={minLength}
          placeholder={placeholder}
          autoCorrect="off"
          autoComplete="off"
          autoCapitalize="off"
          onChange={handleChange}
          value={isControlled ? value : text}
          className={`w-full resize-none h-20 rounded-[5px] py-2.5 px-4 text-inherit leading-5 outline-none placeholder:text-no_focus border ${className?.replaceAll(
            " ",
            " [&&]:"
          )} ${
            warning
              ? "border-warning"
              : "border-no_focus focus:border-dark_grey"
          }`}
        ></textarea>
        <div className="flex items-start [&>*]:leading-[1.4] justify-between text-sm">
          <div className="w-2/3 text-warning absolute -bottom-0">{warning}</div>
          <div className="relative text-no_focus text-right w-full text-xs">
            {currentTextLength} / {maxLength} max
          </div>
        </div>
      </div>
    );
  }
);
