import {
  LOGIN_USER_FAIL,
  LOGIN_USER_REQUEST,
  LOGIN_USER_SUCCESS
} from "../../constants/userConstants";
import { IUser } from "../../types/user.types";

type Action = {
  type: string;
  payload: any;
}

export type LoginUserReducerState = {
  isAuthenticated: boolean;
  userLoading: boolean;
  user: IUser | null;
  userError: string | null;
}

export const loginUserInitialState: LoginUserReducerState = {
  isAuthenticated: false,
  userLoading: false,
  user: null,
  userError: null,
};

export const loginUserReducer = (state = loginUserInitialState, action: Action): LoginUserReducerState => {
  switch (action.type) {
    case LOGIN_USER_REQUEST:
      return {
        user: null,
        userLoading: true,
        isAuthenticated: false,
        userError: null,
      };
    case LOGIN_USER_SUCCESS:
      return {
        user: action.payload,
        userLoading: false,
        isAuthenticated: true,
        userError: null,
      };
    case LOGIN_USER_FAIL:
      return {
        userLoading: false,
        isAuthenticated: false,
        user: null,
        userError: action.payload,
      };
    default:
      return state;
  }
};