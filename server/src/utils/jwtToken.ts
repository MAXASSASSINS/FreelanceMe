import { IUser } from "../types/user.types";
import { CookieOptions, Response } from "express";

// Creating token and saving in cookie
const sendToken = (user: IUser, statusCode: number, res: Response) => {
  const token = user.getJWTToken();

  const cookie_expire: number = Number(process.env.COOKIE_EXPIRE);
  if (!cookie_expire) {
    throw new Error("Cookie expire not found. Please check env");
  }

  // options for cookie
  const options: CookieOptions = {
    maxAge: cookie_expire * 24 * 60 * 60 * 1000,
    sameSite: "none",
    secure: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
};

export default sendToken;
