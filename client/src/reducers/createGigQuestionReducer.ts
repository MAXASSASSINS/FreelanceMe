import {
  ADD_NEW_QUESTION,
  HIDE_ALL_EDIT_QUESTION,
  REMOVE_QUESTION,
  RESET_ALL,
  UPDATE_QUESTION,
  UPDATE_SHOW_EDIT_QUESTION
} from "../constants/createGigQuestionConstants";

type Action = {
  type: string;
  payload?: any;
};

export type QuestionState = {
  question: string;
  type: string;
  multipleOptionSelectionStatus: boolean;
  options: string[];
  requiredStatus: boolean;
  showEditQuestion: boolean;
};

export const QUESTION_DETAILS_INITIAL_STATE: QuestionState[] = [];

export const createGigQuestionReducer = (state = QUESTION_DETAILS_INITIAL_STATE, action: Action) => {
  switch (action.type) {
    case UPDATE_QUESTION: {
      const {
        questionIndex,
        type,
        multipleOptionSelectionStatus,
        question,
        options,
        requiredStatus,
      } = action.payload;

      const updatedQuestion = {
        question,
        type,
        multipleOptionSelectionStatus,
        options,
        requiredStatus,
        showEditQuestion: false,
      };

      const newState = [...state];
      newState[questionIndex] = updatedQuestion;
      return newState;
    }

    case UPDATE_SHOW_EDIT_QUESTION: {
      console.log('UPDATE_SHOW_EDIT_QUESTION');
      
      const { questionIndex, showEditQuestion } = action.payload;
      let newState = [...state];
      newState = newState.map((question, index) => {
        if (index === questionIndex) {
          return {
            ...question,
            showEditQuestion: showEditQuestion ? false : true,
          };
        }
        return {
          ...question,
          showEditQuestion: false,
        };
      });
      return newState;
    }

    case ADD_NEW_QUESTION: {
      const {
        type,
        multipleOptionSelectionStatus,
        question,
        options,
        requiredStatus,
      } = action.payload;

      const newQuestion = {
        type,
        multipleOptionSelectionStatus,
        question,
        options,
        requiredStatus,
        showEditQuestion: false,
      };

      const newState = [...state, newQuestion];
      // 
      return newState;
    }

    case REMOVE_QUESTION: {
      const { questionIndex } = action.payload;
      const newState = [...state];
      newState.splice(questionIndex, 1);
      return newState;
    }

    case HIDE_ALL_EDIT_QUESTION: {
      console.log('HIDE_ALL_EDIT_QUESTION');
      
      const newState = [...state];
      newState.map((question) => {
        question.showEditQuestion = false;
        return question;
      });
      return newState;
    }

    case RESET_ALL: {
      return QUESTION_DETAILS_INITIAL_STATE;
    }

    default:
      return state;
  }
};
