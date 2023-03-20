import { gameSocket } from '..';
import { EventType, IEvent } from '../types/event.interface';

class EventService {

    static emitEvent(event: IEvent) {
        console.log('-----------');
        console.log('-----------');
        console.log('-----------');
        console.log(event.type);
        console.log('-----------');
        console.log('-----------');
        console.log('-----------');

        switch (event.type) {
            case EventType.GAME_UPDATE:
                gameSocket.to(`game-${event.payload.id}`).emit(EventType.GAME_UPDATE, event.payload);
                break;
            case EventType.ACTIVE_GAMES_UPDATE:
                gameSocket.emit(EventType.ACTIVE_GAMES_UPDATE, event.payload);
                break;
        }
    }
}

export default EventService;
