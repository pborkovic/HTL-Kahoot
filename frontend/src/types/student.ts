export interface StudentUser {
    id: string;
    email: string;
    username: string | null;
    display_name: string | null;
    class_name: string | null;
    auth_provider: string;
    is_active: boolean;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    roles: string[];
}

export interface StudentsResponse {
    data: StudentUser[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface ClassInfo {
    class_name: string;
    student_count: number;
}

export interface ClassesResponse {
    data: ClassInfo[];
}
