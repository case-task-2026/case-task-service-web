import {
  CreateTaskPayload,
  Task,
  TaskStatus,
  UpdateTaskDetailsPayload,
  UpdateTaskStatusPayload
} from './taskTypes'

export interface CreateTaskForm {
  readonly title: string
  readonly description: string
  readonly dueDate: string
  readonly dueTime: string
}

export interface UpdateTaskDetailsForm {
  readonly title: string
  readonly description: string
  readonly dueDate: string
  readonly dueTime: string
}

export interface UpdateTaskStatusForm {
  readonly status: string
}

export type TaskFormField = keyof CreateTaskForm | keyof UpdateTaskStatusForm

export interface FormFieldError {
  readonly field: TaskFormField
  readonly message: string
}

export interface CreateTaskFormValidationResult {
  readonly form: CreateTaskForm
  readonly errors: FormFieldError[]
}

export interface UpdateTaskDetailsFormValidationResult {
  readonly form: UpdateTaskDetailsForm
  readonly errors: FormFieldError[]
}

export interface UpdateTaskStatusFormValidationResult {
  readonly form: UpdateTaskStatusForm
  readonly errors: FormFieldError[]
}

const MAX_TITLE_LENGTH = 120
const MAX_DESCRIPTION_LENGTH = 1000
const TASK_STATUSES: readonly TaskStatus[] = ['TODO', 'IN_PROGRESS', 'COMPLETED']

export function parseCreateTaskForm(body: Record<string, unknown>): CreateTaskForm {
  return {
    title: toFormString(body.title),
    description: toFormString(body.description),
    dueDate: toFormString(body.dueDate),
    dueTime: toFormString(body.dueTime)
  }
}

export function parseUpdateTaskDetailsForm(body: Record<string, unknown>): UpdateTaskDetailsForm {
  return {
    title: toFormString(body.title),
    description: toFormString(body.description),
    dueDate: toFormString(body.dueDate),
    dueTime: toFormString(body.dueTime)
  }
}

export function parseUpdateTaskStatusForm(body: Record<string, unknown>): UpdateTaskStatusForm {
  return {
    status: toFormString(body.status)
  }
}

export function validateCreateTaskForm(form: CreateTaskForm): CreateTaskFormValidationResult {
  return {
    form,
    errors: validateTaskDetailsFields(form)
  }
}

export function validateUpdateTaskDetailsForm(
  form: UpdateTaskDetailsForm
): UpdateTaskDetailsFormValidationResult {
  return {
    form,
    errors: validateTaskDetailsFields(form)
  }
}

export function validateUpdateTaskStatusForm(
  form: UpdateTaskStatusForm
): UpdateTaskStatusFormValidationResult {
  const errors: FormFieldError[] = []

  if (!TASK_STATUSES.includes(form.status as TaskStatus)) {
    errors.push({
      field: 'status',
      message: 'Select a task status'
    })
  }

  return {
    form,
    errors
  }
}

export function toCreateTaskPayload(form: CreateTaskForm): CreateTaskPayload {
  return {
    title: form.title.trim(),
    description: normaliseOptionalText(form.description),
    dueDateTime: toIsoDateTime(form.dueDate, form.dueTime)
  }
}

export function toUpdateTaskDetailsPayload(form: UpdateTaskDetailsForm): UpdateTaskDetailsPayload {
  return {
    title: form.title.trim(),
    description: normaliseOptionalText(form.description),
    dueDateTime: toIsoDateTime(form.dueDate, form.dueTime)
  }
}

export function toUpdateTaskStatusPayload(form: UpdateTaskStatusForm): UpdateTaskStatusPayload {
  return {
    status: form.status as TaskStatus
  }
}

export function toUpdateTaskDetailsForm(task: Task): UpdateTaskDetailsForm {
  const date = new Date(task.dueDateTime)

  if (Number.isNaN(date.getTime())) {
    return {
      title: task.title,
      description: task.description ?? '',
      dueDate: '',
      dueTime: ''
    }
  }

  return {
    title: task.title,
    description: task.description ?? '',
    dueDate: date.toISOString().slice(0, 10),
    dueTime: date.toISOString().slice(11, 16)
  }
}

export function toUpdateTaskStatusForm(task: Task): UpdateTaskStatusForm {
  return {
    status: task.status
  }
}

export function getFormFieldError(errors: FormFieldError[], field: TaskFormField): string | null {
  return errors.find((error) => error.field === field)?.message ?? null
}

function validateTaskDetailsFields(form: CreateTaskForm | UpdateTaskDetailsForm): FormFieldError[] {
  const errors: FormFieldError[] = []

  if (form.title.trim().length === 0) {
    errors.push({
      field: 'title',
      message: 'Enter a task title'
    })
  }

  if (form.title.trim().length > MAX_TITLE_LENGTH) {
    errors.push({
      field: 'title',
      message: `Task title must be ${MAX_TITLE_LENGTH} characters or fewer`
    })
  }

  if (form.description.trim().length > MAX_DESCRIPTION_LENGTH) {
    errors.push({
      field: 'description',
      message: `Task description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer`
    })
  }

  if (form.dueDate.trim().length === 0) {
    errors.push({
      field: 'dueDate',
      message: 'Enter a due date'
    })
  }

  if (form.dueTime.trim().length === 0) {
    errors.push({
      field: 'dueTime',
      message: 'Enter a due time'
    })
  }

  return errors
}

function toIsoDateTime(dueDate: string, dueTime: string): string {
  const normalisedTime = dueTime.length === 5 ? `${dueTime}:00` : dueTime

  return `${dueDate}T${normalisedTime}Z`
}

function normaliseOptionalText(value: string): string | null {
  const trimmedValue = value.trim()

  return trimmedValue.length === 0 ? null : trimmedValue
}

function toFormString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}