/**
 * Interface for a department (school division) that questions can belong to.
 */
export interface Department {
    id: string;
    name: string;
    slug: string;
    display_order: number;
}

/**
 * Response shape for the GET /v1/departments endpoint.
 */
export interface DepartmentsResponse {
    data: Department[];
}
