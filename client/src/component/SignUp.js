import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signUpUser } from "../actions/userAction";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

export const SignUp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpUsername, setSignUpUsername] = useState("");

  const { user, userLoading, isAuthenticated } = useSelector(
    (state) => state.user
  );

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (!signUpEmail || !signUpPassword || !signUpUsername) {
      toast.error("Please fill all the fields");
      return;
    }
    dispatch(signUpUser(signUpUsername, signUpEmail, signUpPassword));
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate(-1);
    }
  }, [dispatch, isAuthenticated]);

  return (
    <div className="p-8 mt-20 md:mt-[10vh] col-md-4 offset-md-4">
      <div className="text-center">
        <h2 className="text-5xl">Welcome</h2>
      </div>
      <form className="mt-8 flex flex-col gap-4" onSubmit={handleSignUpSubmit}>
        <div className="form-group">
          <label className="mb-2" for="email">
            Username
          </label>
          <input
            onChange={(e) => setSignUpUsername(e.target.value)}
            id="username"
            type="text"
            class="form-control"
          />
        </div>
        <div className="form-group">
          <label className="mb-2" for="email">
            Email
          </label>
          <input
            onChange={(e) => setSignUpEmail(e.target.value)}
            id="email"
            type="email"
            class="form-control"
          />
        </div>
        <div className="form-group">
          <label className="mb-2" for="password">
            Password
          </label>
          <input
            onChange={(e) => setSignUpPassword(e.target.value)}
            id="password"
            type="password"
            class="form-control"
          />
        </div>
        <p className="text-light_heading">
          Already have an account?{" "}
          <Link
            className="underline text-primary hover:cursor-pointer"
            to={"/login"}
          >
            Sign In
          </Link>
        </p>
        <div className="form-group">
          <button className="btn bg-primary text-white hover:bg-primary_hover hover:cursor-pointer">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};