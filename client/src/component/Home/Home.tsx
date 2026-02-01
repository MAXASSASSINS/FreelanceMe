import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllGig, updateGigUsersOnlineStatus } from "../../actions/gigAction";
import "../../component/common.css";
import { GigCard } from "../GigCard/GigCard";
import "./home.css";
import { useLocation } from "react-router-dom";
import { SearchTagsBar } from "../SearchTagsBar";
import { AppDispatch, RootState } from "../../store";
import { useSocket } from "../../context/socketContext";
import { ONLINE_STATUS } from "../../types/miscellaneous.types";

export const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  let location = useLocation();

  const socket = useSocket();

  let { gigLoading, gigs } = useSelector((state: RootState) => state.gigs);

  useEffect(() => {
    let path = location.pathname;

    let params = new URLSearchParams(location.search);
    let category = "";
    let keywords = "";
    if (params) {
      category = params.get("category") || "";
      keywords = params.get("keywords") || "";
    }
    if (category) category = encodeURIComponent(category);
    if (keywords) keywords = encodeURIComponent(keywords);

    if (path === "/") {
      dispatch(getAllGig());
    } else if (path === "/search" && category) {
      dispatch(getAllGig(undefined, category));
    } else if (path === "/search" && keywords) {
      dispatch(getAllGig(keywords));
    } else {
      dispatch(getAllGig());
    }
  }, [location.pathname, location.search, dispatch]);

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

  // Updating online | offline status of a particular user
  useEffect(() => {
    const onlineHandler = (userId: string) => {
      console.log("online from server")
      dispatch(updateGigUsersOnlineStatus([{ userId, isOnline: true }]));
    };

    const offlineHandler = (userId: string) => {
      console.log("offline from server")
      dispatch(updateGigUsersOnlineStatus([{ userId, isOnline: false }]));
    };

    socket.on("online_from_server", onlineHandler);
    socket.on("offline_from_server", offlineHandler);

    return () => {
      socket.off("online_from_server", onlineHandler);
      socket.off("offline_from_server", offlineHandler);
    };
  }, [dispatch, socket]);

  // LAZY LOADING THE IMAGES AND VIDEOS
  useEffect(() => {
    const images = document.querySelectorAll("img[data-src]");
    const videoImages = document.querySelectorAll("video[data-poster]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (entry.target.attributes.getNamedItem("poster")) {
            entry.target.attributes.getNamedItem("poster")!.value =
              entry.target.attributes.getNamedItem("data-poster")!.value;
          } else {
            entry.target.attributes.getNamedItem("src")!.value =
              entry.target.attributes.getNamedItem("data-src")!.value;
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

  // console.log(gigs.map(gig => gig.user))

  return (
    <div className="min-h-[calc(100vh-146.5px)] sm:min-h-[calc(100vh-81px)] mb-8">
      <SearchTagsBar />
      {gigs.length > 0 ? (
        <div className="all-gigs-container">
          {gigs.map((gig) => (
            <GigCard lazyLoad={true} gig={gig} key={gig._id} />
          ))}
        </div>
      ) : (
        !gigLoading && (
          <div className="h-[calc(100vh-146.5px)] sm:h-[calc(100vh-81px)] mx-6 text-dark_grey flex flex-col items-center justify-center">
            <img
              className="max-w-sm sm:max-w-lg object-contain"
              src="/images/confused-man-with-question-mark-concept-flat-illustration-free-vector.jpg"
              alt="confused man with question mark"
            ></img>
            <h1 className="text-center text-xl sm:text-3xl capitalize font-semibold">
              No Services Found For Your Search
            </h1>
            <p className="max-w-[40ch] text-center mt-2 leading-5 sm:leading-normal sm:text-lg text-light_heading">
              Try a new search or select from the categories above for better
              results.
            </p>
          </div>
        )
      )}
    </div>
  );
};
