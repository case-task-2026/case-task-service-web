import { createTaskApiClient } from '../../src/tasks/taskApiClientFactory'
import { EnvironmentConfig } from '../../src/config/environment'
import { HttpTaskApiClient } from '../../src/tasks/taskApiClient'

describe('createTaskApiClient', () => {
  it('creates an HTTP task API client from environment config', () => {
    const config: EnvironmentConfig = {
      port: 3000,
      taskApiBaseUrl: 'http://localhost:4000'
    }

    const client = createTaskApiClient(config)

    expect(client).toBeInstanceOf(HttpTaskApiClient)
  })
})