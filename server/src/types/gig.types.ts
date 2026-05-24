import { Document, PopulatedDoc, Schema } from 'mongoose';
import { IUser } from './user.types';
import { QuestionType } from '../constants/globalConstants';
import { IFile } from './file.types';

export interface IReview {
  user: PopulatedDoc<IUser & Document>;
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

export interface IGig extends Document {
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
  user: PopulatedDoc<IUser & Document>;
  active?: boolean;
  requirements: IGigRequirement[];
}
