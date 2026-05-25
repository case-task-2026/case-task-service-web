import { Response, Router } from 'express'
import { TaskApiClient, TaskApiError } from '../tasks/taskApiClient'
import {
  CreateTaskForm,
  FormFieldError,
  getFormFieldError,
  parseCreateTaskForm,
  parseUpdateTaskDetailsForm,
  parseUpdateTaskStatusForm,
  TaskFormField,
  toCreateTaskPayload,
  toUpdateTaskDetailsForm,
  toUpdateTaskDetailsPayload,
  toUpdateTaskStatusForm,
  toUpdateTaskStatusPayload,
  UpdateTaskDetailsForm,
  UpdateTaskStatusForm,
  validateCreateTaskForm,
  validateUpdateTaskDetailsForm,
  validateUpdateTaskStatusForm
} from '../tasks/taskForms'
import {
  toTaskDetailsViewModel,
  toTaskListItemViewModel
} from '../tasks/taskViewModels'

const EMPTY_CREATE_TASK_FORM: CreateTaskForm = {
  title: '',
  description: '',
  dueDate: '',
  dueTime: ''
}

export function createTaskRouter(taskApiClient: TaskApiClient): Router {
  const router = Router()

  router.get('/tasks', async (_request, response) => {
    try {
      const tasks = await taskApiClient.getTasks()
      const taskViewModels = tasks.map(toTaskListItemViewModel)

      response.render('tasks/list.njk', {
        pageTitle: 'Tasks',
        tasks: taskViewModels,
        taskCount: taskViewModels.length
      })
    } catch {
      response.status(502).render('tasks/list.njk', {
        pageTitle: 'Tasks',
        tasks: [],
        taskCount: 0,
        errorMessage: 'The task API could not be reached. Check that the backend service is running.'
      })
    }
  })

  router.get('/tasks/new', (_request, response) => {
    renderCreateTaskForm(response, {
      form: EMPTY_CREATE_TASK_FORM,
      errors: []
    })
  })

  router.post('/tasks/new', async (request, response) => {
    const form = parseCreateTaskForm(request.body as Record<string, unknown>)
    const validationResult = validateCreateTaskForm(form)

    if (validationResult.errors.length > 0) {
      return renderCreateTaskForm(response.status(400), validationResult)
    }

    try {
      const createdTask = await taskApiClient.createTask(
        toCreateTaskPayload(validationResult.form)
      )

      return response.redirect(`/tasks/${createdTask.id}`)
    } catch (error) {
      if (error instanceof TaskApiError && error.fieldErrors && error.fieldErrors.length > 0) {
        return renderCreateTaskForm(response.status(error.status), {
          form,
          errors: toBackendFormFieldErrors(error.fieldErrors)
        })
      }

      return renderCreateTaskForm(response.status(502), {
        form,
        errors: [],
        serviceErrorMessage: 'The task could not be created because the task API could not be reached.'
      })
    }
  })

  router.get('/tasks/:taskId/edit', async (request, response) => {
    const taskId = request.params.taskId

    try {
      const task = await taskApiClient.getTask(taskId)

      return renderUpdateTaskDetailsForm(response, {
        taskId,
        form: toUpdateTaskDetailsForm(task),
        errors: []
      })
    } catch (error) {
      if (isNotFoundError(error)) {
        return renderUpdateTaskDetailsForm(response.status(404), {
          taskId,
          form: EMPTY_CREATE_TASK_FORM,
          errors: [],
          notFoundMessage: error.message
        })
      }

      return renderUpdateTaskDetailsForm(response.status(502), {
        taskId,
        form: EMPTY_CREATE_TASK_FORM,
        errors: [],
        serviceErrorMessage: 'The task could not be loaded because the task API could not be reached.'
      })
    }
  })

  router.post('/tasks/:taskId/edit', async (request, response) => {
    const taskId = request.params.taskId
    const form = parseUpdateTaskDetailsForm(request.body as Record<string, unknown>)
    const validationResult = validateUpdateTaskDetailsForm(form)

    if (validationResult.errors.length > 0) {
      return renderUpdateTaskDetailsForm(response.status(400), {
        taskId,
        form,
        errors: validationResult.errors
      })
    }

    try {
      const updatedTask = await taskApiClient.updateTaskDetails(
        taskId,
        toUpdateTaskDetailsPayload(validationResult.form)
      )

      return response.redirect(`/tasks/${updatedTask.id}`)
    } catch (error) {
      if (isNotFoundError(error)) {
        return renderUpdateTaskDetailsForm(response.status(404), {
          taskId,
          form,
          errors: [],
          notFoundMessage: error.message
        })
      }

      if (error instanceof TaskApiError && error.fieldErrors && error.fieldErrors.length > 0) {
        return renderUpdateTaskDetailsForm(response.status(error.status), {
          taskId,
          form,
          errors: toBackendFormFieldErrors(error.fieldErrors)
        })
      }

      return renderUpdateTaskDetailsForm(response.status(502), {
        taskId,
        form,
        errors: [],
        serviceErrorMessage: 'The task could not be updated because the task API could not be reached.'
      })
    }
  })

  router.get('/tasks/:taskId/status', async (request, response) => {
    const taskId = request.params.taskId

    try {
      const task = await taskApiClient.getTask(taskId)

      return renderUpdateTaskStatusForm(response, {
        taskId,
        taskTitle: task.title,
        form: toUpdateTaskStatusForm(task),
        errors: []
      })
    } catch (error) {
      if (isNotFoundError(error)) {
        return renderUpdateTaskStatusForm(response.status(404), {
          taskId,
          form: { status: '' },
          errors: [],
          notFoundMessage: error.message
        })
      }

      return renderUpdateTaskStatusForm(response.status(502), {
        taskId,
        form: { status: '' },
        errors: [],
        serviceErrorMessage: 'The task status could not be loaded because the task API could not be reached.'
      })
    }
  })

  router.post('/tasks/:taskId/status', async (request, response) => {
    const taskId = request.params.taskId
    const form = parseUpdateTaskStatusForm(request.body as Record<string, unknown>)
    const validationResult = validateUpdateTaskStatusForm(form)

    if (validationResult.errors.length > 0) {
      return renderUpdateTaskStatusForm(response.status(400), {
        taskId,
        form,
        errors: validationResult.errors
      })
    }

    try {
      const updatedTask = await taskApiClient.updateTaskStatus(
        taskId,
        toUpdateTaskStatusPayload(validationResult.form)
      )

      return response.redirect(`/tasks/${updatedTask.id}`)
    } catch (error) {
      if (isNotFoundError(error)) {
        return renderUpdateTaskStatusForm(response.status(404), {
          taskId,
          form,
          errors: [],
          notFoundMessage: error.message
        })
      }

      return renderUpdateTaskStatusForm(response.status(502), {
        taskId,
        form,
        errors: [],
        serviceErrorMessage: 'The task status could not be updated because the task API could not be reached.'
      })
    }
  })

  router.get('/tasks/:taskId', async (request, response) => {
    const taskId = request.params.taskId

    try {
      const task = await taskApiClient.getTask(taskId)
      const taskViewModel = toTaskDetailsViewModel(task)

      return response.render('tasks/show.njk', {
        pageTitle: taskViewModel.title,
        task: taskViewModel
      })
    } catch (error) {
      if (isNotFoundError(error)) {
        return response.status(404).render('tasks/show.njk', {
          pageTitle: 'Task not found',
          notFoundMessage: error.message
        })
      }

      return response.status(502).render('tasks/show.njk', {
        pageTitle: 'Task details unavailable',
        serviceErrorMessage: 'The task details could not be loaded because the task API could not be reached.'
      })
    }
  })

  return router
}

