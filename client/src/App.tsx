import "bootstrap/dist/css/bootstrap.css";
import { createContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
// @ts-ignore
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loadUser } from "./actions/userAction";
import "./app.css";
import { CreateGig } from "./component/CreateGig/CreateGig";
import { Footer } from "./component/Footer/Footer";
import { GigDetail } from "./component/GigDetail.js/GigDetail";
import { Header } from "./component/Header/Header";
import { Home } from "./component/Home/Home";
import { Inbox } from "./component/Inbox/Inbox2";
import { Login } from "./component/Login/Login";
import { NotFoundPage } from "./component/NotFoundPage/NotFoundPage";
import { PlaceOrder } from "./component/PlaceOrder/PlaceOrder";
import { Sidebar } from "./component/Sidebar/Sidebar";
import { SubmitRequirements } from "./component/SubmitRequirements/SubmitRequirements";
import { Test } from "./component/Test/Test";
import { UserDetail } from "./component/UserDetail/UserDetail";
import { AppDispatch, RootState } from "./store";

// @ts-ignore
import { CloudinaryContext } from "cloudinary-react";
import { Tooltip } from "./component/Tooltip/Tooltip";
import "./utility/color";

import "react-tooltip/dist/react-tooltip.css";
import { BalanceDetail } from "./component/BalanceDetail/BalanceDetail";
import { BuyerFeedback } from "./component/Feedback/BuyerFeedback";
import { OrderDetail } from "./component/OrderDetail/OrderDetail";
import { Orders } from "./component/Orders/Orders";
import { SignUp } from "./component/SignUp";
import SocketContextProvider from "./context/socketContext";

import { useDispatch } from "react-redux";
import { BankAccountForm } from "./component/BankAccountForm";
import { DataSendingLoading } from "./component/DataSendingLoading/DataSendingLoading";
import { FavouriteGigs } from "./component/FavouriteGigs";
import ProtectedRoute from "./component/ProtectedRoute";
import { ResetPassword } from "./component/ResetPassword";
import ScrollToTop from "./component/ScrollToTop";
import { UpdateUserProfile } from "./component/UpdateUserProfile";
import {
  useGlobalLoading,
  useGlobalLoadingText,
} from "./context/globalLoadingContext";

export const windowContext = createContext({ windowWidth: 0, windowHeight: 0 });

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, userLoading } = useSelector(
    (state: RootState) => state.user
  );

  const globalLoading = useGlobalLoading();
  const globalLoadingText = useGlobalLoadingText();

  const [windowWidth, setWindowWidth] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);

  const dimBackground = useSelector((state: RootState) => state.dimBackground);
  let height = document.documentElement.offsetHeight;
  let width = document.documentElement.offsetWidth;
  const pageheight = window.innerHeight;
  height = Math.max(pageheight, height);

  useEffect(() => {
    const onFocus = () => {
      dispatch(loadUser());
    };
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, []);
  

  useEffect(() => {
    let resizeWindow = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    resizeWindow();
    window.addEventListener("resize", resizeWindow);
    return () => window.removeEventListener("resize", resizeWindow);
  }, []);

  // useEffect(() => {
  //   const handleNewUser = () => {
  //     console.log("handle new user is called");
  //     if (isAuthenticated && user?._id) {
  //       socket.emit("new_user", user._id.toString());
  //     }
  //   };

  //   // Emit on connect
  //   socket.on("connect", handleNewUser);

  //   if (isAuthenticated && user?._id) {
  //     socket.emit("new_user", user._id.toString());
  //   }

  //   // Clean up
  //   return () => {
  //     socket.off("connect", handleNewUser);
  //   };
  // }, [isAuthenticated, user, userLoading]);

  // // SHOW ONLINE STATUS OF THE USER
  // useEffect(() => {
  //   socket.emit("online", isAuthenticated ? user?._id.toString() : null);
  //   const interval = setInterval(() => {
  //     socket.emit("online", isAuthenticated ? user?._id.toString() : null);
  //   }, 10000);
  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, [user, isAuthenticated]);

  // List of paths where footer will be hidden
  const pathsWithoutFooter = [
    "/get/all/messages/for/current/user",
    "/gig/create/new/gig",
    "/login",
    "/signUp",
    "/orders/",
    "/update/profile",
    "/reset/password/",
  ]; // Add any other paths here

  // Checking if the current location matches any path in pathsWithoutFooter
  const hideFooter = pathsWithoutFooter.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <>
      <ScrollToTop>
        <windowContext.Provider value={{ windowWidth, windowHeight }}>
          <CloudinaryContext cloudName="dyod45bn8" uploadPreset="syxrot1t">
            <SocketContextProvider>
              <DataSendingLoading
                show={globalLoading}
                loadingText={globalLoadingText}
              />
              <Tooltip place="bottom" />
              {windowWidth < 900 && <Sidebar></Sidebar>}
              <Header></Header>
              <ToastContainer />
              <Routes>
                <Route
                  path="/reset/password/:token"
                  element={<ResetPassword />}
                ></Route>
                <Route
                  path="/get/all/messages/for/current/user"
                  element={
                    <ProtectedRoute>
                      <Inbox />
                    </ProtectedRoute>
                  }
                ></Route>

                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signUp" element={<SignUp />} />

                <Route path="/user/:id" element={<UserDetail />} />
                <Route path="/gig/details/:id" element={<GigDetail />} />
                <Route path="*" element={<NotFoundPage />} />
                <Route
                  path="/gig/create/new/gig"
                  element={
                    <ProtectedRoute>
                      <CreateGig />
                    </ProtectedRoute>
                  }
                ></Route>
                <Route
                  path="/gig/place/order/:id/:packageNumber"
                  element={
                    <ProtectedRoute>
                      <PlaceOrder />
                    </ProtectedRoute>
                  }
                ></Route>
                <Route path="/test" element={<Test />}></Route>
                <Route
                  path="/gig/place/order/submit/requirements/:orderId"
                  element={
                    <ProtectedRoute>
                      <SubmitRequirements />
                    </ProtectedRoute>
                  }
                ></Route>
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <OrderDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id/feedback"
                  element={
                    <ProtectedRoute>
                      <BuyerFeedback />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/balance/detail"
                  element={
                    <ProtectedRoute>
                      <BalanceDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my/favourite/gigs"
                  element={
                    <ProtectedRoute>
                      <FavouriteGigs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/update/profile"
                  element={
                    <ProtectedRoute>
                      <UpdateUserProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bank_account"
                  element={
                    <ProtectedRoute>
                      <BankAccountForm />
                    </ProtectedRoute>
                  }
                />
              </Routes>
              <div
                style={{ height: height - (width > 600 ? 81 : 143) }}
                className={
                  "search-bar-dim-background " +
                  (dimBackground ? "visible" : null)
                }
              ></div>
              {!hideFooter && <Footer />}
            </SocketContextProvider>
          </CloudinaryContext>
        </windowContext.Provider>
      </ScrollToTop>
    </>
  );
};

export default App;
