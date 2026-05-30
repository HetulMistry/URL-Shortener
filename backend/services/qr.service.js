import QRCode from "qrcode";
import AppError from "../utils/AppError.js";

export const generateQrCode = async (shortUrl, format = "png") => {
  if (format === "base64")
    return QRCode.toDataURL(shortUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 256,
    });

  return QRCode.toBuffer(shortUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 256,
    type: "png",
  });
};

export const buildShortUrl = (baseUrl, shortCode) => {
  if (!baseUrl) throw new AppError("APP_BASE_URL is not configured", 500);

  const normalizedBase = baseUrl.replace(/\/$/, "");
  return `${normalizedBase}/${shortCode}`;
};
