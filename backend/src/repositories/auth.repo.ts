import User, { IUser } from '../models/User';
import { RegisterDTO } from '../dtos/auth.dto';

class AuthRepository {
  async findUserByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  async findUserById(id: string): Promise<IUser | null> {
    return User.findById(id).select('-passwordHash');
  }

  async createUser(data: RegisterDTO, passwordHash: string): Promise<IUser> {
    const user = new User({
      username: data.username,
      email: data.email,
      passwordHash,
    });
    return user.save();
  }
}

export default new AuthRepository();
