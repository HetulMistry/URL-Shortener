export const sendSuccess = (res, statusCode, data) =>
  res.status(statusCode).json({ success: true, data });

export const sendError = (res, statusCode, message, requestId) =>
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(requestId && { requestId }),
    },
  });

export const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});
