import { Transaction } from 'sequelize';
import db from '../models';

interface UserData {
  email: string;
  name: string;
  [key: string]: any; // for any additional fields
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

class UserService {
    async validateUserData(userData: UserData): Promise<ValidationResult> {
        if (!userData.email || !userData.name) {
            return {
                isValid: false,
                error: 'Email and name are required fields'
            };
        }

        // Check email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            return {
                isValid: false,
                error: 'Invalid email format'
            };
        }

        // Check if email already exists
        const existingUser = await db.User.findOne({
            where: { email: userData.email }
        });

        if (existingUser) {
            return {
                isValid: false,
                error: 'Email already registered'
            };
        }

        return { isValid: true };
    }

    async createUser(userData: UserData) {
        const transaction: Transaction = await db.sequelize.transaction();
        
        try {
            // Additional validation before creation
            const validationResult = await this.validateUserData(userData);
            if (!validationResult.isValid) {
                throw new Error(validationResult.error);
            }

            const user = await db.User.create(userData, { transaction });
            await transaction.commit();
            return user;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

export default new UserService(); 