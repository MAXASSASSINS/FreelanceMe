import React from "react";

type RoundNumberIconProps = {
  number: number;
  bcgColor: string;
};

export const RoundNumberIcon = ({ number, bcgColor }: RoundNumberIconProps) => {
  return (
    <div
      className="flex items-center justify-center w-6 h-6 rounded-full text-white font-semibold text-[0.8rem]"
      style={{ backgroundColor: bcgColor }}
    >
      <div className="p-4">{number}</div>
    </div>
  );
};
