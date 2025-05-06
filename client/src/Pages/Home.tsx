import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { getAllGig } from "../actions/gigAction";
import { GigCard } from "../component/GigCard/GigCard";
import { SearchTagsBar } from "../component/SearchTagsBar";
import useLazyLoading from "../hooks/useLazyLoading";
import { AppDispatch, RootState } from "../store";
import { IUser } from "../types/user.types";
import { useSocket } from "../context/socketContext";

export const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  let location = useLocation();
  let { gigLoading, gigs } = useSelector((state: RootState) => state.gigs);
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );
  const socket = useSocket();
  const [gigUserOnline, setGigUserOnline] = useState<Map<string, boolean>>(
    new Map()
  );

  // useEffect(() => {
  //   if (isAuthenticated && user) {
  //     setGigUserOnline((prev) => prev.set(user._id, true));
  //   }
  // }, [isAuthenticated, user]);

  useEffect(() => {
    const ids = gigs?.map((gig) => (gig.user as IUser)._id) || [];
    socket.emit("get_users_online_status", ids);

    socket.on("users_online_status_from_server", (data) => {
      console.log("users_online_status_from_server", data);
      const map = new Map<string, boolean>();
      data.forEach((item: { id: string; online: boolean }) => {
        map.set(item.id, item.online);
      });
      setGigUserOnline(map);
    });

    return () => {
      socket.off("users_online_status_from_server");
    };
  }, [gigs, socket]);

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
  }, [location.pathname, location.search]);

  useEffect(() => {
    dispatch(getAllGig());
  }, [dispatch]);

  // Tracking the online status of the gigs listed in the home page
  useEffect(() => {
    socket.on("online_from_server", (userId) => {
      const map = new Map(gigUserOnline);
      map.set(userId, true);
      setGigUserOnline(map);
    });

    socket.on("offline_from_server", (userId) => {
      console.log("offline_from_server", userId);
      const map = new Map(gigUserOnline);
      map.set(userId, false);
      setGigUserOnline(map);
    });

    return () => {
      socket.off("online_from_server");
      socket.off("offline_from_server");
    };
  }, [socket, dispatch, gigUserOnline]);

  // LAZY LOADING THE IMAGES AND VIDEOS
  useLazyLoading({ dependencies: [gigs] });

  return (
    <div className="min-h-[calc(100vh-146.5px)] sm:min-h-[calc(100vh-81px)] mb-8">
      <SearchTagsBar />
      {gigs?.length && gigs.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 900:grid-cols-4  1100:mx-5 1100:py-8 1240:grid-cols-5 pt-8 px-6 pb-0 gap-5">
          {gigs &&
            gigs.map((gig) => {
              gig.user = gig.user as IUser;
              return (
                <GigCard
                  online={gigUserOnline.get(gig.user._id) || false}
                  lazyLoad={true}
                  gig={gig}
                  key={gig._id}
                />
              );
            })}
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
