import { Player } from '../models/player.model';
import { ICreatePlayer } from '../types/player.interface';

class PlayerService {

    static async create({
        userId,
        gameId,
    }: ICreatePlayer): Promise<Player> {
        return await Player.create({
            userId,
            gameId,
        });
    }
}

export default PlayerService;
