export const FREE_TEXT = "free text";
export const MULTIPLE_CHOICE = "multiple choice";
export type QuestionType = typeof FREE_TEXT | typeof MULTIPLE_CHOICE;

export const CHOOSE_A_DELIVERY_TIME = "Choose a delivery time";
export const SELECT_NUMBER_OF_REVISIONS = "Select no. of revisions";

export const SELECT_A_CATEGORY = "Select a category";
export const SELECT_A_SUB_CATEGORY = "Select a sub-category";

export const KB = 1024;
export const MB = 1024 * 1024;
export const GB = 1024 * 1024 * 1024;

export const SELECT_LANGUAGE = "Select language";
export const SELECT_FLUENCY_LEVEL = "Select fluency level";
export const SELECT_COUNTRY = "Select country";
export const YEAR_OF_GRADUATION = "Year of graduation";
export const YEAR_OF_CERTIFICATION = "Year";
export const SELECT_SKILL_LEVEL = "Experience level";

export const YEARS_LIST: string[] = [];
for (let i = new Date().getFullYear(); i >= 1960; i--) {
  YEARS_LIST.push(i.toString());
}

export const PENDING = "Pending";
export const IN_PROGRESS = "In Progress"
export const COMPLETED = "Completed"
export const CANCELLED = "Cancelled"
export const DELIVERED = "Delivered"
export const IN_REVISION = "In Revision"