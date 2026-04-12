/**
 * Interface for a quiz session participant.
 */
export interface Participant {
    /** The unique identifier of the participant. */
    id: string;
    /** The nickname of the participant. */
    nickname: string;
    /** Indicates if the participant is currently connected. */
    is_connected: boolean;
    /** The timestamp when the participant joined the session. */
    joined_at: string;
}
