import { Task, TaskStatus } from './taskTypes'

export interface TaskListItemViewModel {
  readonly id: string
  readonly title: string
  readonly description: string | null
  readonly status: TaskStatus
  readonly statusText: string
  readonly statusTagClass: string
  readonly dueDateTimeText: string
  readonly createdAtText: string
}

export interface TaskDetailsViewModel {
  readonly id: string
  readonly title: string
  readonly description: string | null
  readonly status: TaskStatus
  readonly statusText: string
  readonly statusTagClass: string
  readonly dueDateTimeText: string
  readonly createdAtText: string
  readonly updatedAtText: string
}

interface TaskStatusDisplay {
  readonly text: string
  readonly tagClass: string
}

const TASK_STATUS_DISPLAY: Record<TaskStatus, TaskStatusDisplay> = {
  TODO: {
    text: 'To do',
    tagClass: 'govuk-tag govuk-tag--grey app-status-tag'
  },
  IN_PROGRESS: {
    text: 'In progress',
    tagClass: 'govuk-tag govuk-tag--blue app-status-tag'
  },
  COMPLETED: {
    text: 'Completed',
    tagClass: 'govuk-tag govuk-tag--green app-status-tag'
  }
}

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC'
})

export function toTaskListItemViewModel(task: Task): TaskListItemViewModel {
  const statusDisplay = TASK_STATUS_DISPLAY[task.status]

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    statusText: statusDisplay.text,
    statusTagClass: statusDisplay.tagClass,
    dueDateTimeText: formatIsoDateTime(task.dueDateTime),
    createdAtText: formatIsoDateTime(task.createdAt)
  }
}

export function toTaskDetailsViewModel(task: Task): TaskDetailsViewModel {
  const statusDisplay = TASK_STATUS_DISPLAY[task.status]

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    statusText: statusDisplay.text,
    statusTagClass: statusDisplay.tagClass,
    dueDateTimeText: formatIsoDateTime(task.dueDateTime),
    createdAtText: formatIsoDateTime(task.createdAt),
    updatedAtText: formatIsoDateTime(task.updatedAt)
  }
}

export function formatIsoDateTime(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return dateTimeFormatter.format(date)
}