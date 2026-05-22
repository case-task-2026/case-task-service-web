import request from 'supertest'
import { createApp } from '../../src/app'
import { TaskApiClient } from '../../src/tasks/taskApiClient'
import {
  CreateTaskPayload,
  Task,
  UpdateTaskDetailsPayload,
  UpdateTaskStatusPayload
} from '../../src/tasks/taskTypes'

describe('task routes', () => {
  it('renders task list from API client', async () => {
    const taskApiClient = createFakeTaskApiClient({
      getTasks: jest.fn().mockResolvedValue([
        buildTask({
          id: '11111111-1111-1111-1111-111111111111',
          title: 'Prepare case bundle',
          description: 'Collect required documents',
          status: 'TODO',
          dueDateTime: '2026-06-12T16:30:00Z'
        }),
        buildTask({
          id: '22222222-2222-2222-2222-222222222222',
          title: 'Review evidence',
          description: null,
          status: 'IN_PROGRESS',
          dueDateTime: '2026-06-13T10:00:00Z'
        })
      ])
    })

    const app = createApp({ taskApiClient })

    const response = await request(app)
      .get('/tasks')
      .expect(200)

    expect(response.text).toContain('Tasks')
    expect(response.text).toContain('2 tasks found')
    expect(response.text).toContain('Prepare case bundle')
    expect(response.text).toContain('Collect required documents')
    expect(response.text).toContain('Review evidence')
    expect(response.text).toContain('To do')
    expect(response.text).toContain('In progress')
    expect(response.text).toContain('/tasks/11111111-1111-1111-1111-111111111111')
  })

  it('renders empty state when there are no tasks', async () => {
    const taskApiClient = createFakeTaskApiClient({
      getTasks: jest.fn().mockResolvedValue([])
    })

    const app = createApp({ taskApiClient })

    const response = await request(app)
      .get('/tasks')
      .expect(200)

    expect(response.text).toContain('There are no tasks yet. Create a task to get started.')
    expect(response.text).toContain('Create a task')
  })

  it('renders service error when API client fails', async () => {
    const taskApiClient = createFakeTaskApiClient({
      getTasks: jest.fn().mockRejectedValue(new Error('Backend unavailable'))
    })

    const app = createApp({ taskApiClient })

    const response = await request(app)
      .get('/tasks')
      .expect(502)

    expect(response.text).toContain('There is a problem with the task service')
    expect(response.text).toContain('The task API could not be reached')
  })

  function createFakeTaskApiClient(overrides: Partial<TaskApiClient>): TaskApiClient {
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
})