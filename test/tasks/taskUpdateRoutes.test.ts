import request from 'supertest'
import { createApp } from '../../src/app'
import { TaskApiClient } from '../../src/tasks/taskApiClient'
import {
  CreateTaskPayload,
  Task,
  UpdateTaskDetailsPayload,
  UpdateTaskStatusPayload
} from '../../src/tasks/taskTypes'

describe('task update routes', () => {
  it('renders update task details form', async () => {
    const task = buildTask({
      id: '11111111-1111-1111-1111-111111111111',
      title: 'Existing task',
      description: 'Existing description'
    })

    const app = createApp({
      taskApiClient: createFakeTaskApiClient({
        getTask: jest.fn().mockResolvedValue(task)
      })
    })

    const response = await request(app)
      .get(`/tasks/${task.id}/edit`)
      .expect(200)

    expect(response.text).toContain('Update task')
    expect(response.text).toContain('Existing task')
    expect(response.text).toContain('Existing description')
    expect(response.text).toContain('2026-06-12')
    expect(response.text).toContain('16:30')
  })

  it('updates task details and redirects to details page', async () => {
    const task = buildTask({
      id: '22222222-2222-2222-2222-222222222222',
      title: 'Updated task'
    })

    const updateTaskDetails = jest.fn().mockResolvedValue(task)

    const app = createApp({
      taskApiClient: createFakeTaskApiClient({
        updateTaskDetails
      })
    })

    await request(app)
      .post(`/tasks/${task.id}/edit`)
      .type('form')
      .send({
        title: 'Updated task',
        description: 'Updated description',
        dueDate: '2026-07-01',
        dueTime: '10:30'
      })
      .expect(302)
      .expect('Location', `/tasks/${task.id}`)

    expect(updateTaskDetails).toHaveBeenCalledWith(task.id, {
      title: 'Updated task',
      description: 'Updated description',
      dueDateTime: '2026-07-01T10:30:00Z'
    })
  })

  it('re-renders update task details form with validation errors', async () => {
    const taskId = '33333333-3333-3333-3333-333333333333'
    const updateTaskDetails = jest.fn()

    const app = createApp({
      taskApiClient: createFakeTaskApiClient({
        updateTaskDetails
      })
    })

    const response = await request(app)
      .post(`/tasks/${taskId}/edit`)
      .type('form')
      .send({
        title: '',
        description: '',
        dueDate: '',
        dueTime: ''
      })
      .expect(400)

    expect(response.text).toContain('There is a problem')
    expect(response.text).toContain('Enter a task title')
    expect(response.text).toContain('Enter a due date')
    expect(response.text).toContain('Enter a due time')
    expect(updateTaskDetails).not.toHaveBeenCalled()
  })

  it('renders update status form', async () => {
    const task = buildTask({
      id: '44444444-4444-4444-4444-444444444444',
      title: 'Status task',
      status: 'IN_PROGRESS'
    })

    const app = createApp({
      taskApiClient: createFakeTaskApiClient({
        getTask: jest.fn().mockResolvedValue(task)
      })
    })

    const response = await request(app)
      .get(`/tasks/${task.id}/status`)
      .expect(200)

    expect(response.text).toContain('Update task status')
    expect(response.text).toContain('Status task')
    expect(response.text).toContain('value="IN_PROGRESS" checked')
  })

  it('updates task status and redirects to details page', async () => {
    const task = buildTask({
      id: '55555555-5555-5555-5555-555555555555',
      status: 'COMPLETED'
    })

    const updateTaskStatus = jest.fn().mockResolvedValue(task)

    const app = createApp({
      taskApiClient: createFakeTaskApiClient({
        updateTaskStatus
      })
    })

    await request(app)
      .post(`/tasks/${task.id}/status`)
      .type('form')
      .send({
        status: 'COMPLETED'
      })
      .expect(302)
      .expect('Location', `/tasks/${task.id}`)

    expect(updateTaskStatus).toHaveBeenCalledWith(task.id, {
      status: 'COMPLETED'
    })
  })

  it('re-renders update status form with validation errors', async () => {
    const taskId = '66666666-6666-6666-6666-666666666666'
    const updateTaskStatus = jest.fn()

    const app = createApp({
      taskApiClient: createFakeTaskApiClient({
        updateTaskStatus
      })
    })

    const response = await request(app)
      .post(`/tasks/${taskId}/status`)
      .type('form')
      .send({})
      .expect(400)

    expect(response.text).toContain('There is a problem')
    expect(response.text).toContain('Select a task status')
    expect(updateTaskStatus).not.toHaveBeenCalled()
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