/* eslint-disable no-unused-vars */
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
      };
    }
  }
}
