import React from "react";
import Moment from "react-moment";

type DateTagProps = {
  date: string;
  left: string;
};

export const DateTag = ({ date, left }: DateTagProps) => {
  return (
    <div
      className="capitalize relative text-icons font-semibold bg-separator w-24 pl-7 pr-4 p-0.5 text-xs rounded-tr-full rounded-br-full sm:text-sm sm:pl-10 sm:pr-4 sm:w-32"
      style={{ left: left }}
    >
      <Moment parse={"DD-MM-YYYY"} format="MMM D">
        {date}
      </Moment>
    </div>
  );
};
