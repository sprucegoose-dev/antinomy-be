import { Response } from 'express';

import { exceptionHandler } from '../helpers/ExceptionHandler-decorator';

@exceptionHandler()
class GamesController {

    async create(req: Request, res: Response): Promise<void> {
        const response = null;
        res.send(response);
    }

    async start(req: Request, res: Response): Promise<void> {
        const response = null;
        res.send(response);
    }

    async join(req: Request, res: Response): Promise<void> {
        const response = null;
        res.send(response);
    }

    async performAction(req: Request, res: Response): Promise<void> {
        const response = null;
        res.send(response);
    }

    async leave(req: Request, res: Response): Promise<void> {
        const response = null;
        res.send(response);
    }

    async getState(req: Request, res: Response): Promise<void> {
        const response = null;
        res.send(response);
    }

    async getActiveGames(req: Request, res: Response): Promise<void> {
        const response = null;
        res.send(response);
    }

    async getActions(req: Request, res: Response): Promise<void> {
        const response = null;
        res.send(response);
    }
}

export default new GamesController;
