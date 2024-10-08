import "moment-timezone";
import { useState } from "react";
import Moment from "react-moment";
import { flags } from "../../data/country-flags";
import { IReview } from "../../types/gig.types";
import { RatingStars } from "../RatingStars/RatingStars";
import "./reviewList.css";

type ReviewListProps = {
  reviewList: IReview[];
};

export const ReviewList = ({ reviewList }: ReviewListProps) => {
  const [reviewCount, setReviewCount] = useState(5);

  const getFlag = (flagName: string) =>
    flags.find((flag) => {
      if (flag.name === flagName) {
        return flag;
      }
      return null;
    });

  const increaseReviewCount = (reviewCount: number) => () => {
    setReviewCount(reviewCount + 5);
  };

  return (
    <>
      {reviewList.map(
        (review, index) =>
          index < reviewCount && (
            <div className="user-detail-review" key={index}>
              <div className="user-detail-review-customer">
                <img alt="client" src={review.avatar.url}></img>
                <div className="user-detail-review-customer-name">
                  {review.name}
                </div>
                <RatingStars rating={review.rating}></RatingStars>
                <div>{review.rating}</div>
              </div>
              <div className="user-detail-review-customer-country">
                <img
                  src={getFlag(review.country)!.image}
                  alt="country flag"
                ></img>
                <div>{review.country}</div>
              </div>
              <p className="user-detail-review-paragraph">{review.comment}</p>
              <p className="user-detail-review-publish">
                Published &nbsp;
                <span>
                  <Moment fromNow={true}>{review.createdAt}</Moment>
                </span>
              </p>
            </div>
          )
      )}
      <div
        className="user-review-see-more"
        onClick={increaseReviewCount(reviewCount)}
      >
        + See more
      </div>
    </>
  );
};
