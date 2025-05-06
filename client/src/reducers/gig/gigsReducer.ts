import {
  ALL_GIG_FAIL,
  ALL_GIG_REQUEST,
  ALL_GIG_SUCCESS,
  CLEAR_ERRORS,
  UPDATE_ALL_GIGS_FAIL,
  UPDATE_ALL_GIGS_REQUEST,
  UPDATE_ALL_GIGS_SUCCESS
} from "../../constants/gigConstants";
import { IGig } from "../../types/gig.types";

export type GigsReducerState = {
  gigs: IGig[] | null;
  gigLoading: boolean;
  gigError?: string | null;
  gigsCount?: number;
}

type Action = {
  type: string;
  payload: any;
}

export const gigsInitialState: GigsReducerState = {
  gigs: null,
  gigLoading: false,
};

export const gigsReducer = (state = gigsInitialState, action: Action): GigsReducerState => {
  switch (action.type) {
    case ALL_GIG_REQUEST:
    case UPDATE_ALL_GIGS_REQUEST:
      return {
        gigLoading: true,
        gigs: null,
      };
    case ALL_GIG_SUCCESS:
      return {
        gigLoading: false,
        gigs: action.payload,
        gigsCount: action.payload.gigsCount,
      };
    case ALL_GIG_FAIL:
    case UPDATE_ALL_GIGS_FAIL:
      return {
        ...state,
        gigLoading: false,
        gigError: action.payload,
      };

    case UPDATE_ALL_GIGS_SUCCESS:
      return {
        ...state,
        gigLoading: false,
        gigs: action.payload,
      };
    case CLEAR_ERRORS:
      return {
        ...state,
        gigError: null,
      };
    default:
      return state;
  }
};