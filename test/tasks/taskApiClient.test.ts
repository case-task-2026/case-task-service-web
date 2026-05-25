import {
    HttpTaskApiClient,
    TaskApiConnectionError,
    TaskApiError
} from '../../src/tasks/taskApiClient'
import { CreateTaskPayload, Task } from '../../src/tasks/taskTypes'

describe('HttpTaskApiClient', () => {
  const baseUrl = 'http://task-api.test'

  it('creates a task', async () => {
    const createdTask = buildTask({
      id: '11111111-1111-1111-1111-111111111111',
      title: 'Prepare case bundle'
    })

    const fetchFunction = jest.fn().mockResolvedValue(
      jsonResponse(201, createdTask)
    )

    const client = new HttpTaskApiClient(baseUrl, fetchFunction)

    const payload: CreateTaskPayload = {
      title: 'Prepare case bundle',
      description: 'Collect required documents',
      dueDateTime: '2026-06-12T16:30:00Z'
    }

    const result = await client.createTask(payload)

    expect(result).toEqual(createdTask)
    expect(fetchFunction).toHaveBeenCalledWith(
      'http://task-api.test/tasks',
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }
    )
  })

  it('gets all tasks', async () => {
    const tasks = [
      buildTask({
        id: '11111111-1111-1111-1111-111111111111',
        title: 'First task'
      }),
      buildTask({
        id: '22222222-2222-2222-2222-222222222222',
        title: 'Second task'
      })
    ]

    const fetchFunction = jest.fn().mockResolvedValue(
      jsonResponse(200, tasks)
    )

    const client = new HttpTaskApiClient(`${baseUrl}/`, fetchFunction)

    const result = await client.getTasks()

    expect(result).toEqual(tasks)
    expect(fetchFunction).toHaveBeenCalledWith(
      'http://task-api.test/tasks',
      {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      }
    )
  })

  it('gets a task by id', async () => {
    const task = buildTask({
      id: '33333333-3333-3333-3333-333333333333',
      title: 'Review evidence'
    })

    const fetchFunction = jest.fn().mockResolvedValue(
      jsonResponse(200, task)
    )

    const client = new HttpTaskApiClient(baseUrl, fetchFunction)

    const result = await client.getTask(task.id)

    expect(result).toEqual(task)
    expect(fetchFunction).toHaveBeenCalledWith(
      `http://task-api.test/tasks/${task.id}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      }
    )
  })

  it('updates task details', async () => {
    const task = buildTask({
      id: '44444444-4444-4444-4444-444444444444',
      title: 'Updated title'
    })

    const fetchFunction = jest.fn().mockResolvedValue(
      jsonResponse(200, task)
    )

    const client = new HttpTaskApiClient(baseUrl, fetchFunction)

    const payload = {
      title: 'Updated title',
      description: 'Updated description',
      dueDateTime: '2026-07-01T10:00:00Z'
    }

    const result = await client.updateTaskDetails(task.id, payload)

    expect(result).toEqual(task)
    expect(fetchFunction).toHaveBeenCalledWith(
      `http://task-api.test/tasks/${task.id}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }
    )
  })

  it('updates task status', async () => {
    const task = buildTask({
      id: '55555555-5555-5555-5555-555555555555',
      title: 'Update status',
      status: 'IN_PROGRESS'
    })

    const fetchFunction = jest.fn().mockResolvedValue(
      jsonResponse(200, task)
    )

    const client = new HttpTaskApiClient(baseUrl, fetchFunction)

    const result = await client.updateTaskStatus(task.id, {
      status: 'IN_PROGRESS'
    })

    expect(result).toEqual(task)
    expect(fetchFunction).toHaveBeenCalledWith(
      `http://task-api.test/tasks/${task.id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'IN_PROGRESS'
        }),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }
    )
  })

  it('deletes task', async () => {
    const fetchFunction = jest.fn().mockResolvedValue(
      emptyResponse(204)
    )

    const client = new HttpTaskApiClient(baseUrl, fetchFunction)

    await client.deleteTask('66666666-6666-6666-6666-666666666666')

    expect(fetchFunction).toHaveBeenCalledWith(
      'http://task-api.test/tasks/66666666-6666-6666-6666-666666666666',
      {
        method: 'DELETE',
        headers: {
          Accept: 'application/json'
        }
      }
    )
  })

  it('throws TaskApiError when backend returns structured error response', async () => {
    const fetchFunction = jest.fn().mockResolvedValue(
      jsonResponse(404, {
        status: 404,
        error: 'Not Found',
        message: "Task with id 'missing-id' was not found",
        path: '/tasks/missing-id'
      })
    )

    const client = new HttpTaskApiClient(baseUrl, fetchFunction)

    await expect(client.getTask('missing-id')).rejects.toMatchObject({
      name: 'TaskApiError',
      status: 404,
      error: 'Not Found',
      message: "Task with id 'missing-id' was not found",
      path: '/tasks/missing-id'
    })
  })

  it('throws fallback TaskApiError when backend error body is not json', async () => {
    const fetchFunction = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
    })

    const client = new HttpTaskApiClient(baseUrl, fetchFunction)

    try {
      await client.getTasks()
      throw new Error('Expected client.getTasks() to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(TaskApiError)
      expect(error).toMatchObject({
        status: 500,
        error: 'Internal Server Error',
        message: 'The task service request failed'
      })
    }
  })

  it('throws TaskApiConnectionError when fetch fails before receiving a response', async () => {
    const originalError = new Error('ECONNREFUSED')
    const fetchFunction = jest.fn().mockRejectedValue(originalError)

    const client = new HttpTaskApiClient(baseUrl, fetchFunction)

    try {
      await client.getTasks()
      throw new Error('Expected client.getTasks() to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(TaskApiConnectionError)
      expect(error).toMatchObject({
        name: 'TaskApiConnectionError',
        baseUrl,
        originalError
      })
    }
  })

  function buildTask(overrides: Partial<Task>): Task {
    return {
      id: '00000000-0000-0000-0000-000000000000',
      title: 'Task title',
      description: null,
      status: 'TODO',
      dueDateTime: '2026-06-12T16:30:00Z',
      createdAt: '2026-05-14T09:30:00Z',
      updatedAt: '2026-05-14T09:30:00Z',
      ...overrides
    }
  }

  function jsonResponse(status: number, body: unknown): Response {
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 404 ? 'Not Found' : 'OK',
      json: jest.fn().mockResolvedValue(body)
    } as unknown as Response
  }

  function emptyResponse(status: number): Response {
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: 'No Content',
      json: jest.fn()
    } as unknown as Response
  }
})