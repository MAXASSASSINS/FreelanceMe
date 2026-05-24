import "./ratingStars.css";

type RatingStarsProps = {
  rating: number;
};

export const RatingStars = ({ rating }: RatingStarsProps) => {
  const starRatings = (rating: number) => {
    const ratingPercentage = rating * 10 * 2;
    return ratingPercentage + "%";
  };

  return (
    <div className="user-detail stars-outer">
      <div
        className="stars-inner"
        style={{ width: starRatings(Number(rating.toFixed(1))) }}
      ></div>
    </div>
  );
};
