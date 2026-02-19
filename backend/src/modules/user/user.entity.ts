export class User {
  id: string;
  username: string;
  balance: number;
  accessToken?: string;
  createdAt: Date;

  constructor(id: string, username: string, balance: number = 1000) {
    this.id = id;
    this.username = username;
    this.balance = balance;
    this.createdAt = new Date();
  }
}
