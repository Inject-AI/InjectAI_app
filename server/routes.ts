import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertAnalysisSchema } from "@shared/schema";
import CoinMarketCap from "coinmarketcap-api";

// Initialize clients
const coinmarketcap = new CoinMarketCap(process.env.COINMARKETCAP_API_KEY);

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // User routes
  app.put("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const walletAddress = req.headers['x-wallet-address'];
      if (!walletAddress) {
        return res.status(401).json({ message: "No wallet connected" });
      }

      const user = await storage.getUserByWallet(walletAddress as string);
      if (!user || user.id !== userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { username } = req.body;
      if (!username || typeof username !== 'string') {
        return res.status(400).json({ message: "Invalid username" });
      }

      const updatedUser = await storage.updateUser(userId, { username });
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.post("/api/auth", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByWallet(userData.walletAddress);

      if (existingUser) {
        res.json(existingUser);
      } else {
        const newUser = await storage.createUser(userData);
        res.json(newUser);
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.get("/api/auth", async (req, res) => {
    try {
      const walletAddress = req.headers['x-wallet-address'];
      if (!walletAddress) {
        return res.status(401).json({ message: "No wallet connected" });
      }
      const user = await storage.getUserByWallet(walletAddress as string);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Chat route with OpenRouter integration
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, userId } = req.body;
      const OPENROUTER_API_KEY = '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';

      if (!message || !userId) {
        return res.status(400).json({ message: "Missing message or userId" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful expert in blockchain technology, cryptocurrency markets, and trading strategies. Provide clear, accurate, and educational responses about blockchain, crypto markets, trading analysis, and investment strategies.'
            },
            {
              role: 'user',
              content: message
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from OpenRouter');
      }

      const data = await response.json();
      
      // Award 1 point for chatting
      const updatedUser = await storage.updateUserPoints(userId, 1);
      console.log('Updated user points:', updatedUser.points);
      
      res.json({ 
        response: data.choices[0].message.content,
        points: updatedUser.points 
      });
    } catch (error) {
      console.error('Chat API Error:', error);
      res.status(500).json({ message: "Failed to get AI response" });
    }
  });

  // Token routes with CoinMarketCap integration
  app.get("/api/tokens", async (req, res) => {
    try {
      const listings = await coinmarketcap.getTickers({ limit: 100 });
      const tokens = listings.data.map((token: any) => {
        try {
          return {
            id: token.id,
            symbol: token.symbol,
            name: token.name,
            price: token.quote?.USD?.price?.toString() || "0",
            change24h: token.quote?.USD?.percent_change_24h?.toFixed(2) || "0",
            marketCap: token.quote?.USD?.market_cap?.toString() || "0",
            volume24h: token.quote?.USD?.volume_24h?.toString() || "0",
          };
        } catch (error) {
          console.error('Token data parsing error:', error);
          return null;
        }
      }).filter(Boolean);

      // Store tokens in memory for search and detail view
      tokens.forEach(token => storage.tokens.set(token.id, token));
      res.json(tokens);
    } catch (error) {
      console.error('CoinMarketCap API Error:', error);
      // Fallback to stored tokens if API fails
      const tokens = await storage.getTokens();
      res.json(tokens);
    }
  });

  app.get("/api/tokens/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      
      // If no query, return all tokens
      if (!query || query.trim() === '') {
        const tokens = await storage.getTokens();
        return res.json(tokens);
      }

      try {
        // Try CoinMarketCap API first
        const listings = await coinmarketcap.getTickers({ 
          limit: 2000,
          start: 1,
          convert: 'USD',
          sort: 'cmc_rank'
        });

        if (listings && listings.data) {
          const filteredTokens = listings.data
            .filter((token: any) => {
              if (!token || !token.name || !token.symbol) return false;
              return token.name.toLowerCase().includes(query.toLowerCase()) ||
                     token.symbol.toLowerCase().includes(query.toLowerCase());
            })
            .map((token: any) => ({
              id: token.id,
              symbol: token.symbol,
              name: token.name,
              price: token.quote?.USD?.price?.toString() || "0",
              change24h: token.quote?.USD?.percent_change_24h?.toFixed(2) || "0",
              marketCap: token.quote?.USD?.market_cap?.toString() || "0",
              volume24h: token.quote?.USD?.volume_24h?.toString() || "0",
            }))
            .slice(0, 50);

          // Cache the tokens
          filteredTokens.forEach(token => storage.tokens.set(token.id, token));
          return res.json(filteredTokens);
        }
      } catch (apiError) {
        console.error('CoinMarketCap API Error:', apiError);
      }

      // Fallback to local search
      const localTokens = await storage.searchTokens(query);
      res.json(localTokens);
    } catch (error) {
      console.error('Search Error:', error);
      res.status(500).json({ message: "Failed to search tokens" });
    }
  });

  app.get("/api/tokens/:id", async (req, res) => {
    try {
      const tokenId = parseInt(req.params.id);
      const token = await storage.getToken(tokenId);

      if (!token) {
        // If token not found in storage, try to fetch it from CoinMarketCap
        const ticker = await coinmarketcap.getTicker({ id: tokenId });

        if (ticker.data) {
          const tokenData = ticker.data;
          const token = {
            id: tokenId,
            symbol: tokenData.symbol,
            name: tokenData.name,
            price: tokenData.quotes.USD.price.toString(),
            change24h: tokenData.quotes.USD.percentChange24h.toFixed(2),
            marketCap: tokenData.quotes.USD.marketCap.toString(),
            volume24h: tokenData.quotes.USD.volume24h.toString(),
          };
          storage.tokens.set(tokenId, token);
          return res.json(token);
        }
        return res.status(404).json({ message: "Token not found" });
      }
      res.json(token);
    } catch (error) {
      console.error('Token detail error:', error);
      res.status(500).json({ message: "Failed to fetch token details" });
    }
  });

  // Analysis routes
  app.post("/api/analysis", async (req, res) => {
    try {
      const { userId, tokenId, type } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Calculate points based on analysis type
      const pointsMap = { basic: 10, advanced: 20, premium: 30 };
      const points = pointsMap[type as keyof typeof pointsMap];
      
      if (!points) {
        return res.status(400).json({ message: "Invalid analysis type" });
      }

      const analysisData = {
        ...req.body,
        userId: user.id,
        points: points // Add points to analysis record
      };

      const validatedData = insertAnalysisSchema.parse(analysisData);
      
      const token = await storage.getToken(validatedData.tokenId);
      if (!token) {
        return res.status(404).json({ message: "Token not found" });
      }

      // Create analysis
      const analysis = await storage.createAnalysis({
        ...validatedData,
        id: storage['currentId']++
      });

      // Award points to user
      const updatedUser = await storage.updateUserPoints(user.id, points);
      console.log('Updated user points from analysis:', updatedUser.points);

      res.json({ ...analysis, userPoints: updatedUser.points });
    } catch (error) {
      console.error('Analysis Error:', error);
      res.status(400).json({ message: "Invalid analysis data" });
    }
  });

  app.get("/api/users/:userId/analysis", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const analysis = await storage.getUserAnalysis(userId);
      res.json(analysis);
    } catch (error) {
      console.error('Analysis history error:', error);
      res.status(500).json({ message: "Failed to fetch analysis history" });
    }
  });

  return httpServer;
}