import {
  LOAD_USER_FAIL,
  LOAD_USER_REQUEST,
  LOAD_USER_SUCCESS,
  LOGOUT_USER_FAIL,
  LOGOUT_USER_REQUEST,
  LOGOUT_USER_SUCCESS,
  SIGNUP_USER_FAIL,
  SIGNUP_USER_REQUEST,
  SIGNUP_USER_SUCCESS,
  UPDATE_USER_SUCCESS,
  USER_FAIL,
  USER_REQUEST,
  USER_SUCCESS
} from "../../constants/userConstants";
import { IUser } from "../../types/user.types";

type Action = {
  type: string;
  payload: any;
}

export type UserReducerState = {
  user: IUser | null;
  userLoading: boolean;
  isAuthenticated: boolean;
  userError: string | null;
}

export const userInitialState: UserReducerState = {
  user: null,
  userLoading: false,
  isAuthenticated: false,
  userError: null,
}

export const userReducer = (state = userInitialState, action: Action): UserReducerState => {
  switch (action.type) {
    case USER_REQUEST:
    case LOAD_USER_REQUEST:
    case SIGNUP_USER_REQUEST:
      return {
        userLoading: true,
        isAuthenticated: false,
        user: null,
        userError: null,
      };
    case USER_SUCCESS:
    case LOAD_USER_SUCCESS:
      return {
        ...state,
        userLoading: false,
        isAuthenticated: true,
        user: action.payload,
      };
    case SIGNUP_USER_SUCCESS:
      return {
        ...state, 
        userLoading: false,
        isAuthenticated: false,
        user: null,
      }
    case USER_FAIL:
    case SIGNUP_USER_FAIL:
      return {
        ...state,
        userLoading: false,
        isAuthenticated: false,
        user: null,
        userError: action.payload,
      };

    case LOAD_USER_FAIL:
      return {
        userLoading: false,
        isAuthenticated: false,
        user: null,
        userError: action.payload,
      };

    case LOGOUT_USER_REQUEST:
      return {
        ...state,
        userLoading: true,
      };

    case LOGOUT_USER_SUCCESS:
      return {
        userLoading: false,
        isAuthenticated: false,
        user: null,
        userError: null,
      };

    case LOGOUT_USER_FAIL:
      return {
        ...state,
        userLoading: false,
        userError: action.payload,
      };
    case UPDATE_USER_SUCCESS: 
      return {
        ...state,
        user: action.payload,
      }
    default: {
      return state;
    }
  }
};
