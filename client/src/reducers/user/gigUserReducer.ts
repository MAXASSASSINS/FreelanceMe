import {
  GIG_USER_FAIL,
  GIG_USER_REQUEST,
  GIG_USER_SUCCESS,
} from "../../constants/userConstants";
import { IUser } from "../../types/user.types";

type Action = {
  type: string;
  payload: any;
};

export type GigUserReducerState = {
  user: IUser | null;
  userLoading: boolean;
  userError?: string | null;
};

export const gigUserInitialState: GigUserReducerState = {
  user: null,
  userLoading: false,
};

export const gigUserReducer = (
  state = gigUserInitialState,
  action: Action
): GigUserReducerState => {
  switch (action.type) {
    case GIG_USER_REQUEST:
      return {
        userLoading: true,
        user: null,
      };
    case GIG_USER_SUCCESS:
      return {
        ...state,
        userLoading: false,
        user: action.payload,
      };
    case GIG_USER_FAIL:
      return {
        userLoading: false,
        userError: action.payload,
        user: null,
      };
    default:
      return state;
  }
};
