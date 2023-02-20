import {
    Column,
    CreatedAt,
    // CreatedAt,
    Model,
    Table,
    UpdatedAt,
    // UpdatedAt,
} from 'sequelize-typescript';

@Table({
    timestamps: true,
})
export class User extends Model {

    @Column
    username: string;

    @Column
    email: string;

    @Column
    password: string;

    @Column({ field: 'session_id' })
    sessionId: string;

    @Column({ field: 'session_exp' })
    sessionExp: string;

    @CreatedAt
    @Column({ field: 'created_at' })
    // @ts-ignore
    createdAt: Date;

    @UpdatedAt
    @Column({ field: 'created_at' })
    // @ts-ignore
    updatedAt: Date;
}
