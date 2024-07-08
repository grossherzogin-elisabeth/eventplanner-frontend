import type { AuthRepository, EventRepository } from '@/app/adapter';
import type {
    Event,
    EventKey,
    ImportError,
    PositionKey,
    Registration,
    Slot,
    SlotKey,
    User,
    UserKey,
} from '@/app/types';
import type { Cache } from '@/lib/utils';
import { ArrayUtils, DateUtils, Formatter } from '@/lib/utils';

export class EventService {
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
            const title = `Anmeldung: ${event.name} am ${Formatter.formatDate(event.start)}`;
            const message = `Moin liebes Büro Team,

Ich möchte mich gerne für die Reise "${event.name}" am ${Formatter.formatDate(event.start)} auf die Warteliste setzen lassen. Kontaktiert mich gerne, wenn hier noch ein Platz frei ist oder wird.

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
            const title = `Absage: ${event.name} am ${Formatter.formatDate(event.start)}`;
            const message = `Moin liebes Büro Team,

Leider kann ich an der Reise "${event.name}" am ${Formatter.formatDate(event.start)} nicht teilnehmen. Bitte streicht mich von der Crew Liste.

Viele Grüße,`;
            this.openEmail(title, message);
            return event;
        }
    }

    public doesEventMatchFilter(event: Event, filter: string): boolean {
        const filterLc = filter.toLowerCase();
        if (event.name.toLowerCase().includes(filterLc)) {
            return true;
        }
        if (event.description.toLowerCase().includes(filterLc)) {
            return true;
        }
        for (const location of event.locations) {
            if (location.name.toLowerCase().includes(filterLc)) {
                return true;
            }
            if (location.country?.toLowerCase().includes(filterLc)) {
                return true;
            }
        }
        return false;
    }

    public doEventsHaveOverlappingDays(a?: Event, b?: Event): boolean {
        if (a === undefined || b === undefined) {
            return false;
        }

        const aStart = DateUtils.cropToPrecision(a.start, 'days').getTime();
        const aEnd = DateUtils.cropToPrecision(a.end, 'days').getTime();
        const bStart = DateUtils.cropToPrecision(b.start, 'days').getTime();
        const bEnd = DateUtils.cropToPrecision(b.end, 'days').getTime();

        return (aEnd >= bStart && aEnd <= bEnd) || (bEnd >= aStart && bEnd <= aEnd);
    }

    public async importEvents(year: number, file: Blob): Promise<ImportError[]> {
        return this.eventRepository.importEvents(year, file);
    }

    public assignUserToSlot(event: Event, user: User, slotKey: SlotKey): Event {
        const slot = event.slots.find((it) => it.key === slotKey);
        if (!slot) {
            throw new Error('Failed to resolve slot');
        }
        if (!slot.positionKeys.find((positionkey) => user.positionKeys.includes(positionkey))) {
            throw new Error('User does not have the required position');
        }
        const registration = event.registrations.find((it) => it.userKey === user.key);
        if (!registration) {
            throw new Error('Failed to resolve user registration');
        }
        this.clearSlot(event, slotKey);
        registration.slotKey = slotKey;
        event.assignedUserCount++;
        this.debugSlots(event);
        return event;
    }

    public assignGuestToSlot(event: Event, name: string, slotKey: SlotKey): Event {
        const slot = event.slots.find((it) => it.key === slotKey);
        if (!slot) {
            throw new Error('Failed to resolve slot');
        }
        const registration = event.registrations.find((it) => it.name === name);
        if (!registration) {
            throw new Error('Failed to resolve guest registration');
        }
        this.clearSlot(event, slotKey);
        registration.slotKey = slotKey;
        event.assignedUserCount++;
        return event;
    }

    public unassignSlot(event: Event, slotKey: SlotKey): Event {
        const slot = event.slots.find((it) => it.key === slotKey);
        if (!slot) {
            throw new Error('Failed to resolve slot');
        }
        event = this.clearSlot(event, slotKey);
        event = this.optimizeSlots(event);
        return event;
    }

    public cancelUserRegistration(event: Event, userKey?: UserKey): Event {
        event.registrations = event.registrations.filter((it) => it.userKey !== userKey);
        return event;
    }

    public cancelGuestRegistration(event: Event, name?: string): Event {
        event.registrations = event.registrations.filter((it) => it.name !== name);
        return event;
    }

    public clearSlot(event: Event, slotKey: SlotKey): Event {
        const currentRegistrationInSlot = event.registrations.find((it) => it.slotKey === slotKey);
        if (currentRegistrationInSlot) {
            currentRegistrationInSlot.slotKey = undefined;
            event.assignedUserCount--;
        }
        return event;
    }

    public canUserBeAssignedToSlot(event: Event, user: User, slotKey: SlotKey): boolean {
        const slot = event.slots.find((it) => it.key === slotKey);
        if (!slot) {
            return false;
        }
        const registration = event.registrations.find((it) => it.userKey === user.key);
        if (!registration) {
            return false;
        }
        return slot.positionKeys.find((positionkey) => user.positionKeys.includes(positionkey)) !== undefined;
    }

    public getOpenSlots(event: Event): Slot[] {
        const usedSlotKeys = event.registrations.map((it) => it.slotKey).filter(ArrayUtils.filterUndefined);
        return event.slots.filter((it) => !usedSlotKeys.includes(it.key));
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
            `DTSTAMP:${this.formatIcsDate(new Date())}`,
            'ORGANIZER;CN=Grossherzogin Elisabeth e.V.:MAILTO:office@grossherzogin-elisabeth.de',
            `DTSTART:${this.formatIcsDate(event.start)}`,
            `DTEND:${this.formatIcsDate(event.end)}`,
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

    /**
     * Reorders slots to make sure the higher ranked slots are filled first, making space for lower qualified
     * team members
     * @param event
     */
    private optimizeSlots(event: Event): Event {
        const slotMap = new Map<SlotKey | undefined, Registration | undefined>();
        event.registrations.forEach((it) => slotMap.set(it.slotKey, it));

        for (let i = 0; i < event.slots.length; i++) {
            const slot = event.slots[i];
            if (!slotMap.has(slot.key)) {
                for (let j = i + 1; j < event.slots.length; j++) {
                    const nextSlot = event.slots[j];
                    const registration = slotMap.get(nextSlot?.key);
                    if (registration && slot.positionKeys.includes(registration.positionKey)) {
                        // move registration to higher prio slot
                        registration.slotKey = slot.key;
                        slotMap.set(slot.key, registration);
                        slotMap.delete(nextSlot.key);
                        break;
                    }
                }
            }
        }
        return event;
    }

    private debugSlots(event: Event) {
        console.log(
            event.slots
                .map((s) => event.registrations.find((r) => r.slotKey === s.key))
                .map((it) => ({
                    user: it?.userKey || it?.name,
                    position: it?.positionKey,
                }))
        );
    }

    private formatIcsDate(date: Date): string {
        const year = String(date.getFullYear());
        let month = String(date.getMonth() + 1);
        if (month.length === 1) month = `0${month}`;
        let day = String(date.getDate());
        if (day.length === 1) day = `0${day}`;
        let hour = String(date.getHours());
        if (hour.length === 1) hour = `0${hour}`;
        let minute = String(date.getMinutes());
        if (minute.length === 1) minute = `0${minute}`;
        return `${year}${month}${day}T${hour}${minute}00Z`;
    }

    private async fetchEvents(year: number): Promise<Event[]> {
        const events = await this.eventRepository.findAll(year);
        const signedInUser = this.authRepository.getSignedInUser();
        events.forEach((evt) => {
            const registration = evt.registrations.find((it) => it.userKey === signedInUser?.key);
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