interface CreateTaskFormPageModel {
  readonly form: CreateTaskForm
  readonly errors: FormFieldError[]
  readonly serviceErrorMessage?: string
}

interface UpdateTaskDetailsFormPageModel {
  readonly taskId: string
  readonly form: UpdateTaskDetailsForm
  readonly errors: FormFieldError[]
  readonly notFoundMessage?: string
  readonly serviceErrorMessage?: string
}

interface UpdateTaskStatusFormPageModel {
  readonly taskId: string
  readonly taskTitle?: string
  readonly form: UpdateTaskStatusForm
  readonly errors: FormFieldError[]
  readonly notFoundMessage?: string
  readonly serviceErrorMessage?: string
}

function renderCreateTaskForm(response: Response, model: CreateTaskFormPageModel): void {
  response.render('tasks/new.njk', {
    pageTitle: 'Create a task',
    form: model.form,
    errors: model.errors,
    fieldErrors: buildFieldErrorMap(model.errors, ['title', 'description', 'dueDate', 'dueTime']),
    serviceErrorMessage: model.serviceErrorMessage
  })
}

function renderUpdateTaskDetailsForm(response: Response, model: UpdateTaskDetailsFormPageModel): void {
  response.render('tasks/edit.njk', {
    pageTitle: 'Update task',
    taskId: model.taskId,
    form: model.form,
    errors: model.errors,
    fieldErrors: buildFieldErrorMap(model.errors, ['title', 'description', 'dueDate', 'dueTime']),
    notFoundMessage: model.notFoundMessage,
    serviceErrorMessage: model.serviceErrorMessage
  })
}

function renderUpdateTaskStatusForm(response: Response, model: UpdateTaskStatusFormPageModel): void {
  response.render('tasks/status.njk', {
    pageTitle: 'Update task status',
    taskId: model.taskId,
    taskTitle: model.taskTitle,
    form: model.form,
    errors: model.errors,
    fieldErrors: buildFieldErrorMap(model.errors, ['status']),
    notFoundMessage: model.notFoundMessage,
    serviceErrorMessage: model.serviceErrorMessage
  })
}

function buildFieldErrorMap(
  errors: FormFieldError[],
  fields: TaskFormField[]
): Record<TaskFormField, string | null> {
  return fields.reduce<Record<TaskFormField, string | null>>((fieldErrorMap, field) => {
    return {
      ...fieldErrorMap,
      [field]: getFormFieldError(errors, field)
    }
  }, {} as Record<TaskFormField, string | null>)
}

function toBackendFormFieldErrors(
  fieldErrors: ReadonlyArray<{ readonly field: string; readonly message: string }>
): FormFieldError[] {
  return fieldErrors
    .map((error) => {
      const field = mapBackendFieldToFormField(error.field)

      return field
        ? {
            field,
            message: error.message
          }
        : null
    })
    .filter((error): error is FormFieldError => error !== null)
}

function mapBackendFieldToFormField(field: string): TaskFormField | null {
  if (field === 'title' || field === 'description' || field === 'status') {
    return field
  }

  if (field === 'dueDateTime') {
    return 'dueDate'
  }

  return null
}

function isNotFoundError(error: unknown): error is TaskApiError {
  return error instanceof TaskApiError && error.status === 404
}