import userController from '../controllers/user/userManagement';
import userService from '../services/userService';
import { Request, Response } from 'express';

describe('UserController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      body: {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as Partial<Response>;
  });

  describe('createUser', () => {
    it('should create user and return 201 status', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      };

      jest.spyOn(userService, 'createUser').mockResolvedValue(mockUser);

      await userController.createUser(mockReq as Request, mockRes as Response);

      expect(userService.createUser).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 409 when user already exists', async () => {
      jest.spyOn(userService, 'createUser').mockRejectedValue(new Error('User already registered'));

      await userController.createUser(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'User already registered' });
    });

    it('should return 400 for other errors', async () => {
      const errorMessage = 'Invalid user data';
      jest.spyOn(userService, 'createUser').mockRejectedValue(new Error(errorMessage));

      await userController.createUser(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });
}); 