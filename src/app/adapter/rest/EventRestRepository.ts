import type { EventRepository } from '@/app/adapter';
import type { Event, EventKey, ImportError, PositionKey, UserKey } from '@/app/types';
import { EventState } from '@/app/types';
import { getCsrfToken } from '@/app/adapter/rest/Csrf';

interface SlotRepresentation {
    key: string;
    order: number;
    required: boolean;
    positionKeys: string[];
    name?: string;
}
interface RegistrationRepresentation {
    positionKey: string;
    name?: string;
    userKey?: string;
    slotKey?: string;
}
interface LocationRepresentation {
    name: string;
    icon: string;
}
interface EventRepresentation {
    key: string;
    state: string;
    templateKey: string;
    name: string;
    description: string;
    start: string;
    end: string;
    locations: LocationRepresentation[];
    slots: SlotRepresentation[];
    registrations: RegistrationRepresentation[];
}

interface ImportErrorRepresentation {
    eventKey: string;
    eventName: string;
    start: string;
    end: string;
    message: string;
}

export class EventRestRepository implements EventRepository {
    public async findAll(year: number): Promise<Event[]> {
        const response = await fetch(`/api/v1/events/by-year/${year}`, {
            credentials: 'include',
        });
        if (!response.ok) {
            throw response;
        }
        const responseData: EventRepresentation[] = await response.clone().json();
        const events: Event[] = responseData.map(EventRestRepository.mapEventToDomain);
        events.push(this.generateWorkEvent(new Date(2024, 10, 2)));
        events.push(this.generateWorkEvent(new Date(2024, 10, 3)));
        events.push(this.generateWorkEvent(new Date(2024, 10, 9)));
        events.push(this.generateWorkEvent(new Date(2024, 10, 10)));
        events.push(this.generateWorkEvent(new Date(2024, 10, 16)));
        events.push(this.generateWorkEvent(new Date(2024, 10, 17)));
        events.push(this.generateWorkEvent(new Date(2024, 10, 23)));
        events.push(this.generateWorkEvent(new Date(2024, 10, 24)));
        events.push(this.generateWorkEvent(new Date(2024, 10, 30)));
        events.push(this.generateWorkEvent(new Date(2024, 11, 1)));
        events.push(this.generateWorkEvent(new Date(2024, 11, 7)));
        events.push(this.generateWorkEvent(new Date(2024, 11, 8)));
        events.push(this.generateWorkEvent(new Date(2024, 11, 14)));
        events.push(this.generateWorkEvent(new Date(2024, 11, 15)));
        events.push(this.generateWorkEvent(new Date(2024, 11, 21)));
        events.push(this.generateWorkEvent(new Date(2024, 11, 22)));
        return events;
    }

    public async importEvents(year: number, file: Blob): Promise<ImportError[]> {
        const formParams = new FormData();
        formParams.append('file', file);
        // don't add 'Content-Type': 'multipart/form-data' header, as this will break the upload!
        const response = await fetch(`/api/v1/import/events/${year}`, {
            method: 'POST',
            credentials: 'include',
            body: formParams,
            headers: {
                'X-XSRF-TOKEN': getCsrfToken(),
            },
        });
        if (!response.ok) {
            throw response;
        }
        const errors: ImportErrorRepresentation[] = await response.clone().json();

        const map = new Map<string, ImportError>();
        errors.forEach((err) => {
            const eventErrs = map.get(err.eventKey) || {
                eventName: err.eventName,
                messages: [],
                start: new Date(err.start),
                end: new Date(err.end),
            };
            map.set(err.eventKey, eventErrs);
            eventErrs.messages.push(err.message);
        });
        return [...map.values()].sort((a, b) => b.start.getTime() - a.start.getTime());
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async createEvent(event: Event): Promise<Event> {
        throw new Error('Diese Funktion ist noch nicht implementiert.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async joinWaitingList(eventKey: EventKey, teamMemberKey: UserKey, positionKey: PositionKey): Promise<Event> {
        throw new Error('Diese Funktion ist noch nicht implementiert. Bitte melde dich vorerst weiterhin im Büro.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async leaveWaitingList(eventKey: EventKey, teamMemberKey: UserKey): Promise<Event> {
        throw new Error('Diese Funktion ist noch nicht implementiert. Bitte melde dich vorerst weiterhin im Büro.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async updateEvent(eventKey: EventKey, updateRequest: Partial<Event>): Promise<Event> {
        throw new Error('Diese Funktion ist noch nicht implementiert.');
    }

    private static mapEventToDomain(eventRepresentation: EventRepresentation): Event {
        return {
            key: eventRepresentation.key,
            name: eventRepresentation.name,
            description: eventRepresentation.description,
            state: eventRepresentation.state as EventState,
            start: EventRestRepository.parseDate(eventRepresentation.start),
            end: EventRestRepository.parseDate(eventRepresentation.end),
            registrations: eventRepresentation.registrations.map((it) => ({
                positionKey: it.positionKey,
                userKey: it.userKey,
                name: it.name,
                slotKey: it.slotKey,
            })),
            locations: eventRepresentation.locations.map((locationRepresentation) => ({
                name: locationRepresentation.name,
                icon: locationRepresentation.icon,
            })),
            slots: eventRepresentation.slots.map((slotRepresentation) => ({
                key: slotRepresentation.key,
                required: slotRepresentation.required,
                order: slotRepresentation.order,
                positionKeys: slotRepresentation.positionKeys as PositionKey[],
                positionName: slotRepresentation.name,
            })),
            assignedUserCount: eventRepresentation.registrations.filter((it) => it.slotKey).length,
        };
    }

    private static parseDate(date: string): Date {
        // js cannot parse an ISO date time like 2024-06-25T00:00+02:00[Europe/Berlin]
        if (date.includes('[')) {
            return new Date(date.substring(0, date.indexOf('[')));
        }
        return new Date(date);
    }

    private generateWorkEvent(date: Date): Event {
        const start = new Date(date.getTime());
        start.setHours(9, 0, 0, 0);
        const end = new Date(date.getTime());
        end.setHours(17, 0, 0, 0);
        return {
            key: 'arbeitsdienst_' + date.toDateString(),
            state: EventState.OpenForSignup,
            name: 'Arbeitsdienst',
            description: '',
            start: start,
            end: end,
            locations: [
                {
                    name: 'Elsfleth',
                    icon: 'fa-hammer',
                },
            ],
            slots: [],
            registrations: [],
            assignedUserCount: 0,
        };
    }
}
