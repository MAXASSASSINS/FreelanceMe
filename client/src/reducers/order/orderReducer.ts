import {
  ALL_ORDER_FAIL,
  ALL_ORDER_REQUEST,
  ALL_ORDER_SUCCESS,
  CLEAR_ERRORS,
  UPDATE_ALL_ORDERS_FAIL,
  UPDATE_ALL_ORDERS_REQUEST,
  UPDATE_ALL_ORDERS_SUCCESS
} from "../../constants/orderConstants";
import { IOrder } from "../../types/order.types";

type Action = {
  type: string;
  payload: any;
}

export type AllOrdersReducerState = { 
  orders: IOrder[] | null;
  orderLoading: boolean;
  orderError: string | null;
  ordersCount: number | null;
}

export const allOrdersInitialState: AllOrdersReducerState = {
  orders: null,
  orderLoading: false,
  orderError: null,
  ordersCount: null,
}

export const allOrdersReducer = (state = allOrdersInitialState, action: Action): AllOrdersReducerState => {
  switch (action.type) {
    case ALL_ORDER_REQUEST:
    case UPDATE_ALL_ORDERS_REQUEST:
      return {
        orderLoading: true,
        orders: null,
        orderError: null,
        ordersCount: null,
      };
    case ALL_ORDER_SUCCESS:
      return {
        orderLoading: false,
        orders: action.payload.orders,
        ordersCount: action.payload.ordersCount,
        orderError: null,
      };
    case ALL_ORDER_FAIL:
    case UPDATE_ALL_ORDERS_FAIL:
      return {
        orderLoading: false,
        orderError: action.payload,
        orders: null,
        ordersCount: null,
      };

    case UPDATE_ALL_ORDERS_SUCCESS:
      return {
        ...state,
        orderLoading: false,
        orders: action.payload,
      };
    case CLEAR_ERRORS:
      return {
        ...state,
        orderError: null,
      };
    default:
      return state;
  }
};