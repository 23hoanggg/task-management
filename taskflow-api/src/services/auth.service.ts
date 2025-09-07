import bcrypt from "bcrypt";
import { User } from "../models/user.model";
import { z } from "zod";
import { loginSchema, registerSchema } from "../validations/auth.validation";
import jwt from "jsonwebtoken";

type RegisterInput = z.infer<typeof registerSchema>["body"];

export const registerUser = async (input: RegisterInput) => {
  const existingUser = await User.findOne({ email: input.email });
  if (existingUser) {
    throw new Error("Email already in use");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(input.password, salt);

  const newUser = await User.create({
    fullName: input.fullName,
    email: input.email,
    passwordHash: hashedPassword,
  });

  return newUser;
};

type LoginInPut = z.infer<typeof loginSchema>["body"];

export const loginUser = async (input: LoginInPut) => {
  const user = await User.findOne({ email: input.email }).select(
    "+passwordHash",
  );

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isPasswordMatch = await bcrypt.compare(
    input.password,
    user.passwordHash,
  );

  if (!isPasswordMatch) {
    throw new Error("Invalid credentials");
  }

  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_ACCESS_TOKEN_SECRET as string,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_TOKEN_SECRET as string,
    { expiresIn: "7d" },
  );

  return { user, accessToken, refreshToken };
};
