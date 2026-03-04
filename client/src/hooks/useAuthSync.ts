import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store";
import { loadUser } from "../actions/userAction";
import { LOGOUT_USER_SUCCESS } from "../constants/userConstants";

export const useAuthSync = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Initial bootstrap (page reload / fresh tab)
  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  // Silent re-auth when tab gains focus
  useEffect(() => {
    const onFocus = () => {
      dispatch(loadUser(true)); // silent
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [dispatch]);

  // Cross-tab logout sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "logout") {
        dispatch({ type: LOGOUT_USER_SUCCESS });
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [dispatch]);
};
