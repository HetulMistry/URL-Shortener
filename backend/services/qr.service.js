import QRCode from "qrcode";
import AppError from "../utils/AppError.js";

export const generateQrCode = async (text, format = "base64") => {
  try {
    if (format === "base64")
      return await QRCode.toDataURL(text, {
        errorCorrectionLevel: "H",
        type: "image/png",
        quality: 0.95,
        margin: 1,
      });

    if (format === "png")
      return await QRCode.toBuffer(text, {
        errorCorrectionLevel: "H",
        type: "image/png",
        quality: 0.95,
        margin: 1,
      });
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error.message}`);
  }
};

export const buildShortUrl = (baseUrl, shortCode) => {
  if (!baseUrl?.trim())
    throw new AppError("APP_BASE_URL is not configured", 500);

  const normalizedBase = baseUrl.replace(/\/+$/, "");
  return `${normalizedBase}/${shortCode}`;
};
