import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { hideDimBackground } from "../../actions/dimBackgroundAction";
import { getAllGig } from "../../actions/gigAction";
import "../../component/common.css";
import { AppDispatch, RootState } from "../../store";
import "./header.css";
import NavigationIcons, { NavigationIconsRef } from "./NavigationIcons";
import SearchBar, { SearchBarRef } from "./SearchBar";

export const Header = () => {
  const dispatch = useDispatch<AppDispatch>();
  const dimBackground = useSelector((state: RootState) => state.dimBackground);
  const navigate = useNavigate();
  const searchBarRef = useRef<SearchBarRef>(null);
  const navigationIconsRef = useRef<NavigationIconsRef>(null);

  const handleLogoClick = () => {
    searchBarRef.current?.updateSearch("");
    searchBarRef.current?.updateTagList([]);
    dispatch(hideDimBackground());
    dispatch(getAllGig());
    navigate("/");
  };

  const hideSuggestions = useCallback(() => {
    searchBarRef.current?.updateTagList([]);
    dispatch(hideDimBackground());
  }, [dispatch]);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest("#header-search-bar")) {
        hideSuggestions();
      }
      if (!target.closest("#avatar-menu")) {
        navigationIconsRef.current?.handleVisibityOfAvatarMenu(false);
      }
    },
    [hideSuggestions]
  );

  useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [handleClick]);

  return (
    <>
      {dimBackground && (
        <div
          onClick={hideSuggestions}
          className="absolute inset-0 z-[97] bg-[rgba(0,0,0,0.5)]"
        ></div>
      )}
      <header className="header bg-white sticky  z-[98]">
        <div className="header-container">
          <div className="title-wrapper">
            <h1
              className="heading hover:cursor-pointer"
              onClick={handleLogoClick}
            >
              FreelanceMe
            </h1>
          </div>

          <SearchBar ref={searchBarRef} />

          <NavigationIcons ref={navigationIconsRef} />
        </div>
      </header>
    </>
  );
};
