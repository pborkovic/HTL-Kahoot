/**
 * Represents a student user in the system.
 */
export interface StudentUser {
    /** Unique identifier for the student. */
    id: string;
    /** Email address of the student. */
    email: string;
    /** Unique username, if provided. */
    username: string | null;
    /** Display name (e.g., "John Doe"), if provided. */
    display_name: string | null;
    /** Class name the student belongs to (e.g., "3AHIF"), if provided. */
    class_name: string | null;
    /** Name of the authentication provider used (e.g., "google"). */
    auth_provider: string;
    /** Whether the student account is currently active. */
    is_active: boolean;
    /** Timestamp of the student's most recent login. */
    last_login_at: string | null;
    /** Timestamp when the student account was created. */
    created_at: string;
    /** Timestamp when the student account was last updated. */
    updated_at: string;
    /** Timestamp when the student account was deleted (soft delete). */
    deleted_at: string | null;
    /** List of roles assigned to the student user. */
    roles: string[];
}

/**
 * Paginated response containing a list of student users.
 */
export interface StudentsResponse {
    /** Array of student user objects. */
    data: StudentUser[];
    /** Pagination metadata for the students list. */
    meta: {
        /** Current page number. */
        current_page: number;
        /** Total number of pages available. */
        last_page: number;
        /** Number of items per page. */
        per_page: number;
        /** Total number of students found. */
        total: number;
    };
}

/**
 * Information about a specific class and its student count.
 */
export interface ClassInfo {
    /** The name of the class (e.g., "4BHIF"). */
    class_name: string;
    /** Total number of students enrolled in this class. */
    student_count: number;
}

/**
 * Response containing a list of classes.
 */
export interface ClassesResponse {
    /** Array of class information objects. */
    data: ClassInfo[];
}
