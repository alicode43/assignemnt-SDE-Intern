import User, { IUser } from "../models/User";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import mongoose from "mongoose";

const register = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;
    
        // Validate required fields
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ 
                error: "All fields are required", 
                required: ["firstName", "lastName", "email", "password"]
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Please provide a valid email address" });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User account already exists" });
        }

        const newUser = new User({ 
            firstName, 
            lastName, 
            email, 
            password,
            role: role || 'user' 
        });
        
        await newUser.save();
        
        // Return user data without password
        const userResponse = {
            _id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            role: newUser.role,
        
        };
        
        return res.status(201).json({
            message: "User registered successfully",
            user: userResponse
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: "Email and password are required" 
      });
    }

    // Find user by email (include password for comparison)
    const user = await User.findOne({ email }) as IUser | null;
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Please provide valid credentials" });
    }

    // Generate JWT tokens using user methods
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Return user data without password
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
 
    };
    
  const options = {
    httpOnly: true,
    secure: true,
  };

    return res.status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .json({
        message: "Login successful",
        user: userResponse
      });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getAllUser = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
 
const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Refresh token endpoint
const refreshToken = async (req: Request, res: Response) => {
  try {
    // Get refresh token from cookies
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'hamar_key_here') as any;
    
    // Find user
    const user = await User.findById(decoded.id) as IUser | null;
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate new tokens using user methods
    const accessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    return res.status(200)
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
      })
      .cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
      })
      .json({
        message: "Tokens refreshed successfully"
      });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }
};

// Logout endpoint
const logout = async (req: Request, res: Response) => {
  try {
    return res.status(200)
      .clearCookie('accessToken')
      .clearCookie('refreshToken')
      .json({
        message: "Logged out successfully"
      });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export { register, login, getAllUser, getUserById, refreshToken, logout };