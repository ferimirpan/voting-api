export const errorHanlder = (err, req, res, next) => {
  let resStatusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  const errorCode = err.errorResponse ? err.errorResponse.code : null;

  if (err.name === 'ValidationError') {
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(',')
    resStatusCode = 400;
  }

  if (errorCode === 11000) {
    resStatusCode = 400;
  }

  res.status(resStatusCode).json({
    message,
    stack: err.stack,
  });
}

export const notFoundPath = (req, res, next) => {
  const error = new Error(`url not found - ${req.originalURL}`);
  res.status(404);
  next(error);
}