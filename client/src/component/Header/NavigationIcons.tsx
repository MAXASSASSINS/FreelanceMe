import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { BiUserCircle } from "react-icons/bi";
import { FaRegEnvelope, FaRegHeart } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { RootState } from "../../store";
import { numberToCurrency } from "../../utility/util";
import AvatarMenu from "./AvatarMenu";
import { Avatar } from "../Avatar/Avatar";

type NavigationIconsProps = {};

export type NavigationIconsRef = {
  handleVisibityOfAvatarMenu: (val: boolean) => void;
};

const NavigationIcons = (
  props: NavigationIconsProps,
  ref: React.Ref<NavigationIconsRef>
) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.user
  );
  const avatarRef = useRef<HTMLDivElement>(null);
  const [showAvatarMenu, setShowAvatarMenu] = useState<boolean>(false);

  useImperativeHandle(ref, () => ({
    handleVisibityOfAvatarMenu: (val) => {
      setShowAvatarMenu(val);
    },
  }), []);

  return (
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
            <Avatar
              avatarUrl={user!.avatar?.url}
              userName={user!.name}
              onlineStatus={true}
              width="2rem"
              alt="user profile"
              onlineStatusWidth={"0.8rem"}
            />
          </div>
          {showAvatarMenu && <AvatarMenu />}
        </div>
      )}
      {isAuthenticated && (
        <div className="header-balance">
          <Link to={"/balance/detail"}>
            <p>₹{numberToCurrency(user!.balance)}</p>
          </Link>
        </div>
      )}
    </div>
  );
};

export default forwardRef(NavigationIcons);
