export class ActionService {

    getMovement(player: Player, cardsInHand: Card[], continuumCards: Card[]): Card[] {
        const {
            position: playerPosition,
            orientation,
        } = player;

        let validDestinations: Card[] = [];

        if (orientation === PlayerOrientation.TOP) {
            continuumCards.reverse();
        }

        const cardsInPast = continuumCards.slice(0, playerPosition);
        const cardsInFuture = continuumCards.slice(playerPosition);

        for (const card of cardsInHand) {
            validDestinations = validDestinations.concat(this.getValidDestination(card, cardsInPast, cardsInFuture));
        }

        return validDestinations;
    }

    getValidDestination(cardInHand: Card, cardsInPast: Card[], cardsInFuture: Card[]) {
        const validDestinations = [];

        for (const card of cardsInPast) {
            if (cardInHand.type.suit === card.type.suit || cardInHand.type.color === card.type.color) {
                validDestinations.push(card);
            }
        }

        if (cardsInFuture[cardInHand.type.value]) {
            validDestinations.push(cardsInFuture[cardInHand.type.value]);
        }

        return validDestinations;
    }
}
