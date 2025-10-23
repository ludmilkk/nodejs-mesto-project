import HttpStatus from '../types/httpStatus';

class ConflictError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = HttpStatus.CONFLICT;
  }
}

export default ConflictError;
