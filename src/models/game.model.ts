import {
    BelongsTo,
    Column,
    Model,
    Table,
} from 'sequelize-typescript';
import { Player } from './player.model';
import { User } from './user.model';
import { GamePhase, GameState } from '../game/game.interface';


@Table
export class Game extends Model {
    @Column({ primaryKey: true, autoIncrement: true })
    id: number;

    @Column({
        field: 'creator_id',
        references: {
            model: User,
            key: 'id',
        }
    })
    creatorId: number;

    @Column({
        field: 'player_id',
        references: {
            model: Player,
            key: 'id',
        }
    })
    activePlayerId: number;

    @Column({
        field: 'winner_id',
        references: {
            model: User,
            key: 'id',
        }
    })
    winnerId: number;

    @Column
    state: GameState;

    @Column
    phase: GamePhase;

    @Column
    updatedAt: string;

    @Column
    createdAt: string;

    @BelongsTo(() => User, 'creatorId')
    creator: User

    @BelongsTo(() => Player, 'activePlayerId')
    activePlayer: Player

    @BelongsTo(() => User, 'winnerId')
    winner: User
}
