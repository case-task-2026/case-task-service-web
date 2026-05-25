import request from 'supertest'
import { createApp } from '../../src/app'
import { TaskApiClient, TaskApiError } from '../../src/tasks/taskApiClient'
import {
  CreateTaskPayload,
  Task,
  UpdateTaskDetailsPayload,
  UpdateTaskStatusPayload
} from '../../src/tasks/taskTypes'

describe('task delete routes', () => {
  it('renders delete confirmation page', async () => {
    const task = buildTask({
      id: '11111111-1111-1111-1111-111111111111',
      title: 'Delete this task',
      description: 'Task to be deleted',
      status: 'TODO'
    })

    const getTask = jest.fn().mockResolvedValue(task)

    const app = createApp({
      taskApiClient: createFakeTaskApiClient({
        getTask
      })
    })

    const response = await request(app)
      .get(`/tasks/${task.id}/delete`)
      .expect(200)

    expect(getTask).toHaveBeenCalledWith(task.id)
    expect(response.text).toContain('Are you sure you want to delete this task?')
    expect(response.text).toContain('Delete this task')
    expect(response.text).toContain('Task to be deleted')
    expect(response.text).toContain('This action cannot be undone')
    expect(response.text).toContain('Delete task')
    expect(response.text).toContain(`/tasks/${task.id}/delete`)
    expect(response.text).toContain(`/tasks/${task.id}`)
  })

  it('deletes task and redirects to task list', async () => {
    const taskId = '22222222-2222-2222-2222-222222222222'
    const deleteTask = jest.fn().mockResolvedValue(undefined)

    const app = createApp({
      taskApiClient: createFakeTaskApiClient({
        deleteTask
      })
    })

    await request(app)
      .post(`/tasks/${taskId}/delete`)
      .type('form')
      .send({})
      .expect(302)
      .expect('Location', '/tasks')

    expect(deleteTask).toHaveBeenCalledWith(taskId)
  })

  it('renders not found page when opening delete confirmation for missing task', async () => {
    const taskId = '33333333-3333-3333-3333-333333333333'

    const app = createApp({
      taskApiClient: createFakeTaskApiClient({
        getTask: jest.fn().mockRejectedValue(
          new TaskApiError({
            status: 404,
            error: 'Not Found',
            message: `Task with id '${taskId}' was not found`,
            path: `/tasks/${taskId}`
          })
        )
      })
    })

    const response = await request(app)
      .get(`/tasks/${taskId}/delete`)
      .expect(404)

    expect(response.text).toContain('Task not found')
    expect(response.text).toContain(`Task with id &#39;${taskId}&#39; was not found`)
    expect(response.text).toContain('Return to the task list')
  })

  it('renders not found page when deleting missing task', async () => {
    const taskId = '44444444-4444-4444-4444-444444444444'

    const app = createApp({
      taskApiClient: createFakeTaskApiClient({
        deleteTask: jest.fn().mockRejectedValue(
          new TaskApiError({
            status: 404,
            error: 'Not Found',
            message: `Task with id '${taskId}' was not found`,
            path: `/tasks/${taskId}`
          })
        )
      })
    })

    const response = await request(app)
      .post(`/tasks/${taskId}/delete`)
      .type('form')
      .send({})
      .expect(404)

    expect(response.text).toContain('Task not found')
    expect(response.text).toContain(`Task with id &#39;${taskId}&#39; was not found`)
  })

  it('renders service error when delete confirmation cannot load task', async () => {
    const taskId = '55555555-5555-5555-5555-555555555555'

    const app = createApp({
      taskApiClient: createFakeTaskApiClient({
        getTask: jest.fn().mockRejectedValue(new Error('Backend unavailable'))
      })
    })

    const response = await request(app)
      .get(`/tasks/${taskId}/delete`)
      .expect(502)

    expect(response.text).toContain('There is a problem with the task service')
    expect(response.text).toContain('The task could not be loaded')
  })

  it('renders service error when delete request fails', async () => {
    const taskId = '66666666-6666-6666-6666-666666666666'

    const app = createApp({
      taskApiClient: createFakeTaskApiClient({
        deleteTask: jest.fn().mockRejectedValue(new Error('Backend unavailable'))
      })
    })

    const response = await request(app)
      .post(`/tasks/${taskId}/delete`)
      .type('form')
      .send({})
      .expect(502)

    expect(response.text).toContain('There is a problem with the task service')
    expect(response.text).toContain('The task could not be deleted')
  })

  function createFakeTaskApiClient(overrides: Partial<TaskApiClient> = {}): TaskApiClient {
    return {
      createTask: jest.fn<Promise<Task>, [CreateTaskPayload]>(),
      getTasks: jest.fn<Promise<Task[]>, []>().mockResolvedValue([]),
      getTask: jest.fn<Promise<Task>, [string]>(),
      updateTaskDetails: jest.fn<Promise<Task>, [string, UpdateTaskDetailsPayload]>(),
      updateTaskStatus: jest.fn<Promise<Task>, [string, UpdateTaskStatusPayload]>(),
      deleteTask: jest.fn<Promise<void>, [string]>(),
      ...overrides
    }
  }

  function buildTask(overrides: Partial<Task> = {}): Task {
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
})