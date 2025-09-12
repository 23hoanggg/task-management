import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import * as userService from '../services/user.service';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({
      message: 'User registered successfully!',
      data: user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Email already in use') {
      return res.status(409).json({ message: error.message });
    }
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user, accessToken, refreshToken } = await authService.loginUser(
      req.body,
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'Login successful!',
      data: {
        user,
        accessToken,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid credentials') {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    next(error);
  }
};

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token not found' });
  }

  try {
    const newAccessToken = await authService.refreshAccessToken(refreshToken);
    res.status(200).json({
      message: 'Access token refreshed successfully',
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    return res
      .status(403)
      .json({ message: 'Invalid or expired refresh token' });
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.sendStatus(401);
    }

    const user = await userService.findUserById(userId);
    if (!user) {
      return res.sendStatus(404);
    }

    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
};
