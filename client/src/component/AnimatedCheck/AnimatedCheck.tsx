import { FC } from "react";
import "./AnimatedCheck.css";

const AnimatedCheck: FC = () => {
  return (
    <div>
      <svg
        className="svg_checkmark"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 130.2 130.2"
      >
        <circle
          className="path circle"
          fill="none"
          stroke="#1dbf73"
          stroke-width="10"
          stroke-miterlimit="10"
          cx="65.1"
          cy="65.1"
          r="60.1"
        />
        <polyline
          className="path check"
          fill="none"
          stroke="#1dbf73"
          stroke-width="10"
          stroke-linecap="round"
          stroke-miterlimit="10"
          points="100.2,40.2 51.5,88.8 29.8,67.5 "
        />
      </svg>
    </div>
  );
};

export default AnimatedCheck;
