import { useState } from "react";
import { BiUserCircle } from "react-icons/bi";
import { FaBars } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../../actions/userAction";
import { AppDispatch, RootState } from "../../store";
import { Avatar } from "../Avatar/Avatar";
import "./sidebar.css";

export const Sidebar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, isAuthenticated, userError } = useSelector(
    (state: RootState) => state.user
  );
  const [sidebar, setSidebar] = useState<boolean>(false);

  const showSidebar = () => {
    setSidebar(true);
  };

  const hideSidebar = () => {
    setSidebar(false);
  };

  const handleLogOut = async () => {
    dispatch(logoutUser());
    if (!userError) navigate("/");
  };

  return (
    <>
      <div className="900:hidden absolute top-8 left-4 z-[99]" onClick={showSidebar}>
        <FaBars className="text-xl" />
      </div>
      <div className="sidebar">
        <div className={"site-sidebar " + (sidebar ? "menu-shown" : null)}>
          <section className="sidebar-title">
            {isAuthenticated ? (
              <Avatar
                avatarUrl={user?.avatar?.url}
                userName={user?.name || "Guest"}
                width="2.5rem"
                alt="user profile"
                onlineStatus={true}
                onlineStatusWidth="0.75rem"
                fontSize="1.125rem"
              />
            ) : (
              <div>
                <BiUserCircle className="sidebar-profile-icon" />
              </div>
            )}

            <div className="user-name break-all">{user?.name || "Profile"}</div>
          </section>
          <section onClick={hideSidebar} className="sidebar-menu">
            <Link to="/" className="sidebar-menu-item">
              Home
            </Link>
            <Link
              to="/get/all/messages/for/current/user"
              className="sidebar-menu-item"
            >
              Inbox
            </Link>
            <Link to="/orders" className="sidebar-menu-item">
              Manage Orders
            </Link>
            <Link to="/my/favourite/gigs" className="sidebar-menu-item">
              Favourites
            </Link>
            {isAuthenticated ? (
              <div onClick={handleLogOut} className="sidebar-menu-item">
                Logout
              </div>
            ) : (
              <Link to="/login" className="sidebar-menu-item">
                Login
              </Link>
            )}
          </section>
        </div>
        <div
          className={"sidebar-overlay " + (sidebar ? "menu-shown" : null)}
          onClick={hideSidebar}
        ></div>
      </div>
    </>
  );
};
