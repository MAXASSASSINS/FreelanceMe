import React, { useEffect, useState } from "react";
import { RatingBars } from "../RatingBars/RatingBars";
import { IGig } from "../../types/gig.types";

type RatingSelectorProps = {
  handleClickOnRating: (rating: number) => () => void;
  gigDetail: IGig;
  selectedRating: number;
};

const RatingSelector = ({
  handleClickOnRating,
  gigDetail,
  selectedRating,
}: RatingSelectorProps) => {
  const [arr, setArr] = useState<number[]>([0, 0, 0, 0, 0]);

  useEffect(() => {
    if (gigDetail) {
      const arr = [0, 0, 0, 0, 0];
      gigDetail?.reviews?.map((review) => {
        return ++arr[review.rating - 1];
      });
      setArr(arr);
    }
  }, [gigDetail]);

  return (
    <div className="gig-review-rating-wise-division-wrapper">
      <ul>
        {arr.toReversed().map((item, index) => {
          return (
            <li key={index} onClick={handleClickOnRating(5 - index)}>
              <span
                id={`rating-${5 - index}`}
                className={`rating-number ${
                  selectedRating === 5 - index && "gig-review-rating-selected"
                }`}
              >
                {5 - index} Stars
              </span>
              <RatingBars rating={item / gigDetail.numOfRatings}></RatingBars>
              <span>({item})</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RatingSelector;
