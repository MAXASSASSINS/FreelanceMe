import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { setRedirectUrl } from "../utility/util";
import { AppDispatch, RootState } from "../store";
import { useDispatch } from "react-redux";
import { loadUser } from "../actions/userAction";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  const location = useLocation();

  if (!isAuthenticated) {
    setRedirectUrl(location.pathname);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
