import { toast } from "react-toastify";
import { AnyAction, Dispatch } from "redux";
import {
  ALL_GIG_FAIL,
  ALL_GIG_REQUEST,
  ALL_GIG_SUCCESS,
  CLEAR_ERRORS,
  GIG_DETAIL_FAIL,
  GIG_DETAIL_REQUEST,
  GIG_DETAIL_RESET,
  GIG_DETAIL_SUCCESS,
  UPDATE_ALL_GIGS_SUCCESS,
  USER_GIGS_FAIL,
  USER_GIGS_REQUEST,
  USER_GIGS_SUCCESS,
} from "../constants/gigConstants";
import { IGig } from "../types/gig.types";
import { axiosInstance } from "../utility/axiosInstance";

export const getAllGig =
  (keywords?: string, category?: string) =>
  async (dispatch: Dispatch<AnyAction>) => {
    try {
      dispatch({ type: ALL_GIG_REQUEST });
      let payload = {};
      if (keywords) {
        const { data } = await axiosInstance.get(
          `/gig/gigs?keywords=${keywords}`
        );
        payload = data.gigs;
      } else if (category) {
        const { data } = await axiosInstance.get(
          `/gig/gigs?category=${category}`
        );
        payload = data.gigs;
      } else {
        const { data } = await axiosInstance.get(`/gig/gigs`);
        payload = data.gigs;
      }
      dispatch({
        type: ALL_GIG_SUCCESS,
        payload,
      });
    } catch (error: any) {
      dispatch({
        type: ALL_GIG_FAIL,
        payload: error.response.data,
      });
      toast.error(
        error.response.data.message
          ? error.response.data.message
          : "Oops something went wrong"
      );
    }
  };

export const getUserGigs =
  (id: string) => async (dispatch: Dispatch<AnyAction>) => {
    try {
      dispatch({ type: USER_GIGS_REQUEST });

      const { data } = await axiosInstance.get(`/gig/gigs/user/${id}`);
      // const data = await fetchedData.json();

      dispatch({
        type: USER_GIGS_SUCCESS,
        payload: data,
      });
    } catch (error: any) {
      dispatch({
        type: USER_GIGS_FAIL,
        payload: error.response.data.message,
      });
      toast.error(
        error.response.data.message
          ? error.response.data.message
          : "Oops something went wrong"
      );
    }
  };

export const getGigDetail =
  (id: string) => async (dispatch: Dispatch<AnyAction>) => {
    if (id === "null") return;
    try {
      dispatch({ type: GIG_DETAIL_REQUEST });

      const { data } = await axiosInstance.get(`/gig/details/${id}`);

      dispatch({
        type: GIG_DETAIL_SUCCESS,
        payload: data,
      });
    } catch (error: any) {
      dispatch({
        type: GIG_DETAIL_FAIL,
        payload: error.response.data.message,
      });
      toast.error(
        error.response.data.message
          ? error.response.data.message
          : "Oops something went wrong"
      );
    }
  };

export const getFavoriteGigs = () => async (dispatch: Dispatch<AnyAction>) => {
  try {
    dispatch({ type: ALL_GIG_REQUEST });
    const { data } = await axiosInstance.get("/gig/favourite");
    dispatch({
      type: ALL_GIG_SUCCESS,
      payload: data.favouriteGigs,
    });
  } catch (error: any) {
    dispatch({
      type: ALL_GIG_FAIL,
      payload: error.response,
    });
    toast.error(
      error.response.data.message
        ? error.response.data.message
        : "Oops something went wrong"
    );
  }
};

export const updateAllGigs =
  (data: IGig[]) => async (dispatch: Dispatch<AnyAction>) => {
    dispatch({
      type: UPDATE_ALL_GIGS_SUCCESS,
      payload: data,
    });
  };

export const clearErrors = () => async (dispatch: Dispatch<AnyAction>) => {
  dispatch({
    type: CLEAR_ERRORS,
  });
};

export const updateGigDetail =
  (data: IGig) => async (dispatch: Dispatch<AnyAction>) => {
    dispatch({
      type: GIG_DETAIL_SUCCESS,
      payload: data,
    });
  };

export const resetGigDetail = () => async (dispatch: Dispatch<AnyAction>) => {
  dispatch({
    type: GIG_DETAIL_RESET,
  });
};
