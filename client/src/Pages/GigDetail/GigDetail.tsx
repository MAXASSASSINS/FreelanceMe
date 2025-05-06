import CreateIcon from "@mui/icons-material/Create";
import { Editor, EditorState, convertFromRaw } from "draft-js";
import "moment-timezone";
import { useEffect, useRef, useState } from "react";
import { HiStar } from "react-icons/hi";
import Moment from "react-moment";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getGigDetail } from "../../actions/gigAction";
import { Avatar } from "../../component/Avatar/Avatar";
import MyCarousel from "../../component/Carousel/MyCarousel";
import { Chat } from "../../component/Chat/Chat";
import PackageSelector from "../../component/GigDetail.js/PackageSelector";
import RatingSelector from "../../component/GigDetail.js/RatingSelector";
import { RatingStars } from "../../component/RatingStars/RatingStars";
import ReviewsList, {
  ReviewsListRef,
} from "../../component/ReviewsList/ReviewsList";
import { AppDispatch, RootState } from "../../store";
import { IPackageDetails } from "../../types/order.types";
import { IReview, IUser } from "../../types/user.types";
import "./gigDetail.css";

export const GigDetail = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const params = useParams();

  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  const styleMap = {
    HIGHLIGHT: {
      backgroundColor: "yellow",
    },
  };

  const reviewsListRef = useRef<ReviewsListRef>(null);
  const [gigReviews, setGigReviews] = useState<IReview[]>([]);
  const [pricePackageInfo, setPricePackageInfo] =
    useState<IPackageDetails | null>(null);
  const [currentlySelectedPackageNumber, setCurrentlySelectedPackageNumber] =
    useState<number>(0);
  const [showChatBox, setShowChatBox] = useState<boolean>(false);
  const [selectedRating, setSelectedRating] = useState<number>(-1);

  useEffect(() => {
    dispatch(getGigDetail(params.id!));
  }, [dispatch, params.id]);

  const { gigDetail } = useSelector((state: RootState) => state.gigDetail);
  const { user } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (gigDetail) {
      setGigReviews(gigDetail.reviews);
      setPricePackageInfo(gigDetail.pricing[0]);
    }

    // setting editor state
    const description = gigDetail && gigDetail.description;
    //
    if (!description) return;
    let contentState = convertFromRaw(JSON.parse(description));
    let editorState = EditorState.createWithContent(contentState);
    setEditorState(editorState);
  }, [gigDetail]);

  const handleClickOnRating = (rating: number) => () => {
    if (selectedRating === rating) {
      setGigReviews(gigDetail?.reviews || []);
      setSelectedRating(-1);
      return;
    }
    const temp = gigDetail?.reviews.filter(
      (review) => review.rating === rating
    );
    setGigReviews(temp || []);
    reviewsListRef.current?.updateReviewCount(5);
    setSelectedRating(rating);
  };

  const handlePricePackageSelection = (e: React.MouseEvent<HTMLLIElement>) => {
    const target = e.target as HTMLLIElement;
    if (target.classList.contains("price-package-selected")) {
      return;
    } else {
      const parent = target.parentElement;
      const children = parent!.children;
      var index = Array.prototype.indexOf.call(children, e.target);
      setCurrentlySelectedPackageNumber(index);
      for (let i = 0; i < children.length; i++) {
        children[i].classList.remove("price-package-selected");
      }
      target.classList.add("price-package-selected");
      setPricePackageInfo(gigDetail?.pricing[index] || null);
    }
  };

  const checkUserOpenItsOwnGig = () => {
    if (user && gigDetail) {
      return user._id === (gigDetail.user as IUser)._id;
    }
    return false;
  };

  useEffect(() => {
    checkUserOpenItsOwnGig();
  }, [user]);

  const handleContinueBuyClick = () => {
    if (checkUserOpenItsOwnGig())
      return toast.error("You can not buy your own gig");
    navigate(
      `/gig/place/order/${gigDetail?._id}/${currentlySelectedPackageNumber}`
    );
  };

  if (!gigDetail) {
    return <div>Loading...</div>;
  }

  gigDetail.user = gigDetail.user as IUser;

  return gigDetail ? (
    <>
      {showChatBox && (
        <Chat
          chatUser={gigDetail.user}
          showChatBox={showChatBox}
          setShowChatBox={setShowChatBox}
        ></Chat>
      )}
      <div className="gig-detail-main-wrapper">
        <section className="gig-details-section">
          <div>
            {checkUserOpenItsOwnGig() && (
              <Link
                to={`/gig/create/new/gig/${gigDetail._id}`}
                className="user-detail-edit-gig inline-flex"
              >
                <div className="edit-icon">
                  <CreateIcon></CreateIcon>
                </div>
                <div>Edit Gig</div>
              </Link>
            )}
          </div>
          <div className="gig-details-gig-overveiw">
            <h1 className="gig-details-gig-title">{gigDetail.title}</h1>
            <div className="gig-seller-overview">
              <Avatar
                avatarUrl={gigDetail.user.avatar?.url}
                userName={gigDetail.user.name}
                width="1.875rem"
                alt={gigDetail.user.name}
                fontSize="1rem"
              />

              <a href="#gig-owner-details-id">
                <div className="gig-seller-overview-seller-name">
                  {gigDetail.user.name}
                </div>
              </a>
              <a href="#review-container">
                <RatingStars rating={gigDetail.ratings}></RatingStars>
              </a>
              <div>{gigDetail.ratings.toFixed(1)}</div>
              <div>({gigDetail.numOfRatings})</div>
            </div>
          </div>
          <div className="gig-details-carousel">
            <MyCarousel lazyLoad={false} gig={gigDetail}></MyCarousel>
          </div>
          {pricePackageInfo && (
            <PackageSelector
              pricePackageInfo={pricePackageInfo}
              handlePricePackageSelection={handlePricePackageSelection}
              handleContinueBuyClick={handleContinueBuyClick}
              setShowChatBox={setShowChatBox}
              sectionClassName="small-screen"
            />
          )}
          <div className="gig-details-description-div">
            <header>
              <h2>About This Gig</h2>
            </header>
            <div className="gig-details-description-wrapper">
              <Editor
                editorState={editorState}
                readOnly={true}
                customStyleMap={styleMap}
                onChange={(editorState) => setEditorState(editorState)}
                customStyleFn={() => {
                  return {
                    lineHeight: 1.5,
                    fontSize: "1rem",
                  };
                }}
              />
            </div>
          </div>
          <div id="gig-owner-details-id" className="gig-owner-details-div">
            <header>
              <h2>About The Seller</h2>
            </header>
            <div className="gig-owner-profile-info-wrapper">
              <Avatar
                avatarUrl={gigDetail.user.avatar?.url}
                userName={gigDetail.user.name}
                width="3rem"
                alt={gigDetail.user.name}
                fontSize="1.5rem"
              />
              <div className="gig-owner-profile-info">
                <Link to={`/user/${gigDetail.user._id}`}>
                  <div className="gig-owner-name">{gigDetail.user.name}</div>
                </Link>
                <div className="gig-owner-tagline">
                  {gigDetail.user.tagline}
                </div>
                <div className="gig-owner-rating-div">
                  <div>
                    <RatingStars rating={gigDetail.user.ratings}></RatingStars>
                  </div>
                  &nbsp;
                  <div className="gig-owner-rating">
                    {gigDetail.user.ratings.toFixed(1)}
                  </div>
                  &nbsp;
                  <div>({gigDetail.user.numOfRatings})</div>
                </div>
              </div>
            </div>
            <button onClick={() => setShowChatBox(true)}>Contact Me</button>
            <div className="gig-onwer-stats-description">
              <div className="gig-owner-stats">
                <ul>
                  <li>
                    From
                    <div>{gigDetail.user.country}</div>
                  </li>
                  <li>
                    Member since
                    <div>
                      <Moment format="MMM YYYY">
                        {gigDetail.user.userSince}
                      </Moment>
                    </div>
                  </li>
                  <li>
                    Last delivery
                    <div>
                      {gigDetail.user.lastDelivery ? (
                        <Moment fromNow>{gigDetail.user.lastDelivery}</Moment>
                      ) : (
                        "---"
                      )}
                    </div>
                  </li>
                </ul>
              </div>
              <div className="gig-owner-decription">
                {gigDetail.user.description}
              </div>
            </div>
          </div>
          <div id="review-container" className="gig-review-list-cotainer">
            <div className="user-detail-review-list-container">
              <div className="user-detail-review-list">
                <h2>
                  <span className="gig-detail-gig-review-count">
                    {gigDetail.numOfReviews} Reviews
                  </span>
                  &nbsp; &nbsp;
                  <div className="user-detail-review-rating-stars">
                    <HiStar />
                    <RatingStars rating={gigDetail.ratings}></RatingStars>
                  </div>
                  &nbsp; &nbsp;
                  <span className="user-detail-gig-rating">
                    {gigDetail.ratings.toFixed(1)}
                  </span>
                </h2>
                <RatingSelector
                  handleClickOnRating={handleClickOnRating}
                  gigDetail={gigDetail}
                  selectedRating={selectedRating}
                />
                {gigReviews && gigReviews.length > 0 && (
                  <ReviewsList reviews={gigReviews} ref={reviewsListRef} />
                )}
              </div>
            </div>
          </div>
        </section>

        {pricePackageInfo && (
          <PackageSelector
            pricePackageInfo={pricePackageInfo}
            handlePricePackageSelection={handlePricePackageSelection}
            handleContinueBuyClick={handleContinueBuyClick}
            setShowChatBox={setShowChatBox}
            sectionClassName="large-screen"
          />
        )}
      </div>
    </>
  ) : (
    <div className="min-h-screen w-full"></div>
  );
};
