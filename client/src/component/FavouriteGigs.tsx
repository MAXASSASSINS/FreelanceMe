import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getFavoriteGigs, updateGigUsersOnlineStatus } from "../actions/gigAction";
import { AppDispatch, RootState } from "../store";
import { GigCard } from "./GigCard/GigCard";
import { useSocket } from "../context/socketContext";
import { ONLINE_STATUS } from "../types/miscellaneous.types";

export const FavouriteGigs = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const socket = useSocket()

  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  let { gigLoading, gigs } = useSelector((state: RootState) => state.gigs);

  useEffect(() => {
    // fetch favourite gigs
    if (isAuthenticated) {
      dispatch(getFavoriteGigs());
    } else {
      navigate("/login", { replace: true });
    }
  }, []);

  // LAZY LOADING THE IMAGES AND VIDEOS
  useEffect(() => {
    const images = document.querySelectorAll("img[data-src]");
    const videoImages = document.querySelectorAll("video[data-poster]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const posterAttr = entry.target.attributes.getNamedItem("poster");
          const dataPosterAttr =
            entry.target.attributes.getNamedItem("data-poster");
          const srcAttr = entry.target.attributes.getNamedItem("src");
          const dataSrcAttr = entry.target.attributes.getNamedItem("data-src");

          if (posterAttr && dataPosterAttr) {
            posterAttr.value = dataPosterAttr.value;
          } else if (srcAttr && dataSrcAttr) {
            srcAttr.value = dataSrcAttr.value;
          }
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "300px",
      }
    );

    images.forEach((image) => {
      observer.observe(image);
    });

    videoImages.forEach((image) => {
      observer.observe(image);
    });
  }, [gigs]);

  // memoizing gig users ids key to prevent infinite fetch
  const gigUserIdsKey = useMemo(() => {
    if (!gigs || gigs.length === 0) return "";
    return Array.from(new Set(gigs.map((gig) => gig.user._id)))
      .sort()
      .join(",");
  }, [gigs]);

  // emit event to fetch online status of gig's user
  useEffect(() => {
    if (!gigUserIdsKey) return;
    console.log("emitting get user onlijne status favirourite")
    socket.emit("get_users_online_status", gigUserIdsKey.split(","));
  }, [gigUserIdsKey]);

  // update online status
  useEffect(() => {
    const handler = (onlineStatusList: ONLINE_STATUS[]) => {
      dispatch(updateGigUsersOnlineStatus(onlineStatusList));
    };

    socket.on("online_user_snapshot", handler);
    return () => {
      socket.off("online_user_snapshot", handler);
    };
  }, [dispatch, socket]);

  return (
    <div className="min-h-[calc(100vh-146.5px)] sm:min-h-[calc(100vh-81px)] mb-8">
      <h1 className="all-gigs-container text-2xl font-semibold text-dark_grey underline pt-4 pb-0">
        Favourite Gigs
      </h1>
      <div className="all-gigs-container">
        {gigs &&
          !gigLoading &&
          gigs.length > 0 &&
          gigs.map((gig) => (
            <GigCard lazyLoad={true} gig={gig} key={gig._id} />
          ))}
      </div>
    </div>
  );
};
