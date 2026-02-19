import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { User } from './user.entity';

@Injectable()
export class UserService {
  private users: Map<string, User> = new Map();
  private tokenToUserId: Map<string, string> = new Map(); // token -> userId mapping
  private idCounter = 1;

  private generateToken(): string {
    return 'ww_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  create(username: string, initialBalance: number = 1000): User {
    const id = `user_${this.idCounter++}`;
    const user = new User(id, username, initialBalance);
    this.users.set(id, user);
    return user;
  }

  createWithId(id: string, username: string, initialBalance: number = 1000): User {
    // Check if ID already exists
    if (this.users.has(id)) {
      throw new BadRequestException(`User with ID '${id}' already exists`);
    }
    const user = new User(id, username, initialBalance);
    this.users.set(id, user);
    return user;
  }

  findById(id: string): User | undefined {
    return this.users.get(id);
  }

  findAll(): User[] {
    return Array.from(this.users.values());
  }

  deductBalance(userId: string, amount: number): void {
    const user = this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }
    user.balance -= amount;
  }

  addBalance(userId: string, amount: number): void {
    const user = this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.balance += amount;
  }

  getBalance(userId: string): number {
    const user = this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.balance;
  }

  // Generate or regenerate access token for user
  generateAccessToken(userId: string): string {
    const user = this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Remove old token if exists
    if (user.accessToken) {
      this.tokenToUserId.delete(user.accessToken);
    }
    
    // Generate new token
    const token = this.generateToken();
    user.accessToken = token;
    this.tokenToUserId.set(token, userId);
    
    return token;
  }

  // Find user by access token
  findByAccessToken(token: string): User | undefined {
    const userId = this.tokenToUserId.get(token);
    if (!userId) return undefined;
    return this.findById(userId);
  }
}
