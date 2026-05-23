import { CreateTaskPayload } from './taskTypes'

export interface CreateTaskForm {
  readonly title: string
  readonly description: string
  readonly dueDate: string
  readonly dueTime: string
}

export interface FormFieldError {
  readonly field: keyof CreateTaskForm
  readonly message: string
}

export interface CreateTaskFormValidationResult {
  readonly form: CreateTaskForm
  readonly errors: FormFieldError[]
}

const MAX_TITLE_LENGTH = 120
const MAX_DESCRIPTION_LENGTH = 1000

export function parseCreateTaskForm(body: Record<string, unknown>): CreateTaskForm {
  return {
    title: toFormString(body.title),
    description: toFormString(body.description),
    dueDate: toFormString(body.dueDate),
    dueTime: toFormString(body.dueTime)
  }
}

export function validateCreateTaskForm(form: CreateTaskForm): CreateTaskFormValidationResult {
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

export function hasFormFieldError(errors: FormFieldError[], field: keyof CreateTaskForm): boolean {
  return errors.some((error) => error.field === field)
}

export function getFormFieldError(errors: FormFieldError[], field: keyof CreateTaskForm): string | null {
  return errors.find((error) => error.field === field)?.message ?? null
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