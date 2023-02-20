import {
    BelongsTo,
    Column,
    Model,
    Table,
} from 'sequelize-typescript';
import { Game } from './game.model';
import { User } from './user.model';
import { PlayerOrientation } from '../player/player.interface';

@Table
export class Player extends Model {
    @Column({ primaryKey: true, autoIncrement: true })
    id: number;

    @Column({
        field: 'user_id',
        references: {
            model: User,
            key: 'id',
        }
    })
    userId: number;

    @Column({
        field: 'game_id',
        references: {
            model: Game,
            key: 'id',
        }
    })
    gameId: number;

    orientation: PlayerOrientation;

    position: number;

    @Column
    points: number;

    @BelongsTo(() => Game, 'gameId')
    game: Game

    @BelongsTo(() => User, 'userId')
    user: User
}
