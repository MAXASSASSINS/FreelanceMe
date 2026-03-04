import {
  ALL_GIG_FAIL,
  ALL_GIG_REQUEST,
  ALL_GIG_SUCCESS,
  CLEAR_ERRORS,
  UPDATE_ALL_GIGS_FAIL,
  UPDATE_ALL_GIGS_REQUEST,
  UPDATE_ALL_GIGS_SUCCESS,
  UPDATE_GIG_USERS_ONLINE_STATUS,
} from "../../constants/gigConstants";
import { IGig } from "../../types/gig.types";
import { ONLINE_STATUS } from "../../types/miscellaneous.types";

export type GigsReducerState = {
  gigs: IGig[];
  gigLoading: boolean;
  gigError?: string | null;
  gigsCount?: number;
};

type Action = {
  type: string;
  payload: any;
};

export const gigsInitialState: GigsReducerState = {
  gigs: [],
  gigLoading: false,
};

export const gigsReducer = (
  state = gigsInitialState,
  action: Action
): GigsReducerState => {
  switch (action.type) {
    case ALL_GIG_REQUEST:
    case UPDATE_ALL_GIGS_REQUEST:
      return {
        gigLoading: true,
        gigs: [],
      };
    case ALL_GIG_SUCCESS:
      return {
        gigLoading: false,
        gigs: action.payload.map((gig: IGig) => ({
          ...gig,
          user: {
            ...gig.user, 
            isOnline: false
          }
        })),
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
    case UPDATE_GIG_USERS_ONLINE_STATUS: {
      const onlineMap = new Map<String, boolean>(
        action.payload.map((o: ONLINE_STATUS) => [o.userId, o.isOnline])
      );

      return {
        ...state,
        gigs: state.gigs.map((gig) => {
          const userId = gig.user._id;
          const isOnline = onlineMap.get(userId);

          // user not part of this update → keep existing value
          if (isOnline === undefined) {
            return gig;
          }

          return {
            ...gig,
            user: {
              ...gig.user,
              isOnline: isOnline,
            },
          };
        }),
      };
    }
    case CLEAR_ERRORS:
      return {
        ...state,
        gigError: null,
      };
    default:
      return state;
  }
};
