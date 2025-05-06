import { IUser } from "./user.types";
import * as express from "express";

declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

export {}