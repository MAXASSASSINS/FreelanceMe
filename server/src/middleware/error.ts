import ErrorHandler from "../utils/errorHandler";
import { Request, Response, NextFunction } from "express";

type CustomError = Error & {
  statusCode?: number;
  code?: number;
  keyValue?: any;
  path?: string;
}


export default (err:CustomError, req:Request, res:Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Wrong Mongodb id error
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  // Wrong JWT id error
  if (err.name === "JsonWebTokenError") {
    const message = `JWT is invalid, try again`;
    err = new ErrorHandler(message, 400);
  }

  //JWT expire error
  if (err.name === "TokenExpireError") {
    const message = `JWT is expired, try again`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode!).json({
    success: false,
    message: err.message,
  });
};
