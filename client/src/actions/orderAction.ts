import { toast } from "react-toastify";
import { AnyAction, Dispatch } from "redux";
import {
  ALL_ORDER_FAIL,
  ALL_ORDER_REQUEST,
  ALL_ORDER_SUCCESS,
  CLEAR_ERRORS,
  ORDER_DETAIL_FAIL,
  ORDER_DETAIL_REQUEST,
  ORDER_DETAIL_SUCCESS,
  UPDATE_ALL_ORDERS_SUCCESS,
  UPDATE_ORDER_DETAIL_REQUEST,
  UPDATE_ORDER_DETAIL_SUCCESS,
  USER_ORDERS_FAIL,
  USER_ORDERS_REQUEST,
  USER_ORDERS_SUCCESS
} from "../constants/orderConstants";
import { IOrder } from "../types/order.types";
import { axiosInstance } from "../utility/axiosInstance";

export const getAllOrder = () => async (dispatch: Dispatch<AnyAction>) => {
  try {
    dispatch({ type: ALL_ORDER_REQUEST });
    const { data } = await axiosInstance.get("/order/orders");

    dispatch({
      type: ALL_ORDER_SUCCESS,
      payload: data,
    });
  } catch (error: any) {
    dispatch({
      type: ALL_ORDER_FAIL,
      payload: error.response.data.message,
    });
    toast.error(error.response.data.message ? error.response.data.message : "Oops something went wrong");
  }
};

export const getUserOrders = (id: string) => async (dispatch: Dispatch<AnyAction>) => {
  try {
    dispatch({ type: USER_ORDERS_REQUEST });

    const { data } = await axiosInstance.get(`/order/orders/user/${id}`);

    dispatch({
      type: USER_ORDERS_SUCCESS,
      payload: data,
    });
  } catch (error: any) {
    dispatch({
      type: USER_ORDERS_FAIL,
      payload: error.response.data.message,
    });
    toast.error(error.response.data.message ? error.response.data.message : "Oops something went wrong");
  }
};

export const getOrderDetail = (id: string) => async (dispatch: Dispatch<AnyAction>) => {
  try {
    dispatch({ type: ORDER_DETAIL_REQUEST });

    const { data } = await axiosInstance.get(`/order/details/${id}`);

    dispatch({
      type: ORDER_DETAIL_SUCCESS,
      payload: data.order,
    });
  } catch (error: any) {
    dispatch({
      type: ORDER_DETAIL_FAIL,
      payload: error.response.data,
    });
    toast.error(error.response.data.message ? error.response.data.message : "Oops something went wrong");
  }
};

export const updateOrderDetail = (data: IOrder) => async (dispatch: Dispatch<AnyAction>) => {
  dispatch({ type: UPDATE_ORDER_DETAIL_REQUEST });

  dispatch({
    type: UPDATE_ORDER_DETAIL_SUCCESS,
    payload: data,
  });
};

export const updateAllOrders = (data: IOrder[]) => async (dispatch: Dispatch<AnyAction>) => {
  dispatch({
    type: UPDATE_ALL_ORDERS_SUCCESS,
    payload: data,
  });
};

export const clearErrors = () => async (dispatch: Dispatch<AnyAction>) => {
  dispatch({
    type: CLEAR_ERRORS,
  });
};
