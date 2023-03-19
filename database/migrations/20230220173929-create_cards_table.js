'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        const foreignKey = {
            type: Sequelize.INTEGER,
            onUpdate: 'cascade',
            onDelete: 'cascade',
            allowNull: false,
        };

        const schema = {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            index: Sequelize.INTEGER,
            card_type_id: {
                ...foreignKey,
                references: {
                    model: 'card_types',
                    key: 'id',
                },
            },
            game_id: {
                ...foreignKey,
                references: {
                    model: 'games',
                    key: 'id',
                },
                allowNull: true,
            },
            player_id: {
                ...foreignKey,
                references: {
                    model: 'players',
                    key: 'id',
                },
                allowNull: true,
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
        };

        return queryInterface.createTable('cards', schema);
    },
    down: (queryInterface) => {
        return queryInterface.dropTable('cards');
    }
};
