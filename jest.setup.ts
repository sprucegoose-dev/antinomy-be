import { DataTypes } from 'sequelize';
import { sequelize } from './database/connection';
import { Card } from './src/models/card.model';
import { CardType } from './src/models/card_type.model';
import { Game } from './src/models/game.model';
import { Player } from './src/models/player.model';
import { User } from './src/models/user.model';

const glob = require('glob');
const path = require('path');

sequelize.addModels([
    User,
    Player,
    Game,
    CardType,
    Card,
]);

beforeAll(async () => {
    const migrations = glob.sync('database/migrations/*.js');
    const seeders = glob.sync('database/seeders/*.js');

    for (const migration of migrations) {
        const { up } = require(path.resolve(migration));
        await up(sequelize.getQueryInterface(), DataTypes);
    }

    for (const seeder of seeders) {
        const { up } = require(path.resolve(seeder));
        await up(sequelize.getQueryInterface());
    }
});

