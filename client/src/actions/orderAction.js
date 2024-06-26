import { axiosInstance } from "../utility/axiosInstance";
import {
  ALL_ORDER_REQUEST,
  ALL_ORDER_SUCCESS,
  ALL_ORDER_FAIL,
  USER_ORDERS_REQUEST,
  USER_ORDERS_SUCCESS,
  USER_ORDERS_FAIL,
  ORDER_DETAIL_REQUEST,
  ORDER_DETAIL_SUCCESS,
  ORDER_DETAIL_FAIL,
  UPDATE_ORDER_DETAIL_REQUEST,
  UPDATE_ORDER_DETAIL_SUCCESS,
  UPDATE_ORDER_DETAIL_FAIL,
  UPDATE_ALL_ORDERS_REQUEST,
  UPDATE_ALL_ORDERS_SUCCESS,
  UPDATE_ALL_ORDERS_FAIL,
  CLEAR_ERRORS,
} from "../constants/orderConstants";
import { toast } from "react-toastify";

export const getAllOrder = () => async (dispatch) => {
  try {
    dispatch({ type: ALL_ORDER_REQUEST });
    const { data } = await axiosInstance.get("/order/orders");

    dispatch({
      type: ALL_ORDER_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: ALL_ORDER_FAIL,
      payload: error.response.data.message,
    });
    toast.error(error.response.data.message ? error.response.data.message : "Oops something went wrong");
  }
};

export const getUserOrders = (id) => async (dispatch) => {
  try {
    dispatch({ type: USER_ORDERS_REQUEST });

    const { data } = await axiosInstance.get(`/order/orders/user/${id}`);

    dispatch({
      type: USER_ORDERS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: USER_ORDERS_FAIL,
      payload: error.response.data.message,
    });
    toast.error(error.response.data.message ? error.response.data.message : "Oops something went wrong");
  }
};

export const getOrderDetail = (id) => async (dispatch) => {
  try {
    dispatch({ type: ORDER_DETAIL_REQUEST });

    const { data } = await axiosInstance.get(`/order/details/${id}`);

    dispatch({
      type: ORDER_DETAIL_SUCCESS,
      payload: data.order,
    });
  } catch (error) {
    dispatch({
      type: ORDER_DETAIL_FAIL,
      payload: error.response.data,
    });
    toast.error(error.response.data.message ? error.response.data.message : "Oops something went wrong");
  }
};

export const updateOrderDetail = (data) => async (dispatch) => {
  dispatch({ type: UPDATE_ORDER_DETAIL_REQUEST });

  dispatch({
    type: UPDATE_ORDER_DETAIL_SUCCESS,
    payload: data,
  });
};

export const updateAllOrders = (data) => async (dispatch) => {
  dispatch({
    type: UPDATE_ALL_ORDERS_SUCCESS,
    payload: data,
  });
};

export const clearErrors = () => async (dispatch) => {
  dispatch({
    type: CLEAR_ERRORS,
  });
};
