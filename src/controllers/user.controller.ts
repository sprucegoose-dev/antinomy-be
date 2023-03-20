import { Request, Response } from 'express';

import User from '../services/user.service';
import { exceptionHandler } from '../helpers/exception_handler.decorator';
import { AuthRequest } from '../types/index.interface';

@exceptionHandler()
class UsersController {

    async create(req: Request, res: Response): Promise<void> {
        const response = await User.create(req.body);
        res.send(response);
    }

    async login(req: Request, res: Response): Promise<void> {
        const response = await User.login(req.body.email, req.body.password);
        res.send(response);
    }

    async update(req: AuthRequest, res: Response): Promise<void> {
        const response = await User.update(req.userId, req.body);
        res.send(response);
    }

    async delete(req: AuthRequest, res: Response): Promise<void> {
        const response = await User.delete(req.userId);
        res.send(response);
    }

    async getDetails(req: AuthRequest, res: Response): Promise<void> {
        const response = await User.getOne(req.userId);
        res.send(response);
    }
}

export default new UsersController;
