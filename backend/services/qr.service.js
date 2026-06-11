import QRCode from "qrcode";

export const generateQrCode = async (text, format = "base64") => {
  try {
    if (format === "base64")
      return await QRCode.toDataURL(text, {
        errorCorrectionLevel: "H",
        type: "image/png",
        quality: 0.95,
        margin: 1,
      });
    else if (format === "png")
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
  return `${baseUrl}/${shortCode}`;
};
