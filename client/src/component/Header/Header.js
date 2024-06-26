// eslint-disable-next-line
import React, { useEffect, useRef, useState } from "react";
import "../../component/common.css";
import "./header.css";
import { useSelector, useDispatch } from "react-redux";
import {
  showDimBackground,
  hideDimBackground,
} from "../../actions/dimBackgroundAction";
import { getUser, logoutUser } from "../../actions/userAction";
import { loggedUser } from "../../actions/userAction";
import {
  Outlet,
  Navigate,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Fragment } from "react";
import { Avatar } from "../Avatar/Avatar";
import { FaRegEnvelope } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";
import { BiSearchAlt, BiUserCircle } from "react-icons/bi";
import { AiOutlineSearch } from "react-icons/ai";
import { numberToCurrency } from "../../utility/util";
import { getAllGig } from "../../actions/gigAction";
import { tagOptions } from "../CreateGig/tagsData";
import { loadStripe } from "@stripe/stripe-js";

export const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const searchRef = useRef(null);
  const avatarRef = useRef(null);
  const tagListContainerRef = useRef(null);
  const [search, setSearch] = useState("");
  const [tagList, setTagList] = useState([]);
  const [inputFocus, setInputFocus] = useState(false);

  const [showAvatarMenu, setShowAvatarMenu] = useState(false);

  const { user, userLoading, isAuthenticated, userError } = useSelector(
    (state) => state.user
  );

  const show = () => {
    dispatch(showDimBackground());
  };

  const hide = () => {
    dispatch(hideDimBackground());
  };

  const handleLogoClick = () => {
    searchRef.current.value = "";
    dispatch(getAllGig());
    navigate("/");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    hideDimBackground();
    const searchQuery = searchRef.current.value.trim();
    setTagList([]);
    if (searchQuery === "") {
      navigate("/search");
      searchRef.current.blur();
      dispatch(hideDimBackground());
      return;
    }
    const keywords = encodeURIComponent(searchQuery);
    navigate(`/search?keywords=${keywords}`);
    searchRef.current.blur();
  };

  const handleSearchChange = (e) => {
    let search = e.target.value;
    setSearch(search);
    let tagList = [];
    if (search) {
      tagList = tagOptions.filter((tag) =>
        tag.value.toLowerCase().includes(search.toLowerCase())
      );
    }
    setTagList(tagList);
  };

  const handleTagClick = (e) => {
    const tag = e.target.innerText;
    searchRef.current.value = tag;
    setSearch(tag);
    handleSubmit(e);
    setTagList([]);
  };

  useEffect(() => {
    let params = location.search;
    if (params && params.includes("keywords")) {
      const keywords = new URLSearchParams(params).get("keywords");
      searchRef.current.value = keywords;
      setSearch(keywords);
    }
  }, [location]);

  useEffect(() => {
    const handleClick = (e) => {
      if (
        e.target !== searchRef.current &&
        e.target !== tagListContainerRef.current
      ) {
        setTagList([]);
      }
      if (!e.target.closest("#avatar-menu")) {
        setShowAvatarMenu(false);
      }
    };

    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, []);

  const handleLogOut = async () => {
    dispatch(logoutUser());
    if (!userError) navigate("/");
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="title-wrapper">
          <h1
            className="heading hover:cursor-pointer"
            onClick={handleLogoClick}
          >
            FreelanceMe
          </h1>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <input
            ref={searchRef}
            className="search-input"
            onFocus={show}
            onBlur={hide}
            placeholder="Find services"
            onChange={handleSearchChange}
            // autoComplete="off"
          ></input>
          <div onClick={handleSubmit} className="search-icon">
            <AiOutlineSearch />
          </div>
          {tagList.length > 0 && (
            <div className="w-full bg-separator absolute top-16 z-[1000000] rounded max-h-[60vh] overflow-y-scroll">
              <ul className="" ref={tagListContainerRef}>
                {tagList.map((tag, index) => {
                  return (
                    <li
                      onClick={handleTagClick}
                      key={index}
                      value={tag.value}
                      className="px-4 py-3 hover:bg-dark_separator hover:cursor-pointer "
                    >
                      {/* <Link to={`/search?keywords=${tag.value}`}> */}
                      {tag.value}
                      {/* </Link> */}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </form>

        <div className="navigation-icons">
          <div className="inbox-icon">
            <Link to="/get/all/messages/for/current/user">
              <FaRegEnvelope />
            </Link>
          </div>
          <div
            className="my-list-icon"
            onClick={() => navigate("/my/favourite/gigs")}
          >
            <FaRegHeart />
          </div>
          <div className="orders-icon" onClick={() => navigate("/orders")}>
            Orders
          </div>
          {!isAuthenticated ? (
            <Link to="/login">
              <div>
                <BiUserCircle className="profile-icon" />
              </div>
            </Link>
          ) : (
            <div className="relative">
              <div
                ref={avatarRef}
                id="avatar-menu"
                onClick={() => setShowAvatarMenu((prev) => !prev)}
                className="relative profile-icon"
              >
                {/* <Link to={"/user/" + user._id}> */}
                <Avatar
                  avatarUrl={user.avatar.url}
                  userName={user.name}
                  onlineStatus={true}
                  width="2rem"
                  alt="user profile"
                  onlineStatusWidth={"0.8rem"}
                />
              </div>
              {showAvatarMenu && (
                <div className="absolute z-50 text-light_heading min-w-max right-0 top-10 px-4 py-3 rounded bg-separator shadow-lg leading-5">
                  <ul className="hover:[&>*]:underline flex flex-col gap-4">
                    <Link to={"/user/" + user._id}>Profile</Link>

                    <Link to={"/my/favourite/gigs"}>Favourite Gigs</Link>

                    <Link to={"/get/all/messages/for/current/user"}>Inbox</Link>

                    <Link to={"/orders"}>Orders</Link>
                    <li onClick={handleLogOut} className="hover:cursor-pointer">
                      Logout
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
          {isAuthenticated && (
            <div className="header-balance">
              <Link to={"/balance/detail"}>
                <p>₹{numberToCurrency(user.balance)}</p>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
