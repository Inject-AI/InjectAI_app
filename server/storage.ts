import { users, tokens, analysis, type User, type InsertUser, type Token, type Analysis } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByWallet(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(id: number, points: number): Promise<User>;

  // Token operations
  getTokens(): Promise<Token[]>;
  getToken(id: number): Promise<Token | undefined>;
  searchTokens(query: string): Promise<Token[]>;

  // Analysis operations
  createAnalysis(analysis: Analysis): Promise<Analysis>;
  getUserAnalysis(userId: number): Promise<Analysis[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private tokens: Map<number, Token> = new Map();
  private analyses: Map<number, Analysis> = new Map();
  private currentId = 1;

  constructor() {
    // Initialize with some sample tokens
    this.initializeSampleTokens();
  }

  private initializeSampleTokens() {
    const sampleTokens: Token[] = [
      {
        id: 1,
        symbol: "BTC",
        name: "Bitcoin",
        price: "42000",
        change24h: "2.5",
        marketCap: "800000000000",
        volume24h: "25000000000"
      },
      {
        id: 2,
        symbol: "ETH",
        name: "Ethereum",
        price: "2800",
        change24h: "3.1",
        marketCap: "300000000000",
        volume24h: "15000000000"
      }
    ];

    sampleTokens.forEach(token => this.tokens.set(token.id, token));
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByWallet(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress === walletAddress
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id, points: 0 };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<Omit<User, 'id' | 'walletAddress' | 'points'>>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserPoints(id: number, points: number): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, points: user.points + points };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getTokens(): Promise<Token[]> {
    return Array.from(this.tokens.values());
  }

  async getToken(id: number): Promise<Token | undefined> {
    return this.tokens.get(id);
  }

  async searchTokens(query: string): Promise<Token[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.tokens.values()).filter(
      token => 
        token.symbol.toLowerCase().includes(lowercaseQuery) ||
        token.name.toLowerCase().includes(lowercaseQuery)
    );
  }

  async createAnalysis(analysis: Analysis): Promise<Analysis> {
    const id = this.currentId++;
    this.analyses.set(id, { ...analysis, id });
    return analysis;
  }

  async getUserAnalysis(userId: number): Promise<Analysis[]> {
    return Array.from(this.analyses.values()).filter(
      analysis => analysis.userId === userId
    );
  }
}

export const storage = new MemStorage();
