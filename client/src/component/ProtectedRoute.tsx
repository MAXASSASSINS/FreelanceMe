import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { setRedirectUrl } from "../utility/util";
import { RootState } from "../store";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  const navigate = useNavigate();

  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setRedirectUrl(location.pathname);
      navigate("/login");
    }
  }, [user, isAuthenticated, location.pathname, navigate]);

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
