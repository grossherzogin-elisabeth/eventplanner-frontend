export enum EventState {
    /**
     * event was created, but is not yet open for user signup
     */
    Draft = 'draft',
    /**
     * users can sign up for this event, the event team is not planned yet
     */
    OpenForSignup = 'open-for-signup',
    /**
     * event team is planned, team members can still sign up to the waiting list
     */
    Planned = 'planned',
    /**
     * event is in past
     */
    Past = 'past',
    /**
     * event was canceled
     */
    Canceled = 'canceled',
    /**
     * signup for this event is disabled
     */
    Disabled = 'disabled',
}
