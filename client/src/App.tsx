import { createContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../src/component/common.css";
import { loadUser } from "./actions/userAction";
import "./app.css";
import { Footer } from "./component/Footer/Footer";
import { Header } from "./component/Header/Header";
import { NotFoundPage } from "./component/NotFoundPage/NotFoundPage";
import { Sidebar } from "./component/Sidebar/Sidebar";
import { Test } from "./component/Test/Test";
import { CreateGig } from "./Pages/CreateGig";
import { GigDetail } from "./Pages/GigDetail/GigDetail";
import { Home } from "./Pages/Home";
import { Inbox } from "./Pages/Inbox";
import { Login } from "./Pages/Login";
import { PlaceOrder } from "./Pages/PlaceOrder";
import { SubmitRequirements } from "./Pages/SubmitRequirements";
import { UserDetail } from "./Pages/UserDetail/UserDetail";
import { AppDispatch, RootState } from "./store";
// @ts-ignore
import { CloudinaryContext } from "cloudinary-react";
import { Tooltip } from "./component/Tooltip/Tooltip";
import "./utility/color";
import Cookies from "js-cookie";
import "react-tooltip/dist/react-tooltip.css";
import { BalanceDetail } from "./Pages/BalanceDetail";
import { BuyerFeedback } from "./Pages/BuyerFeedback";
import { OrderDetail } from "./Pages/OrderDetail";
import { Orders } from "./Pages/Orders";
import { SignUp } from "./Pages/SignUp";

import { useDispatch } from "react-redux";
import { DataSendingLoading } from "./component/DataSendingLoading";
import ProtectedRoute from "./component/ProtectedRoute";
import { ResetPassword } from "./component/ResetPassword";
import ScrollToTop from "./component/ScrollToTop";
import {
  useGlobalLoading,
  useGlobalLoadingText,
} from "./context/globalLoadingContext";
import { useSocket } from "./context/socketContext";
import { BankAccountForm } from "./Pages/BankAccountForm";
import { FavouriteGigs } from "./Pages/FavouriteGigs";
import { UpdateUserProfile } from "./Pages/UpdateUserProfile";

export const windowContext = createContext({ windowWidth: 0 });

const App = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  const socket = useSocket();
  const globalLoading = useGlobalLoading();
  const globalLoadingText = useGlobalLoadingText();

  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      await dispatch(loadUser());
    };
    fetchUser();
  }, []);

  useEffect(() => {
    socket.on("connect_error", (err) => {
      console.log(err);
    });

    return () => {
      socket.off("connect_error");
    };
  }, [socket]);

  useEffect(() => {
    let resizeWindow = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", resizeWindow);
    resizeWindow();
    return () => window.removeEventListener("resize", resizeWindow);
  }, []);

  // SHOW ONLINE STATUS OF THE USER
  useEffect(() => {
    socket.emit("online", isAuthenticated ? user?._id.toString() : null);
    const interval = setInterval(() => {
      socket.emit("online", isAuthenticated ? user?._id.toString() : null);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [user, isAuthenticated, socket]);

  return (
    <>
      <ScrollToTop>
        <windowContext.Provider value={{ windowWidth }}>
          <CloudinaryContext cloudName="dyod45bn8" uploadPreset="syxrot1t">
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
                path="/gig/create/new/gig/:id"
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
            <Footer />
          </CloudinaryContext>
        </windowContext.Provider>
      </ScrollToTop>
    </>
  );
};

export default App;
