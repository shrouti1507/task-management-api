import { Request, Response } from 'express';
import userService from '../../services/userService';

class UserController {
    async createUser(req: Request, res: Response): Promise<void> {
        try {
            const user = await userService.createUser(req.body);
            res.status(201).json(user);
        } catch (error) {
            if ((error as Error).message.includes('already registered')) {
                res.status(409).json({ error: (error as Error).message });
                return;
            }
            res.status(400).json({ error: (error as Error).message });
        }
    }
}

export default new UserController(); 