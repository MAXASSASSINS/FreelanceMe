import { Dispatch } from "redux";
import {
  SHOW_DIM_BACKGROUND,
  HIDE_DIM_BACKGROUND,
} from "../constants/dimBackgroundConstants";
import { DimBackgroundAction } from "../types/dimBackgroundAction.types";

export const showDimBackground = () => (dispatch: Dispatch<DimBackgroundAction>) => {
  try {
    dispatch({ type: SHOW_DIM_BACKGROUND });
  } catch (error) {
    console.log(error);
  }
};
export const hideDimBackground = () => (dispatch: Dispatch<DimBackgroundAction>) => {
  try {
    dispatch({ type: HIDE_DIM_BACKGROUND });
  } catch (error) {
    console.log(error);
  }
};
