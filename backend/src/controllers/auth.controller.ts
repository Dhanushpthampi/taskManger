import { Request, Response } from 'express';
import { ZodError } from 'zod';
import AuthService from '../services/auth.service';
import { RegisterSchema, LoginSchema } from '../dtos/auth.dto';

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const validatedData = RegisterSchema.parse(req.body);
      const token = await AuthService.register(validatedData);

      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ errors: (error as ZodError).issues });
      }
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const validatedData = LoginSchema.parse(req.body);
      const token = await AuthService.login(validatedData);

      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({ message: 'Logged in successfully' });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ errors: (error as ZodError).issues });
      }
      res.status(401).json({ message: (error as Error).message });
    }
  }

  async logout(_req: Request, res: Response) {
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
  }

  async getMe(req: Request, res: Response) {
    try {
      const user = await AuthService.getUser(req.user as string);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await AuthService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
}

export default new AuthController();
