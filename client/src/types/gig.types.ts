import { QuestionType } from "./../constants/globalConstants";
import { IFile } from "./file.types";
import { IUser, IUserLite } from "./user.types";

export interface IReview {
  user: IUserLite;
  name: string;
  avatar: IFile,
  country: string;
  rating: number;
  comment: string;
  createdAt?: Date;
}

export interface IPricing {
  packageTitle: string;
  packageDescription: string;
  packageDeliveryTime: string;
  revisions: number;
  sourceFile: boolean;
  commercialUse: boolean;
  packagePrice: number;
}

export interface IGigRequirement {
  questionTitle: string;
  questionType: QuestionType;
  answerRequired: boolean;
  multipleOptionSelect: boolean;
  options: string[];
}

export interface IGig {
  _id: string;
  title?: string;
  category?: string;
  subCategory?: string;
  searchTags: string[];
  pricing: IPricing[];
  description?: string;
  images: IFile[];
  video?: IFile;
  ratings: number;
  numOfRatings: number;
  numOfReviews: number;
  reviews: IReview[];
  createdAt?: Date;
  user: IUserLite | IUser;
  active?: boolean;
  requirements: IGigRequirement[];
}
