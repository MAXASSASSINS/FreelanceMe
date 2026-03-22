import {
  CLEAR_ERRORS,
  GIG_DETAIL_FAIL,
  GIG_DETAIL_REQUEST,
  GIG_DETAIL_RESET,
  GIG_DETAIL_SUCCESS,
  UPDATE_GIG_DETAIL_SUCCESS,
} from "../../constants/gigConstants";
import { IGig } from "../../types/gig.types";

type Action = {
  type: string;
  payload: any;
};

export type GigDetailReducerState = {
  gigDetail: IGig | null;
  gigLoading: boolean;
  gigError?: string | null;
};

export const gigDetailInitialState: GigDetailReducerState = {
  gigDetail: null,
  gigLoading: false,
};

export const gigDetailReducer = (
  state = gigDetailInitialState,
  action: Action
): GigDetailReducerState => {
  switch (action.type) {
    case GIG_DETAIL_REQUEST:
      return {
        gigLoading: true,
        gigDetail: null,
      };
    case GIG_DETAIL_SUCCESS:
      return {
        gigLoading: false,
        gigDetail: action.payload.gig,
      };
    case GIG_DETAIL_FAIL:
      return {
        ...state,
        gigLoading: false,
        gigError: action.payload,
      };
    case UPDATE_GIG_DETAIL_SUCCESS:
      return {
        ...state,
        gigDetail: action.payload,
      };
    case CLEAR_ERRORS:
      return {
        ...state,
        gigError: null,
      };
    case GIG_DETAIL_RESET:
      return {
        ...state,
        gigDetail: null,
        gigLoading: false,
        gigError: null,
      };
    default:
      return state;
  }
};
