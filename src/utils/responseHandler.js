const responseHandler = {
    success: (res, data = {}, message = 'Request was successful', statusCode = 200) => {
      res.status(statusCode).json({
        success: true,
        message,
        data,
      });
    },
  
    error: (res, error = 'Something went wrong', statusCode = 500) => {
      res.status(statusCode).json({
        success: false,
        message: error.message || error,
        data: null,
      });
    },
  
    notFound: (res, message = 'Resource not found', statusCode = 404) => {
      res.status(statusCode).json({
        success: false,
        message,
        data: null,
      });
    },
  
    validationError: (res, errors = [], message = 'Validation error', statusCode = 400) => {
      res.status(statusCode).json({
        success: false,
        message,
        errors,
      });
    },
    unauthorized: (res, errors = [], message = 'Access denied', statusCode = 403) => {
      res.status(statusCode).json({
        success: false,
        message,
        errors,
      });
    },
  };
  
  module.exports = { responseHandler };
  