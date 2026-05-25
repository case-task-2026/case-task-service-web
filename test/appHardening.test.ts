import request from 'supertest'
import { createApp } from '../src/app'
import { TaskApiClient } from '../src/tasks/taskApiClient'
import {
  CreateTaskPayload,
  Task,
  UpdateTaskDetailsPayload,
  UpdateTaskStatusPayload
} from '../src/tasks/taskTypes'

describe('app hardening', () => {
  it('sets safer default response headers', async () => {
    const app = createApp({
      taskApiClient: createFakeTaskApiClient()
    })

    const response = await request(app)
      .get('/')
      .expect(200)

    expect(response.headers['x-powered-by']).toBeUndefined()
    expect(response.headers['x-content-type-options']).toBe('nosniff')
    expect(response.headers['referrer-policy']).toBe('same-origin')
    expect(response.headers['cache-control']).toBe('no-store')
  })

  it('renders global 404 page for unknown routes', async () => {
    const app = createApp({
      taskApiClient: createFakeTaskApiClient()
    })

    const response = await request(app)
      .get('/unknown-route')
      .expect(404)

    expect(response.text).toContain('Page not found')
    expect(response.text).toContain('Go to the task list')
  })

  it('marks home navigation item as active on homepage', async () => {
    const app = createApp({
      taskApiClient: createFakeTaskApiClient()
    })

    const response = await request(app)
      .get('/')
      .expect(200)

    expect(response.text).toContain('app-header-navigation-link--active')
    expect(response.text).toContain('href="/"')
    expect(response.text).toContain('aria-current="page"')
  })

  it('marks task navigation item as active on task pages', async () => {
    const app = createApp({
      taskApiClient: createFakeTaskApiClient({
        getTasks: jest.fn().mockResolvedValue([])
      })
    })

    const response = await request(app)
      .get('/tasks')
      .expect(200)

    expect(response.text).toContain('app-header-navigation-link--active')
    expect(response.text).toContain('href="/tasks"')
    expect(response.text).toContain('aria-current="page"')
  })

  it('marks create task navigation item as active on create task page', async () => {
    const app = createApp({
      taskApiClient: createFakeTaskApiClient()
    })

    const response = await request(app)
      .get('/tasks/new')
      .expect(200)

    expect(response.text).toContain('app-header-navigation-link--active')
    expect(response.text).toContain('href="/tasks/new"')
    expect(response.text).toContain('aria-current="page"')
  })

  it('does not mark task navigation item as active on create task page', async () => {
    const app = createApp({
      taskApiClient: createFakeTaskApiClient()
    })

    const response = await request(app)
      .get('/tasks/new')
      .expect(200)

    const activeClassCount = (response.text.match(/app-header-navigation-link--active/g) ?? []).length

    expect(activeClassCount).toBe(1)
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
})