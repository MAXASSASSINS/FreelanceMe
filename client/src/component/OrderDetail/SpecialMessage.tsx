import React from "react";
import Moment from "react-moment";
import { Link } from "react-router-dom";

type SpecialMessageProps = {
  icon: React.ReactNode;
  date: Date;
  iconBgColor: string;
  iconColor: string;
  children: React.ReactNode;
};

const SpecialMessage = ({
  icon,
  iconBgColor,
  iconColor,
  date,
  children,
}: SpecialMessageProps) => {
  return (
    <div className="flex items-center gap-4 font-semibold text-light_heading">
      <div
        className={`p-2 aspect-square rounded-full ${iconColor} ${iconBgColor}`}
      >
        {icon}
      </div>
      <div className="[&>*]:leading-5 py-2 pr-6 border-b flex-grow border-b-dark_separator">
        <span className="mr-2">{children}</span>
        <span className="text-icons font-normal text-xs">
          <Moment format="MMM DD, H:mm A">{date}</Moment>
        </span>
      </div>
    </div>
  );
};

export default SpecialMessage;
