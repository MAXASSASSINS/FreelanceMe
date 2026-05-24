import React, { useContext, useState } from "react";
import { GigCard } from "../GigCard/GigCard";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { IGig } from "../../types/gig.types";
import { windowContext } from "../../App";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

type UserGigsProps = {
  gigDetail: IGig;
};

const UserGigs = () => {
  const navigate = useNavigate();
  const { windowWidth } = useContext(windowContext);
  const [active, setActive] = useState<boolean>(true);
  const { user } = useSelector((state: RootState) => state.user);
  const { user: gigUser } = useSelector((state: RootState) => state.gigUser);
  const { userGigs } = useSelector((state: RootState) => state.userGigs);

  return (
    <>
      {user?._id === gigUser?._id && (
        <div className="user-detail-active-gigs-container">
          <div
            className={`active-gig  + ${active ? "selected" : ""}`}
            onClick={() => setActive(true)}
          >
            active gigs
          </div>
          <div
            className={`draft-gig  + ${!active ? "selected" : ""}`}
            onClick={() => setActive(false)}
          >
            drafts
          </div>
        </div>
      )}
      {gigUser && (
        <div className="user-detail-gig-list-container">
          <h2>{gigUser.name}'s Gigs</h2>
          <div className="user-detail-gig-list">
            {active
              ? userGigs &&
                userGigs
                  .filter((userGig) => userGig.active)
                  .map((userGig) => {
                    return <GigCard gig={userGig} key={userGig._id} />;
                  })
              : userGigs &&
                userGigs
                  .filter((userGig) => !userGig.active)
                  .map((userGig) => {
                    return <GigCard gig={userGig} key={userGig._id} />;
                  })}
            {user?._id === gigUser._id && (
              <div
                onClick={() =>
                  navigate("/gig/create/new/gig/null")
                }
                className="user-detail-create-new-gig-card"
              >
                <div className="add-circle-icon">
                  <AddCircleIcon
                    style={{ fontSize: "50px", color: "#62646a" }}
                  ></AddCircleIcon>
                </div>
                <div>Create a new Gig</div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UserGigs;
