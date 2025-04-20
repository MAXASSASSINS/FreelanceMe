import React from "react";
import { BsPencilSquare } from "react-icons/bs";
import { Link } from "react-router-dom";
import { Avatar } from "../Avatar/Avatar";
import { IoLocationSharp } from "react-icons/io5";
import { FaPaperPlane, FaUser } from "react-icons/fa";
import Moment from "react-moment";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import { RatingStars } from "../RatingStars/RatingStars";

type UserInfoProps = {
  setShowChatBox: React.Dispatch<React.SetStateAction<boolean>>;
};

const UserInfo = ({ setShowChatBox }: UserInfoProps) => {
  const { user: gigUser } = useSelector((state: RootState) => state.gigUser);
  const { user } = useSelector((state: RootState) => state.user);

  return (
    gigUser && (
      <div className="user-info-div">
        <div className="user-info-large-screen-border first-div">
          <div className="user-info-wrapper relative">
            <div className="user-info-list-icon"></div>
            {gigUser._id === user?._id && (
              <Link
                to={"/update/profile"}
                className="absolute right-0 text-xl text-[#3f63c8]"
              >
                <BsPencilSquare />
              </Link>
            )}
            <div className="user-detail user-profile-pic">
              <Avatar
                avatarUrl={gigUser.avatar?.url}
                userName={gigUser.name}
                width={"8rem"}
                alt={"gig profile"}
                fontSize="3rem"
              />
            </div>
            <div>
              <h1 className="user-detail-user-name">{gigUser.name}</h1>
              <p className="user-detail-tagline">{gigUser.tagline}</p>
            </div>
            <div className="user-info-review-container">
              <RatingStars rating={gigUser.ratings}></RatingStars>
              &nbsp; &nbsp;
              <span>{gigUser.ratings.toFixed(1)}</span>
              &nbsp; &nbsp;
              <span className="user-detail-review-info">
                ({gigUser.numOfReviews} reviews)
              </span>
            </div>
          </div>
          <div
            onClick={() => setShowChatBox(true)}
            className="hover:cursor-pointer user-detail-contact-me"
          >
            <button className="hover:cursor-pointer">Contact Me</button>
          </div>
          <div className="user-detail-where-abouts-container">
            <ul>
              <li>
                <span>
                  <IoLocationSharp className="inline" />
                  From
                </span>
                <p className="capitalize">{gigUser.country}</p>
              </li>
              <li>
                <span>
                  <FaUser className="inline" />
                  Member Since
                </span>
                <p>
                  <Moment format="MMM YYYY">{gigUser.userSince}</Moment>
                </p>
              </li>
              <li>
                <span>
                  {" "}
                  <FaPaperPlane className="inline" /> Last Delivery
                </span>
                <p>
                  {gigUser.lastDelivery ? (
                    <Moment fromNow>{gigUser.lastDelivery}</Moment>
                  ) : (
                    "---"
                  )}
                </p>
              </li>
            </ul>
          </div>
        </div>
        <nav className="user-detail-navigation-container">
          <button>
            <a href="#user-detail-about-section">About</a>
          </button>
          <button>
            <a href="#user-detail-gigs-section">Gigs</a>
          </button>
          <button>
            <a href="#user-detail-reviews-section">Reviews</a>
          </button>
        </nav>
        <div
          id="user-detail-about-section"
          className="user-info-large-screen-border"
        >
          <div className="user-core-container">
            <div className="user-detail-description">
              <h3>Description</h3>
              <p>{gigUser.description}</p>
            </div>
            <div className="user-detail-language">
              <h3>Languages</h3>
              <ul className="flex flex-col gap-2">
                {gigUser.languages.map((language, index) => (
                  <li key={index}>
                    <span className="user-detail-language-name capitalize">
                      {language.name}
                    </span>
                    &nbsp;&nbsp;–
                    <span className="user-detail-language-fluency capitalize">
                      {" "}
                      {language.level}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="user-detail-skills-container">
              <h3>Skills</h3>
              <ul>
                {gigUser.skills.map((skill, index) => (
                  <li key={index}>{skill.name}</li>
                ))}
              </ul>
            </div>
            <div className="user-detail-education-container">
              <h3>Education</h3>
              <ul>
                {gigUser.education.map((item, index) => (
                  <li key={index}>
                    <div>
                      <span>{item.degree}</span>
                      &nbsp;
                      <span>-</span>
                      &nbsp;
                      <span>{item.major}</span>
                    </div>
                    <div className="user-detail-college">
                      <span>{item.collegeName},</span>
                      &nbsp;
                      <span className="capitalize">{item.country},</span>
                      &nbsp;
                    </div>
                    <div className="user-detail-graduated-year">
                      Graduated &nbsp;
                      <span>{item.yearOfGraduation}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="user-detail-certification-container">
              <h3>Certification</h3>
              <ul>
                {gigUser.certificates.map((certificate, index) => (
                  <li key={index}>
                    <div>{certificate.name}</div>
                    <div className="user-detail-certified-from">
                      {certificate.certifiedFrom} &nbsp; {certificate.year}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default UserInfo;
