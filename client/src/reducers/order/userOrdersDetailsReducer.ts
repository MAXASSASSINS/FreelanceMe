import {
  CLEAR_ERRORS,
  USER_ORDERS_FAIL,
  USER_ORDERS_REQUEST,
  USER_ORDERS_SUCCESS,
} from "../../constants/orderConstants";
import { IOrder } from "../../types/order.types";

type Action = {
  type: string;
  payload: any;
};

export type UserOrdersDetailsReducerState = {
  userOrders: IOrder[] | null;
  orderLoading: boolean;
  orderError: string | null;
};

export const userOrdersDetailsInitialState: UserOrdersDetailsReducerState = {
  userOrders: [],
  orderLoading: false,
  orderError: null,
};

export const userOrdersDetailsReducer = (
  state = userOrdersDetailsInitialState,
  action: Action
): UserOrdersDetailsReducerState => {
  switch (action.type) {
    case USER_ORDERS_REQUEST:
      return {
        orderLoading: true,
        userOrders: null,
        orderError: null,
      };
    case USER_ORDERS_SUCCESS:
      return {
        orderLoading: false,
        userOrders: action.payload.userOrders,
        orderError: null,
      };
    case USER_ORDERS_FAIL:
      return {
        orderLoading: false,
        orderError: action.payload,
        userOrders: null,
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
