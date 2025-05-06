import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getFavoriteGigs } from "../actions/gigAction";
import { AppDispatch, RootState } from "../store";
import { GigCard } from "../component/GigCard/GigCard";
import useLazyLoading from "../hooks/useLazyLoading";

export const FavouriteGigs = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  let { gigLoading, gigs } = useSelector((state: RootState) => state.gigs);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getFavoriteGigs());
    }
  }, [isAuthenticated]);

  // LAZY LOADING THE IMAGES AND VIDEOS
  useLazyLoading({ dependencies: [gigs] });

  return (
    <div className="min-h-[calc(100vh-146.5px)] sm:min-h-[calc(100vh-81px)] mb-8">
      <h1 className="px-6 min-[1100px]:mx-5 text-2xl font-semibold text-dark_grey underline pt-4 pb-0">
        Favourite Gigs
      </h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 min-[900px]:grid-cols-4  min-[1100px]:mx-5 min-[1100px]:py-8 min-[1240px]:grid-cols-5 pt-8 px-6 pb-0 gap-5">
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
