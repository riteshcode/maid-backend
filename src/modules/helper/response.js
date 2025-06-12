var responseHandler = {
  success: function (res, message, data = null, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message: message,
      data: data
    });
  },

  error: function (res, message, statusCode = 500) {
    return res.status(statusCode).json({
      success: false,
      message: message
    });
  },

  notFound: function (res, message = 'Resource not found') {
    return res.status(404).json({
      success: false,
      message: message
    });
  },
  Forbidden: function (res, message = 'Forbidden') {
    return res.status(403).json({
      success: false,
      message: message
    });
  },
  Unauthorized: function (res, message = 'Unauthorized: user not found in request') {
    return res.status(401).json({
      success: false,
      message: message
    });
  },

  badRequest: function (res, message = 'Bad request') {
    return res.status(400).json({
      success: false,
      message: message
    });
  },

  created: function (res, message, data = null) {
    return res.status(201).json({
      success: true,
      message: message,
      data: data
    });
  }
};

module.exports = responseHandler;
