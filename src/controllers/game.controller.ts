import { Request, Response } from 'express';

import { exceptionHandler } from '../helpers/exception_handler.decorator';
import GameService from '../services/game.service';
import { IActionRequest } from '../types/action.interface';

@exceptionHandler()
class GamesController {

    async create(req: Request, res: Response): Promise<void> {
        await GameService.create(req.userId);
        res.send();
    }

    async getActions(req: Request, res: Response): Promise<void> {
        const userId = req.userId;
        const gameId = req.params.id;
        const actions = GameService.getActions(userId, parseInt(gameId, 10));
        res.send(actions);
    }

    async getActiveGames(_req: Request, res: Response): Promise<void> {
        const activeGames = GameService.getActiveGames();
        res.send(activeGames);
    }

    async getState(req: Request, res: Response): Promise<void> {
        const gameId = req.params.id;
        const gameState = GameService.getState(parseInt(gameId, 10));
        res.send(gameState);
    }

    async join(req: Request, res: Response): Promise<void> {
        const userId = req.userId;
        const gameId = req.params.id;
        await GameService.join(userId, parseInt(gameId, 10));
        res.send();
    }

    async leave(req: Request, res: Response): Promise<void> {
        const userId = req.userId;
        const gameId = req.params.id;
        await GameService.leave(userId, parseInt(gameId, 10));
        res.send();
    }

    async performAction(req: IActionRequest, res: Response): Promise<void> {
        const userId = req.userId;
        const gameId = req.params.id;
        const paylod = req.body;
        await GameService.performAction(userId, parseInt(gameId, 10), paylod);
        res.send();
    }

    async start(req: Request, res: Response): Promise<void> {
        const userId = req.userId;
        const gameId = req.params.id;
        GameService.start(userId, parseInt(gameId, 10));
        res.send();
    }
}

export default new GamesController;
