import HttpStatus from '../types/httpStatus';

class ForbiddenError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = HttpStatus.FORBIDDEN;
  }
}

export default ForbiddenError;
