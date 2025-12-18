import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import AuthRepository from '../repositories/auth.repo';
import { RegisterDTO, LoginDTO } from '../dtos/auth.dto';
import { IUser } from '../models/User';

class AuthService {
  async register(data: RegisterDTO) {
    const existingUser = await AuthRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await AuthRepository.createUser(data, passwordHash);
    return this.generateToken(user._id as unknown as string);
  }

  async login(data: LoginDTO) {
    const user = await AuthRepository.findUserByEmail(data.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    return this.generateToken(user._id as unknown as string);
  }

  async getUser(id: string) {
    return AuthRepository.findUserById(id);
  }

  async getAllUsers() {
    return AuthRepository.findAllUsers();
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
      expiresIn: '7d',
    });
  }
}

export default new AuthService();
