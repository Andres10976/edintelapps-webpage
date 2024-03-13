class CustomError extends Error {
    constructor(message, ...params) {
      super(...params);
  
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, CustomError);
      }
  
      this.name = this.constructor.name;
      this.message = message;
    }
  }
  
  class DatabaseError extends CustomError {
    constructor(message, cause) {
      super(message);
      this.cause = cause;
    }
  }
  
  async function handleError(error, maxRetries = 3, retryAttempt = 0) {
    console.error('Database error:', error);
  
    if (shouldRetry(error) && retryAttempt < maxRetries) {
      const backoffDelay = Math.pow(2, retryAttempt) * 1000 + Math.random() * 500;
      console.log(`Retrying after ${backoffDelay}ms (attempt ${retryAttempt + 1})`);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
      return true;
    } else {
      throw error;
    }
  }
  
  function shouldRetry(error) {
    return error.code === 'ETIMEOUT' || error.code === 'ECONNRESET';
  }
  
  function isRaisError(error) {
    return error.number >= 50000 && error.severity >= 16;
  }
  
  module.exports = {
    CustomError,
    DatabaseError,
    handleError,
    isRaisError
  };