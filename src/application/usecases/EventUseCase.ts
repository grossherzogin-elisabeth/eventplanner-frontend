import type { AuthRepository } from '@/application/ports/AuthRepository';
import type { EventRepository } from '@/application/ports/EventRepository';
import type { Cache } from '@/common';
import { DateFormatter } from '@/common/date';
import type { Event, EventKey, ImportError, PositionKey, Registration, UserKey } from '@/domain';

export class EventUseCase {
    private readonly eventRepository: EventRepository;
    private readonly authRepository: AuthRepository;
    private readonly cache: Cache<EventKey, Event>;

    constructor(params: {
        eventRepository: EventRepository;
        authRepository: AuthRepository;
        eventCache: Cache<EventKey, Event>;
    }) {
        this.eventRepository = params.eventRepository;
        this.authRepository = params.authRepository;
        this.cache = params.eventCache;
    }

    public async getEvents(year: number): Promise<Event[]> {
        let cached = await this.cache.findAll();
        cached = cached
            .filter((it) => it.start.getFullYear() === year)
            .sort((a, b) => a.start.getTime() - b.start.getTime());
        if (cached.length > 0) {
            return cached;
        }
        return this.fetchEvents(year);
    }

    public async getEventByKey(year: number, eventKey: EventKey): Promise<Event> {
        let event = await this.cache.findByKey(eventKey);
        if (event) {
            return event;
        }
        const events = await this.getEvents(year);
        event = events.find((it) => it.key === eventKey);
        if (event) {
            return event;
        }
        throw new Error('not found');
    }

    public async getEventsByUser(year: number, userKey: UserKey): Promise<Event[]> {
        const events = await this.getEvents(year);
        return events.filter((evt) => evt.registrations.find((reg) => reg.userKey === userKey));
    }

    public async getFutureEventsByUser(userKey: UserKey): Promise<Event[]> {
        const now = new Date();
        const events = await this.getEvents(now.getFullYear());
        return events
            .filter((evt) => evt.start > now)
            .filter((evt) => evt.registrations.find((reg) => reg.userKey === userKey));
    }

    public async updateEvent(eventKey: EventKey, event: Partial<Event>): Promise<Event> {
        const savedEvent = await this.eventRepository.updateEvent(eventKey, event);
        return this.updateCache(savedEvent);
    }

    public async createEvent(event: Event): Promise<Event> {
        const savedEvent = await this.eventRepository.createEvent(event);
        return this.updateCache(savedEvent);
    }

    public async joinEvent(event: Event, positionKey: PositionKey): Promise<Event> {
        const user = this.authRepository.getSignedInUser();
        if (!user) {
            throw new Error('401');
        }
        try {
            const savedEvent = await this.eventRepository.joinWaitingList(event.key, user.key, positionKey);
            return this.updateCache(savedEvent);
        } catch (e) {
            const title = `Anmeldung: ${event.name} am ${DateFormatter.formatDate(event.start)}`;
            const message = `Moin liebes Büro Team,

Ich möchte mich gerne für die Reise "${event.name}" am ${DateFormatter.formatDate(event.start)} auf die Warteliste setzen lassen. Kontaktiert mich gerne, wenn hier noch ein Platz frei ist oder wird.

Viele Grüße,`;
            this.openEmail(title, message);
            return event;
        }
    }

    public async leaveEvent(event: Event): Promise<Event> {
        const user = this.authRepository.getSignedInUser();
        if (!user) {
            throw new Error('401');
        }
        try {
            const savedEvent = await this.eventRepository.leaveWaitingList(event.key, user.key);
            return this.updateCache(savedEvent);
        } catch (e) {
            const title = `Absage: ${event.name} am ${DateFormatter.formatDate(event.start)}`;
            const message = `Moin liebes Büro Team,

Leider kann ich an der Reise "${event.name}" am ${DateFormatter.formatDate(event.start)} nicht teilnehmen. Bitte streicht mich von der Crew Liste.

Viele Grüße,`;
            this.openEmail(title, message);
            return event;
        }
    }

    public async importEvents(year: number, file: Blob): Promise<ImportError[]> {
        return this.eventRepository.importEvents(year, file);
    }

    public downloadCalendarEntry(event: Event): void {
        // create ics file
        const lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            `UID:${event.key}@großherzogin-elisabeth.de`,
            `LOCATION:${event.locations[0]?.address || event.locations[0]?.name}`,
            `DTSTAMP:${DateFormatter.formatIcsDate(new Date())}`,
            'ORGANIZER;CN=Grossherzogin Elisabeth e.V.:MAILTO:office@grossherzogin-elisabeth.de',
            `DTSTART:${DateFormatter.formatIcsDate(event.start)}`,
            `DTEND:${DateFormatter.formatIcsDate(event.end)}`,
            `SUMMARY:${event.name}`,
            `DESCRIPTION:${event.description}`,
            'END:VEVENT',
            'BEGIN:VALARM',
            'DESCRIPTION:REMINDER',
            'TRIGGER;RELATED=START:-P1W', // reminder 1 week before event
            'ACTION:DISPLAY',
            'END:VALARM',
            'END:VCALENDAR',
        ];
        // download ics file
        try {
            const downloadElement = document.createElement('a');
            downloadElement.setAttribute(
                'href',
                'data:text/plain;charset=utf-8,' + encodeURIComponent(lines.join('\n'))
            );
            downloadElement.setAttribute('download', 'Event.ics');
            downloadElement.style.display = 'none';
            document.body.appendChild(downloadElement);
            downloadElement.click();
            document.body.removeChild(document);
        } catch (e) {
            // ignore
        }
    }

    private async fetchEvents(year: number): Promise<Event[]> {
        const events = await this.eventRepository.findAll(year);
        const signedInUser = this.authRepository.getSignedInUser();
        events.forEach((evt: Event) => {
            const registration = evt.registrations.find((it: Registration) => it.userKey === signedInUser?.key);
            if (registration?.slotKey) {
                evt.signedInUserAssignedPosition = registration.positionKey;
            } else if (registration) {
                evt.signedInUserWaitingListPosition = registration.positionKey;
            }
        });
        await this.cache.saveAll(events);
        return events;
    }

    private async updateCache(event: Event): Promise<Event> {
        if ((await this.cache.count()) > 0) {
            return await this.cache.save(event);
        }
        return event;
    }

    private openEmail(subject: string, body: string): void {
        const email = `mailto:office@grossherzogin-elisabeth.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(email, '_blank');
    }
}
