import { toast } from "react-toastify";
import {
  GIG_USER_FAIL,
  GIG_USER_REQUEST,
  GIG_USER_SUCCESS,
  LOAD_USER_FAIL,
  LOAD_USER_REQUEST,
  LOAD_USER_SUCCESS,
  LOGOUT_USER_FAIL,
  LOGOUT_USER_REQUEST,
  LOGOUT_USER_SUCCESS,
  SIGNUP_USER_FAIL,
  SIGNUP_USER_REQUEST,
  SIGNUP_USER_SUCCESS,
  UPDATE_USER_SUCCESS,
  USER_FAIL,
  USER_REQUEST,
  USER_SUCCESS,
} from "../constants/userConstants";
import { axiosInstance } from "../utility/axiosInstance";
import { Dispatch, AnyAction } from "redux";
import { IUser } from "../types/user.types";
import { AppDispatch } from "../store";

export const getUser =
  (id: string) => async (dispatch: Dispatch<AnyAction>) => {
    try {
      dispatch({ type: USER_REQUEST });
      const { data } = await axiosInstance.get(`/user/${id}`);
      // const data = await user.json();

      dispatch({
        type: USER_SUCCESS,
        payload: data,
      });
    } catch (error: any) {
      dispatch({
        type: USER_FAIL,
        payload: error.response.data.message,
      });
      toast.error(
        error.response.data.message
          ? error.response.data.message
          : "Oops something went wrong"
      );
    }
  };

export const getGigUser =
  (id: string) => async (dispatch: Dispatch<AnyAction>) => {
    try {
      dispatch({ type: GIG_USER_REQUEST });
      const { data } = await axiosInstance.get(`/user/${id}`);
      // const data = await user.json();

      dispatch({
        type: GIG_USER_SUCCESS,
        payload: data.user,
      });
    } catch (error: any) {
      dispatch({
        type: GIG_USER_FAIL,
        payload: error.response.data.message,
      });
      toast.error(
        error.response.data.message
          ? error.response.data.message
          : "Oops something went wrong"
      );
    }
  };

export const loggedUser =
  (email: string, password: string) =>
  async (dispatch: Dispatch<AnyAction>) => {
    try {
      dispatch({ type: USER_REQUEST });

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const { data } = await axiosInstance.post(
        "/login",
        { email, password },
        config
      );

      dispatch({
        type: USER_SUCCESS,
        payload: data.user,
      });
    } catch (error: any) {
      dispatch({
        type: USER_FAIL,
        payload: error.response.data,
      });

      toast.error(
        error.response?.data?.message
          ? error.response.data.message
          : "An error occurred while logging in. Please try again later."
      );
    }
  };

export const signUpUser = (
  name: string,
  email: string,
  password: string,
  confirmPassword: string
) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch({ type: SIGNUP_USER_REQUEST });
      const { data } = await axiosInstance.post("/register", {
        name,
        email,
        password,
        confirmPassword,
      });

      dispatch({
        type: SIGNUP_USER_SUCCESS,
      });
      toast.success(data.message);
    } catch (error: any) {
      dispatch({
        type: SIGNUP_USER_FAIL,
        payload: error.response.data.message,
      });
      toast.error(
        error.response.data.message
          ? error.response.data.message
          : "Oops something went wrong"
      );
      throw error;
    }
  };
};

export const loadUser = () => async (dispatch: Dispatch<AnyAction>) => {
  try {
    let user = JSON.parse(localStorage.getItem("user") || "{}");
    if (document.cookie.includes("token") && user && user._id) {
    } else {
      dispatch({ type: LOAD_USER_REQUEST });
      const { data } = await axiosInstance.get("/me");
      user = data.user;
    }
    localStorage.setItem("user", JSON.stringify(user));
    dispatch({
      type: LOAD_USER_SUCCESS,
      payload: user,
    });
  } catch (error: any) {
    dispatch({
      type: LOAD_USER_FAIL,
      payload: error,
    });
  }
};

export const logoutUser = () => async (dispatch: Dispatch<AnyAction>) => {
  try {
    dispatch({ type: LOGOUT_USER_REQUEST });

    const { data } = await axiosInstance.get("/logout");

    dispatch({
      type: LOGOUT_USER_SUCCESS,
      payload: data.success,
    });
    localStorage.removeItem("user");
  } catch (error: any) {
    dispatch({
      type: LOGOUT_USER_FAIL,
      payload: error.response.data,
    });
    toast.error(
      error.response.data.message
        ? error.response.data.message
        : "Oops something went wrong"
    );
  }
};

export const updateUser =
  (user: IUser) => async (dispatch: Dispatch<AnyAction>) => {
    localStorage.setItem("user", JSON.stringify(user));
    dispatch({
      type: UPDATE_USER_SUCCESS,
      payload: user,
    });
  };
