import HttpStatus from '../types/httpStatus';

class UnauthorizedError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = HttpStatus.UNAUTHORIZED;
  }
}

export default UnauthorizedError;
