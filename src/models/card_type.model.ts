import {
    Column,
    Model,
    Table,
} from 'sequelize-typescript';
import { Color, Suit } from '../card-type/card_type.interface';

@Table
export class CardType extends Model {
    @Column({ primaryKey: true, autoIncrement: true })
    id: number;

    @Column
    value: number;

    @Column
    suit: Suit;

    @Column
    color: Color;

    @Column
    index: number;
}
