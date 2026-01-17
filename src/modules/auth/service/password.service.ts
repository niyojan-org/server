import ApiError from "@core/errors/api.error";
import bcrypt from "bcryptjs";

export const verifyPasswordStrength = (password: string): boolean => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLongEnough = password.length >= 8;
  const isStrong = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isLongEnough;
  if (!isStrong) {
    throw new ApiError(
      400,
      "Password is not strong enough",
      "WEAK_PASSWORD",
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
    );
  }
  return isStrong;
};

export const verifyPassword = async (plainPassword: string, hashedPassword: string) => {
  const match = await bcrypt.compare(plainPassword, hashedPassword);
  if (!match) {
    throw new ApiError(
      401,
      "Invalid credentials",
      "INVALID_CREDENTIALS",
      "The provided credentials are incorrect"
    );
  }
};
