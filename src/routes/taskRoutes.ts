import { Response, Router } from 'express'
import { TaskApiClient, TaskApiError } from '../tasks/taskApiClient'
import {
  CreateTaskForm,
  FormFieldError,
  getFormFieldError,
  parseCreateTaskForm,
  toCreateTaskPayload,
  validateCreateTaskForm
} from '../tasks/taskForms'
import { toTaskListItemViewModel } from '../tasks/taskViewModels'

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
      return renderCreateTaskForm(
        response.status(400),
        validationResult
      )
    }

    try {
      const createdTask = await taskApiClient.createTask(
        toCreateTaskPayload(validationResult.form)
      )

      return response.redirect(`/tasks/${createdTask.id}`)
    } catch (error) {
      if (error instanceof TaskApiError && error.fieldErrors && error.fieldErrors.length > 0) {
        return renderCreateTaskForm(
          response.status(error.status),
          {
            form,
            errors: toFormFieldErrors(error.fieldErrors)
          }
        )
      }

      return renderCreateTaskForm(
        response.status(502),
        {
          form,
          errors: [],
          serviceErrorMessage: 'The task could not be created because the task API could not be reached.'
        }
      )
    }
  })

  return router
}

interface CreateTaskFormPageModel {
  readonly form: CreateTaskForm
  readonly errors: FormFieldError[]
  readonly serviceErrorMessage?: string
}

function renderCreateTaskForm(
  response: Response,
  model: CreateTaskFormPageModel
): void {
  response.render('tasks/new.njk', {
    pageTitle: 'Create a task',
    form: model.form,
    errors: model.errors,
    fieldErrors: {
      title: getFormFieldError(model.errors, 'title'),
      description: getFormFieldError(model.errors, 'description'),
      dueDate: getFormFieldError(model.errors, 'dueDate'),
      dueTime: getFormFieldError(model.errors, 'dueTime')
    },
    serviceErrorMessage: model.serviceErrorMessage
  })
}

function toFormFieldErrors(
  fieldErrors: ReadonlyArray<{ readonly field: string; readonly message: string }>
): FormFieldError[] {
  return fieldErrors
    .filter((error): error is FormFieldError => isCreateTaskFormField(error.field))
    .map((error) => ({
      field: error.field,
      message: error.message
    }))
}

function isCreateTaskFormField(field: string): field is keyof CreateTaskForm {
  return field === 'title' ||
    field === 'description' ||
    field === 'dueDate' ||
    field === 'dueTime'
}