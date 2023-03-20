import { Request, Response } from 'express';

import User from '../services/user.service';
import { exceptionHandler } from '../helpers/exception_handler.decorator';

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

    async update(req: Request, res: Response): Promise<void> {
        const response = await User.update(parseInt(req.params.id, 10), req.body);
        res.send(response);
    }

    async delete(req: Request, res: Response): Promise<void> {
        const response = await User.delete(parseInt(req.params.id, 10));
        res.send(response);
    }

    async getOne(req: Request, res: Response): Promise<void> {
        const response = await User.getOne(parseInt(req.params.id, 10));
        res.send(response);
    }
}

export default new UsersController;
