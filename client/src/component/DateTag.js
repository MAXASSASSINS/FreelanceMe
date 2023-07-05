import React from "react";
import Moment from "react-moment";

export const DateTag = ({ date }) => {
  return (
    <div className="capitalize absolute left-0 text-icons font-semibold bg-separator w-24 pl-7 pr-4 p-0.5 text-xs rounded-tr-full rounded-br-full sm:text-sm sm:pl-10 sm:pr-4 sm:w-32">
      <Moment format="MMM D">{date}</Moment>
    </div>
  );
};