import React from "react";
import "./ratingBars.css";

type RatingBarsProps = {
  rating: number;
};

export const RatingBars = ({ rating }: RatingBarsProps) => {
  const barRatings = (rating: number) => {
    const ratingPercentage = rating * 100;
    return ratingPercentage + "%";
  };

  return (
    <div className="rating-bars">
      <div className="bars-outer">
        <div className="bars-inner" style={{ width: barRatings(rating) }}>
          {/* <div className='bars-inner' style={{ width: "5rem" }}> */}
        </div>
      </div>
    </div>
  );
};
