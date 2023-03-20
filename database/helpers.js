
function generateCardTypes() {
    const cardTypes = [];
    const suits = [
        'key',
        'skull',
        'ring',
        'feather',
    ];
    const colors = [
        'red',
        'green',
        'purple',
        'blue',
    ];

    let startingNumber = 1;
    let value;

    for (let i = 0; i < 4; i++) {

        for (let j = 0; j < 4; j++) {
            value = startingNumber + j;

            if (value > 4) {
                value = value - 4;
            }

            cardTypes.push(generateCardType({
                value,
                suit: suits[j],
                color: colors[i],
            }));
        }

        startingNumber += 1;
    }

    return cardTypes.sort((a, b) => a.value - b.value);
}

function generateCardType({
    color,
    suit,
    value,
}) {
    return {
        color,
        suit,
        value,
    };
}

module.exports = {
    generateCardTypes,
};
