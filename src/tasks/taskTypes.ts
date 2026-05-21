export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED'

export interface Task {
    readonly id: string
    readonly title: string
    readonly description: string | null
    readonly status: TaskStatus
    readonly dueDateTime: string
    readonly createdAt: string
    readonly updatedAt: string
}

export interface CreateTaskPayload {
    readonly title: string
    readonly description: string | null
    readonly dueDateTime: string
}

export interface UpdateTaskDetailsPayload {
    readonly title: string
    readonly description: string | null
    readonly dueDateTime: string
}

export interface UpdateTaskStatusPayload {
    readonly status: TaskStatus
}

export interface ApiFieldError {
    readonly field: string
    readonly message: string
}

export interface ApiErrorResponse {
    readonly status: number
    readonly error: string
    readonly message: string
    readonly path: string
    readonly timestamp?: string
    readonly fieldErrors?: ApiFieldError[]
}