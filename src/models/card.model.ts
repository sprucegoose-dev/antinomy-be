import {
    BelongsTo,
    Column,
    Model,
    Table,
} from 'sequelize-typescript';
import { CardType } from './card_type.model';
import { Game } from './game.model';
import { Player } from './player.model';

@Table
export class Card extends Model {
    @Column({ primaryKey: true, autoIncrement: true })
    id: number;

    @Column({
        field: 'game_id',
        references: {
            model: Game,
            key: 'id',
        }
    })
    gameId: number;

    @Column({
        field: 'player_id',
        references: {
            model: Player,
            key: 'id',
        }
    })
    playerId: number;

    @Column
    typeId: number;

    @Column
    index: number;

    @BelongsTo(() => CardType)
    type: CardType

    @BelongsTo(() => Player)
    player: Player

    @BelongsTo(() => Game)
    game: Game
}
