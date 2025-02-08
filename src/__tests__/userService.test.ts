import UserService from '../services/userService';
import db from '../models';

// Mock the database models
jest.mock('../models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
  sequelize: {
    transaction: jest.fn(),
  },
}));

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUserData', () => {
    it('should return invalid when email is missing', async () => {
      const result = await UserService.validateUserData({ name: 'Test User' } as any);
      expect(result).toEqual({
        isValid: false,
        error: 'Email and name are required fields',
      });
    });

    it('should return invalid when name is missing', async () => {
      const result = await UserService.validateUserData({ email: 'test@example.com' } as any);
      expect(result).toEqual({
        isValid: false,
        error: 'Email and name are required fields',
      });
    });

    it('should return invalid for incorrect email format', async () => {
      const result = await UserService.validateUserData({
        email: 'invalid-email',
        name: 'Test User',
      });
      expect(result).toEqual({
        isValid: false,
        error: 'Invalid email format',
      });
    });

    it('should return invalid when email already exists', async () => {
      (db.User.findOne as jest.Mock).mockResolvedValue({ id: 1 });
      
      const result = await UserService.validateUserData({
        email: 'existing@example.com',
        name: 'Test User',
      });
      
      expect(result).toEqual({
        isValid: false,
        error: 'Email already registered',
      });
    });

    it('should return valid for correct data with unique email', async () => {
      (db.User.findOne as jest.Mock).mockResolvedValue(null);
      
      const result = await UserService.validateUserData({
        email: 'new@example.com',
        name: 'Test User',
      });
      
      expect(result).toEqual({ isValid: true });
    });
  });

  describe('createUser', () => {
    const mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };

    beforeEach(() => {
      (db.sequelize.transaction as jest.Mock).mockResolvedValue(mockTransaction);
    });

    it('should create a user successfully', async () => {
      const userData = {
        email: 'new@example.com',
        name: 'Test User',
      };

      (db.User.findOne as jest.Mock).mockResolvedValue(null);
      (db.User.create as jest.Mock).mockResolvedValue({ ...userData, id: 1 });

      const result = await UserService.createUser(userData);

      expect(result).toEqual({ ...userData, id: 1 });
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockTransaction.rollback).not.toHaveBeenCalled();
    });

    it('should rollback transaction and throw error when validation fails', async () => {
      const userData = {
        email: 'existing@example.com',
        name: 'Test User',
      };

      (db.User.findOne as jest.Mock).mockResolvedValue({ id: 1 });

      await expect(UserService.createUser(userData)).rejects.toThrow('Email already registered');
      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });

    it('should rollback transaction and throw error when creation fails', async () => {
      const userData = {
        email: 'new@example.com',
        name: 'Test User',
      };

      (db.User.findOne as jest.Mock).mockResolvedValue(null);
      (db.User.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(UserService.createUser(userData)).rejects.toThrow('Database error');
      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });
  });
}); 