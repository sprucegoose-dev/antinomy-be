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
            creator_id: {
                type: Sequelize.INTEGER,
                ...foreignKey,
                references: {
                    model: 'users',
                    key: 'id',
                },
                allowNull: false,
            },
            winner_id: {
                type: Sequelize.INTEGER,
                ...foreignKey,
                references: {
                    model: 'users',
                    key: 'id',
                },
                allowNull: true,
            },
            state: Sequelize.STRING,
            phase: Sequelize.STRING,
            codexColor: {
                type: Sequelize.ENUM,
                values: [
                    'red',
                    'green',
                    'purple',
                    'blue',
                ],
                allowNull: true,
                defaultValue: null,
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
        };

        return queryInterface.createTable('games', schema);
    },
    down: (queryInterface) => {
        return queryInterface.dropTable('games');
    }
};
