import { IFile } from "./file.types";
import { IGig } from "./gig.types";

export interface IPhone {
  code?: string;
  number?: string;
}

export interface ILanguage {
  name: string;
  level: "basic" | "conversational" | "fluent" | "native/bilingual";
}

export interface IReview {
  user: IUserLite;
  name: string;
  avatar?: IFile;
  country: string;
  rating: number;
  comment: string;
  createdAt?: Date;
}

export interface ISkill {
  name: string;
  level: "beginner" | "intermediate" | "advance" | "expert";
}

export interface IEducation {
  country: string;
  collegeName: string;
  degree: string;
  major: string;
  yearOfGraduation: string;
}

export interface ICertificate {
  name: string;
  certifiedFrom: string;
  year: string;
}

export interface IRazorPayAccountDetails {
  accountId: string;
  stakeholderId: string;
  productId: string;
  status:
    | "new"
    | "pending"
    | "activated"
    | "under_review"
    | "needs_clarification"
    | "suspended";
  accountHolderName: string;
}

export interface IUserLite {
  _id: string;
  name: string;
  email: string;
  avatar: IFile;
  isOnline: boolean;
}

export interface IUser extends IUserLite {
  password: string;
  phone?: IPhone;
  ratings: number;
  numOfRatings: number;
  numOfReviews: number;
  reviews: IReview[];
  country: string;
  role: "user" | "admin";
  tagline?: string;
  description?: string;
  languages: ILanguage[];
  skills: ISkill[];
  education: IEducation[];
  certificates: ICertificate[];
  userSince: Date;
  lastSeen: Date;
  balance: number;
  withdrawEligibility: boolean;
  razorPayAccountDetails: IRazorPayAccountDetails;
  lastDelivery?: Date;
  favouriteGigs: (IGig | string)[];
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  emailVerificationToken?: string;
  emailVerificationExpire?: Date;
  isEmailVerified: boolean;
}