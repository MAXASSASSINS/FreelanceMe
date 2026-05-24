import {
  CLEAR_ERRORS,
  USER_GIGS_FAIL,
  USER_GIGS_REQUEST,
  USER_GIGS_SUCCESS
} from "../../constants/gigConstants";
import { IGig } from "../../types/gig.types";

type Action = {
  type: string;
  payload: any;
}

export type UserGigsReducerState = {
  userGigs: IGig[] | null;
  gigLoading: boolean;
  gigError?: string | null;
  gigsCount?: number;
}

export const userGigsInitialState: UserGigsReducerState = {
  userGigs: null,
  gigLoading: false,
};

export const userGigsDetailsReducer = (state = userGigsInitialState, action: Action): UserGigsReducerState => {
  switch (action.type) {
    case USER_GIGS_REQUEST:
      return {
        gigLoading: true,
        userGigs: null,
      };
    case USER_GIGS_SUCCESS:
      return {
        gigLoading: false,
        userGigs: action.payload.userGigs,
      };
    case USER_GIGS_FAIL:
      return {
        ...state,
        gigLoading: false,
        gigError: action.payload,
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