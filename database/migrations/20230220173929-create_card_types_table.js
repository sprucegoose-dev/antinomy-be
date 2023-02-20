'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        const schema = {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            value: Sequelize.INTEGER,
            suit: Sequelize.STRING,
            color: Sequelize.STRING,
        };

        return queryInterface.createTable('card_types', schema);
    },
    down: (queryInterface) => {
        return queryInterface.dropTable('card_types');
    }
};
