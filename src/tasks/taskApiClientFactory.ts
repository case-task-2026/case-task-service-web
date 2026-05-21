import { EnvironmentConfig } from '../config/environment'
import { HttpTaskApiClient, TaskApiClient } from './taskApiClient'

export function createTaskApiClient(config: EnvironmentConfig): TaskApiClient {
    return new HttpTaskApiClient(config.taskApiBaseUrl)
}