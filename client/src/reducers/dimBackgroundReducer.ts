import {
  SHOW_DIM_BACKGROUND,
  HIDE_DIM_BACKGROUND,
} from "../constants/dimBackgroundConstants";
import { DimBackgroundAction } from "../types/dimBackgroundAction.types";

export type DimBackgroundReducerState = boolean;

export const dimBackgroundInitialState: DimBackgroundReducerState = false;

export const dimBackgroundReducer = (state = dimBackgroundInitialState, action: DimBackgroundAction) => {
  switch (action.type) {
    case SHOW_DIM_BACKGROUND:
      state = true;
      return true;
    case HIDE_DIM_BACKGROUND:
      state = false;
      return false;
    default:
      return state;
  }
};
