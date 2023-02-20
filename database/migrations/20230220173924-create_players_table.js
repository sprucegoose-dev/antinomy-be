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
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                ...foreignKey,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            game_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                ...foreignKey,
                references: {
                    model: 'games',
                    key: 'id',
                },
            },
            position: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            points: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
        };

        return queryInterface.createTable('players', schema);
    },
    down: (queryInterface) => {
        return queryInterface.dropTable('players');
    }
};
