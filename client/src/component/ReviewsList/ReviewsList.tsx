import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Avatar } from "../Avatar/Avatar";
import { RatingStars } from "../RatingStars/RatingStars";
import { flags } from "../../data/country-flags";
import Moment from "react-moment";
import { IReview } from "../../types/user.types";

type ReviewsListProps = {
  reviews: IReview[];
};

export type ReviewsListRef = {
  updateReviewCount: (count: number) => void;
};

const ReviewsList = (
  { reviews }: ReviewsListProps,
  ref: React.Ref<ReviewsListRef>
) => {
  const [reviewCount, setReviewCount] = useState<number>(5);

  const increaseReviewCount = () => {
    setReviewCount((prev) => prev + 5);
  };

  useImperativeHandle(ref, () => ({
    updateReviewCount: (count) => {
      setReviewCount(count);
    },
  }));

  const getFlag = (flagName: string) =>
    flags.find((flag) => {
      if (flag.name === flagName) {
        return flag;
      }
      return null;
    });
  return (
    <>
      {reviews.map((review, index) => {
        return (
          index < reviewCount && (
            <div
              className="p-[1rem_0_2rem_2.75rem] border-b border-b-dark_separator"
              key={index}
            >
              <div className="flex items-center [&>*]:mr-2.5">
                <div className="-ml-11">
                  <Avatar
                    avatarUrl={review.avatar?.url}
                    userName={review.name}
                    width="2rem"
                    alt={review.name}
                    fontSize="1rem"
                  />
                </div>
                <div className="font-bold text-dark_grey">{review.name}</div>
                <RatingStars rating={review.rating} />
                <div>{review.rating}</div>
              </div>
              <div className="flex items-center text-[0.9rem] -mt-[5px]">
                <img
                  className="w-6 mr-2"
                  src={getFlag(review.country)?.image}
                  alt="country flag"
                />
                <div className="text-light_heading">{review.country}</div>
              </div>
              <p className="mt-4 leading-6 text-dark_grey whitespace-pre-wrap break-words">
                {review.comment}
              </p>
              <p className="mt-4 text-[0.9rem] text-no_focus font-normal">
                Published &nbsp;
                <span>
                  <Moment fromNow={true}>{review.createdAt}</Moment>
                </span>
              </p>
            </div>
          )
        );
      })}
      {reviews?.length > reviewCount && (
        <div
          className="mt-8 text-primary cursor-pointer"
          onClick={increaseReviewCount}
        >
          + See more
        </div>
      )}
    </>
  );
};

export default forwardRef(ReviewsList);
