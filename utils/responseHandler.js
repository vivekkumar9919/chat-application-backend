
class ResponseHandler {
  static success(res, statusCode = 200, message = "Success", data = {}) {
    return res.status(statusCode).json({
      message,
      success: true,
      status_code: statusCode,
      ...data, // allows passing extra fields like { user, messages }
    });
  }

  static error(res, statusCode = 500, message = "Internal server error", error = null) {
    return res.status(statusCode).json({
      message,
      success: false,
      status_code: statusCode,
      error: error ? error : undefined,
    });
  }
}

module.exports = ResponseHandler;