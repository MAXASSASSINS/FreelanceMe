import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loggedUser } from "../actions/userAction";
import { AppDispatch, RootState } from "../store";
import { axiosInstance } from "../utility/axiosInstance";
import { getRedirectUrl } from "../utility/util";

export const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");

  const [openForgotPasswordModal, setOpenForgotPasswordModal] =
    useState<boolean>(false);
  const [forgotLoginEmail, setForgotLoginEmail] = useState<string>("");

  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill all the fields", {});
      return;
    }
    dispatch(loggedUser(loginEmail, loginPassword));
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!forgotLoginEmail) {
      toast.error("Please enter email");
      return;
    }
    try {
      const res = await axiosInstance.post("/forgotPassword", {
        email: forgotLoginEmail,
      });
      toast.success(res.data.message, { autoClose: 10000 });
      setForgotLoginEmail("");
      setOpenForgotPasswordModal(false);
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const redirectUrl = getRedirectUrl();
      if (redirectUrl) navigate(redirectUrl);
      else navigate("/");
    }
  }, [dispatch, isAuthenticated]);

  return (
    <div className="flex flex-col text-dark_grey justify-center items-center min-h-[calc(100vh-146.5px)] sm:min-h-[calc(100vh-81px)]">
      <div className="text-center">
        <h2 className="text-5xl">Login</h2>
      </div>
      <form className="mt-8 flex flex-col gap-6" onSubmit={handleLoginSubmit}>
        <div className="inline-flex flex-col">
          <label className="mb-1" htmlFor="email">
            Email
          </label>
          <input
            onChange={(e) => setLoginEmail(e.target.value)}
            id="email"
            type="email"
            className="border border-no_focus px-4 py-2 rounded-sm w-[20rem] placeholder:text-no_focus focus:outline-none focus:border-dark_grey"
            required
            placeholder="shadab@gmail.com"
          />
        </div>
        <div className="inline-flex flex-col">
          <label className="mb-1" htmlFor="password">
            Password
          </label>
          <input
            onChange={(e) => setLoginPassword(e.target.value)}
            id="password"
            type="password"
            className="border border-no_focus px-4 py-2 rounded-sm w-[20rem] focus:outline-none focus:border-dark_grey"
            required
            placeholder="•••••••••"
          />
        </div>

        <p
          onClick={() => setOpenForgotPasswordModal(true)}
          className="ml-auto cursor-pointer text-sm text-light_heading -mt-5 hover:underline"
        >
          Forgot Password?
        </p>
        <p className="text-light_heading">
          Don't have an account?{" "}
          <Link
            className="underline text-primary hover:cursor-pointer hover:text-primary_hover"
            to={"/signUp"}
          >
            Sign Up
          </Link>
        </p>
        <div className="text-right mt-4">
          <button className=" bg-primary px-8 py-3 rounded text-white hover:bg-primary_hover hover:cursor-pointer">
            Submit
          </button>
        </div>
      </form>
      {openForgotPasswordModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 flex justify-center items-center">
          <div className="bg-white relative p-8 min-w-[max(80%,20rem)] sm:min-w-[30rem] rounded-md">
            <h2 className="text-2xl text-dark_grey">Forgot Password</h2>
            <p
              onClick={() => setOpenForgotPasswordModal(false)}
              className="absolute cursor-pointer top-4 right-4"
            >
              {" "}
              <IoClose />{" "}
            </p>
            <form onSubmit={handleForgotPassword} className="mt-4">
              <div className="flex flex-col gap-1">
                <label className="mb-1" htmlFor="email">
                  Email
                </label>
                <input
                  onChange={(e) => setForgotLoginEmail(e.target.value)}
                  type="email"
                  className="border border-no_focus px-4 py-2 rounded-sm w-full focus:outline-none focus:border-dark_grey"
                  required
                  value={forgotLoginEmail}
                  placeholder="shadab@gmail.com"
                />
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  className="bg-primary w-full px-4 py-3 rounded mt-4 text-white hover:bg-primary_hover hover:cursor-pointer"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
