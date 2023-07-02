import React, {useEffect} from "react";
import "./gigCard.css";
import { MyCarousel } from "../Carousel/MyCarousel";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { IoMdImages } from "react-icons/io";
import { Avatar } from "../Avatar/Avatar";

export const GigCard = ({ gig, lazyLoad }) => {
  // console.log(gig.pricing)
  const handleClick = () => {
    // console.log("clicked");
  };
  // console.log(gig.user)
  return (
    <div className="gig-card">
      <div className="container-wrapper">
        <Link to={`/user/${gig.user._id}`}>
          <MyCarousel lazyLoad={lazyLoad} gig={gig}></MyCarousel>
        </Link>
        <div className="user-details-container">
          <Avatar
            avatarUrl={gig.user.avatar.url}
            alt="user avatar"
            width="2rem"
            userName={gig.user.name}
          />
          {/* <img src={gig.user.avatar.url} alt="profile" ></img> */}
          {/* <div className='client-list-online-status' style={{ backgroundColor: onlineStatusOfClients[index] ? "#1dbf73" : "#a6a5a5" }}></div> */}
          {/* <div className='gig-card-online-status' style={{ backgroundColor: gig.user.online ? "#1dbf73" : "#a6a5a5" }}></div> */}
          <Link to={`/user/${gig.user._id}`} onClick={handleClick}>
            <div className="gig-user-name">{gig.user.name}</div>
          </Link>
        </div>
        <Link to={`/gig/details/${gig._id}`}>
          <h2 className="gig-title">{gig.title}</h2>
        </Link>
        <div className="ratings-container">
          <i className="fa-solid fa-star"></i>
          <span className="ratings">{gig.ratings.toFixed(1)}</span>
          <span className="no-of-reviews">({gig.numOfReviews})</span>
        </div>

        <div className="action-price-container">
          <div className="add-to-list-container">
            <i className="fa-solid fa-bars bars"></i>
            <i className="fa-solid fa-heart"></i>
          </div>
          <Link to={`/gig/details/${gig._id}`}>
            <div className="price-container">
              <div className="starting-at">STARTING AT</div>
              <div>
                ₹
                {gig.pricing.length === 0
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
