import {
  ApiErrorResponse,
  CreateTaskPayload,
  Task,
  UpdateTaskDetailsPayload,
  UpdateTaskStatusPayload
} from './taskTypes'

export interface TaskApiClient {
  createTask(payload: CreateTaskPayload): Promise<Task>

  getTasks(): Promise<Task[]>

  getTask(taskId: string): Promise<Task>

  updateTaskDetails(taskId: string, payload: UpdateTaskDetailsPayload): Promise<Task>

  updateTaskStatus(taskId: string, payload: UpdateTaskStatusPayload): Promise<Task>

  deleteTask(taskId: string): Promise<void>
}

export class TaskApiError extends Error {
  readonly status: number
  readonly error: string
  readonly path?: string
  readonly fieldErrors?: ApiErrorResponse['fieldErrors']

  constructor(errorResponse: ApiErrorResponse) {
    super(errorResponse.message)

    this.name = 'TaskApiError'
    this.status = errorResponse.status
    this.error = errorResponse.error
    this.path = errorResponse.path
    this.fieldErrors = errorResponse.fieldErrors
  }
}

export class HttpTaskApiClient implements TaskApiClient {
  private readonly baseUrl: string
  private readonly fetchFunction: typeof fetch

  constructor(baseUrl: string, fetchFunction: typeof fetch = fetch) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.fetchFunction = fetchFunction
  }

  async createTask(payload: CreateTaskPayload): Promise<Task> {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }

  async getTasks(): Promise<Task[]> {
    return this.request<Task[]>('/tasks', {
      method: 'GET'
    })
  }

  async getTask(taskId: string): Promise<Task> {
    return this.request<Task>(`/tasks/${encodeURIComponent(taskId)}`, {
      method: 'GET'
    })
  }

  async updateTaskDetails(taskId: string, payload: UpdateTaskDetailsPayload): Promise<Task> {
    return this.request<Task>(`/tasks/${encodeURIComponent(taskId)}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  }

  async updateTaskStatus(taskId: string, payload: UpdateTaskStatusPayload): Promise<Task> {
    return this.request<Task>(`/tasks/${encodeURIComponent(taskId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    })
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.request<void>(`/tasks/${encodeURIComponent(taskId)}`, {
      method: 'DELETE'
    })
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const response = await this.fetchFunction(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers
      }
    })

    if (!response.ok) {
      throw await this.toTaskApiError(response)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return response.json() as Promise<T>
  }

  private async toTaskApiError(response: Response): Promise<TaskApiError> {
    const fallbackErrorResponse: ApiErrorResponse = {
      status: response.status,
      error: response.statusText || 'Request failed',
      message: 'The task service request failed',
      path: ''
    }

    try {
      const body = await response.json()

      return new TaskApiError({
        ...fallbackErrorResponse,
        ...(body as Partial<ApiErrorResponse>)
      })
    } catch {
      return new TaskApiError(fallbackErrorResponse)
    }
  }
}