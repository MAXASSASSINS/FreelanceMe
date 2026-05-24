import { Request, Response, NextFunction } from 'express';
// import { AuthenticatedRequest } from '../types/authenticatedRequest';

type AsyncHandler = (
  req: Request ,
  res: Response,
  next: NextFunction
) => Promise<any>;

const catchAsyncErrors = (fn: AsyncHandler) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default catchAsyncErrors;