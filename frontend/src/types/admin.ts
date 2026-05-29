export interface ServiceStatus {
    status: "up" | "down";
    latency_ms?: number;
    pending?: number;
    failed?: number;
    driver?: string;
    disk?: string;
    error?: string;
}

export interface SystemStatus {
    app: {
        name: string;
        env: string;
        debug: boolean;
        php_version: string;
        laravel_version: string;
        timezone: string;
        now: string;
    };
    services: {
        database: ServiceStatus;
        redis: ServiceStatus;
        queue: ServiceStatus;
        storage: ServiceStatus;
    };
}

export interface PlatformMetrics {
    users: {
        total: number;
        active: number;
        by_role: Record<string, number>;
    };
    content: {
        questions: number;
        questions_published: number;
        quizzes: number;
        departments: number;
    };
    sessions: {
        total: number;
        active: number;
    };
    feedback: {
        open: number;
        resolved: number;
    };
}
