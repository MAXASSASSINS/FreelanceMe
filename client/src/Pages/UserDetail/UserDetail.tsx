import "moment-timezone";
import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getUserGigs } from "../../actions/gigAction";
import { getGigUser } from "../../actions/userAction";
import { Chat } from "../../component/Chat/Chat";
import { RatingStars } from "../../component/RatingStars/RatingStars";
import ReviewsList from "../../component/ReviewsList/ReviewsList";
import UserGigs from "../../component/UserDetail/UserGigs";
import UserInfo from "../../component/UserDetail/UserInfo";
import { AppDispatch, RootState } from "../../store";
import "./userDetail.css";

export const UserDetail = () => {
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const [showChatBox, setShowChatBox] = useState<boolean>(false);
  const { user: gigUser } = useSelector((state: RootState) => state.gigUser);
  const { userGigs } = useSelector((state: RootState) => state.userGigs);

  useEffect(() => {
    if (params.id) {
      dispatch(getGigUser(params.id));
      dispatch(getUserGigs(params.id));
    }
  }, [dispatch, params.id]);

  return (
    userGigs && (
      <div className="min-h-screen">
        {showChatBox && gigUser && (
          <Chat
            chatUser={gigUser}
            showChatBox={showChatBox}
            setShowChatBox={setShowChatBox}
          ></Chat>
        )}
        {gigUser && Object.keys(gigUser).length > 0 && (
          <div className="user-details-max-width-container">
            {/* USER DETAIL SECTION */}
            <UserInfo setShowChatBox={setShowChatBox} />

            <div
              id="user-detail-gigs-section"
              className="user-detail-gig-reviews-div"
            >
              {/* USER GIGS SECTION */}
              <UserGigs />

              {/* REVIEWS SECTION */}
              <div
                id="user-detail-reviews-section"
                className="user-detail-review-list-container"
              >
                <div className="user-detail-review-list">
                  <h2>
                    <span className="user-detail-review-heading">Reviews</span>{" "}
                    &nbsp; &nbsp;
                    <div className="user-detail-review-rating-stars">
                      <FaStar />
                      <RatingStars rating={gigUser.ratings}></RatingStars>
                      &nbsp; &nbsp;
                    </div>
                    <span className="user-detail-gig-rating">
                      {gigUser.ratings.toFixed(1)}
                    </span>
                    &nbsp; &nbsp;
                    <span className="user-detail-gig-review-count">
                      ({gigUser.numOfRatings})
                    </span>
                  </h2>
                  <ReviewsList reviews={gigUser.reviews} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  );
};
