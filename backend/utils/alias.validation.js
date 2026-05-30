import { RESERVED_KEYWORDS } from "../constants/url.constants.js";
import AppError from "./AppError.js";

const ALIAS_REGEX = /^[a-zA-Z0-9_-]+$/;
const MIN_ALIAS_LENGTH = 3;
const MAX_ALIAS_LENGTH = 50;

export const normalizeAlias = (alias) => alias.toLowerCase();

export const isValidAliasFormat = (alias) => ALIAS_REGEX.test(alias);

export const isValidAliasLength = (alias) =>
  alias.length >= MIN_ALIAS_LENGTH && alias.length <= MAX_ALIAS_LENGTH;

export const isReservedAlias = (alias) => RESERVED_KEYWORDS.includes(alias);

export const validateCustomAlias = (alias) => {
  const normalized = normalizeAlias(alias);

  if (!isValidAliasFormat(normalized))
    throw new AppError(
      "Invalid custom alias. Only alphanumeric characters, dashes, and underscores are allowed.",
      400,
    );

  if (!isValidAliasLength(normalized))
    throw new AppError("Alias must be between 3 and 50 characters", 400);

  if (isReservedAlias(normalized))
    throw new AppError("Custom alias is a reserved keyword.", 400);

  return normalized;
};
