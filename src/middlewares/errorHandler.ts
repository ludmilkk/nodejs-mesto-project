import { Request, Response, NextFunction } from 'express';
import HttpStatus from '../types/httpStatus';

interface ErrorWithStatusCode extends Error {
  statusCode?: number;
}

export default (err: ErrorWithStatusCode, req: Request, res: Response, next: NextFunction) => {
  const { statusCode = HttpStatus.INTERNAL_SERVER_ERROR, message } = err;

  res.status(statusCode).send({
    message: statusCode === HttpStatus.INTERNAL_SERVER_ERROR
      ? 'На сервере произошла ошибка'
      : message,
  });

  next();
};
