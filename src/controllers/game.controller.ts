import { Request, Response } from 'express';

import { exceptionHandler } from '../helpers/ExceptionHandler-decorator';
import GameService from '../services/game.service';
import { IActionRequest } from '../types/action.interface';

@exceptionHandler()
class GamesController {

    async create(req: Request, res: Response): Promise<void> {
        await GameService.create(req.userId);
        res.send();
    }

    async start(req: Request, res: Response): Promise<void> {
        const userId = req.userId;
        const gameId = req.params.id;
        GameService.start(userId, parseInt(gameId, 10));
        res.send();
    }

    async join(_req: Request, _res: Response): Promise<void> {
        // const response = null;
        // res.send(response);
    }

    async performAction(req: IActionRequest, res: Response): Promise<void> {
        const userId = req.userId;
        const gameId = req.params.id;
        const paylod = req.body;
        await GameService.performAction(userId, parseInt(gameId, 10), paylod);
        res.send();
    }

    async leave(_req: Request, _res: Response): Promise<void> {
        // const response = null;
        // res.send(response);
    }

    async getState(_req: Request, _res: Response): Promise<void> {
        // const response = null;
        // res.send(response);
    }

    async getActiveGames(_req: Request, _res: Response): Promise<void> {
        // const response = null;
        // res.send(response);
    }

    async getActions(_req: Request, _res: Response): Promise<void> {
        // const response = null;
        // res.send(response);
    }
}

export default new GamesController;
