import { debounce } from "@mui/material";
import { useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { HiStar } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UPDATE_USER_SUCCESS } from "../../constants/userConstants";
import { RootState } from "../../store";
import { IGig } from "../../types/gig.types";
import { IUser } from "../../types/user.types";
import { axiosInstance } from "../../utility/axiosInstance";
import { Avatar } from "../Avatar/Avatar";
import "./gigCard.css";
import MyCarousel from "../Carousel/MyCarousel";

type GigCardProps = {
  gig: IGig;
  lazyLoad?: boolean;
  online?: boolean;
};

export const GigCard = ({ gig, lazyLoad = false, online }: GigCardProps) => {
  // console.log(online);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  const [favourite, setFavourite] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated && user?.favouriteGigs.includes(gig._id)) {
      setFavourite(true);
    }
  }, [user, isAuthenticated, gig._id]);

  const handleUpdateFavourite = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const gigId = gig._id;
    try {
      const { data } = await axiosInstance.post(`/user/favourite/gig/${gigId}`);
      let newFavoriteGigs = [...(user?.favouriteGigs || [])];
      if (data.isFavourite) {
        newFavoriteGigs.push(gigId);
      } else {
        newFavoriteGigs = newFavoriteGigs.filter((id) => id !== gigId);
      }
      dispatch({
        type: UPDATE_USER_SUCCESS,
        payload: { ...user, favouriteGigs: newFavoriteGigs },
      });
      setFavourite(!favourite);
    } catch (err: any) {
      console.log(err.response.status);
      toast.error("We're sorry, something went wrong");
    }
  };

  const debouncedUpdateFavourite = debounce(handleUpdateFavourite, 300);

  gig.user = gig.user as IUser;

  return (
    <div className="gig-card">
      <div className="container-wrapper">
        <MyCarousel useWebp={true} lazyLoad={lazyLoad} gig={gig} />
        <div className="user-details-container">
          <Avatar
            avatarUrl={gig.user.avatar?.url}
            alt="user avatar"
            width="2rem"
            userName={gig.user.name}
            onlineStatus={online}
          />
          <Link to={`/user/${gig.user._id}`}>
            <div className="gig-user-name">{gig.user.name}</div>
          </Link>
        </div>
        <Link to={`/gig/details/${gig._id}`}>
          <h2 className="gig-title">{gig.title}</h2>
        </Link>
        <div className="ratings-container">
          <HiStar />
          <span className="ratings">{gig.ratings.toFixed(1)}</span>
          <span className="no-of-reviews">({gig.numOfRatings})</span>
        </div>

        <div className="action-price-container">
          <div
            onClick={debouncedUpdateFavourite}
            className="add-to-list-container"
          >
            {favourite ? (
              <FaHeart style={{ display: "inline", color: "#f74040" }} />
            ) : (
              <FaRegHeart style={{ display: "inline" }} />
            )}
          </div>
          <Link to={`/gig/details/${gig._id}`}>
            <div className="price-container">
              <div className="starting-at">STARTING AT</div>
              <div>
                ₹
                {!gig.pricing || gig.pricing.length === 0
                  ? "100"
                  : gig.pricing[0].packagePrice.toLocaleString("en-IN")}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
