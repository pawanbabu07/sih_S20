const errorHandler = (err, req, res, next) => {
  // If the status code was not set to an error code, default to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  const response = {
    success: false,
    message: err.message || 'Server Error'
  };

  // Only expose stack trace in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  // Handle mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    res.status(404);
    response.message = 'Resource not found';
  }

  // Handle mongoose validation error
  if (err.name === 'ValidationError') {
    res.status(400);
    response.message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // Handle Mongoose duplicate key error (e.g. unique email)
  if (err.code === 11000) {
    res.status(400);
    response.message = 'Email already exists';
  }

  res.status(res.statusCode === 200 ? statusCode : res.statusCode).json(response);
};

const notFound = (req, res, next) => {
  res.status(404);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  next(error);
};

module.exports = {
  errorHandler,
  notFound
};
