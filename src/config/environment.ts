export interface EnvironmentConfig {
  readonly port: number
  readonly taskApiBaseUrl: string
}

export function loadEnvironmentConfig(): EnvironmentConfig {
  return {
    port: Number(process.env.PORT ?? 3000),
    taskApiBaseUrl: process.env.TASK_API_BASE_URL ?? 'http://localhost:4000'
  }
}