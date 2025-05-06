import {
  CLEAR_ERRORS,
  ORDER_DETAIL_FAIL,
  ORDER_DETAIL_REQUEST,
  ORDER_DETAIL_SUCCESS,
  UPDATE_ORDER_DETAIL_REQUEST,
  UPDATE_ORDER_DETAIL_SUCCESS
} from "../../constants/orderConstants";
import { IOrder } from "../../types/order.types";


type Action = {
  type: string;
  payload: any;
};

export type OrderDetailReducerState = {
  orderDetail: IOrder | null;
  orderLoading: boolean;
  orderError: string | null;
};

export const orderDetailInitialState: OrderDetailReducerState = {
  orderDetail: null,
  orderLoading: false,
  orderError: null,
};



export const orderDetailReducer = (state = orderDetailInitialState, action: Action): OrderDetailReducerState => {
  switch (action.type) {
    case ORDER_DETAIL_REQUEST:
      return {
        orderError: null,
        orderLoading: true,
        orderDetail: null,
      };
    case ORDER_DETAIL_SUCCESS:
      return {
        orderError: null,
        orderLoading: false,
        orderDetail: action.payload,
      };
    case ORDER_DETAIL_FAIL:
      return {
        ...state,
        orderLoading: false,
        orderError: action.payload,
      };
    case UPDATE_ORDER_DETAIL_REQUEST:
      return {
        ...state,
        orderLoading: true,
      };
    case UPDATE_ORDER_DETAIL_SUCCESS:
      return {
        ...state,
        orderLoading: false,
        orderDetail: action.payload,
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
