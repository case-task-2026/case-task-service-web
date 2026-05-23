import {
  getFormFieldError,
  parseCreateTaskForm,
  toCreateTaskPayload,
  validateCreateTaskForm
} from '../../src/tasks/taskForms'

describe('taskForms', () => {
  it('parses create task form body', () => {
    const form = parseCreateTaskForm({
      title: 'Prepare case bundle',
      description: 'Collect documents',
      dueDate: '2026-06-12',
      dueTime: '16:30'
    })

    expect(form).toEqual({
      title: 'Prepare case bundle',
      description: 'Collect documents',
      dueDate: '2026-06-12',
      dueTime: '16:30'
    })
  })

  it('uses empty strings for missing values', () => {
    const form = parseCreateTaskForm({})

    expect(form).toEqual({
      title: '',
      description: '',
      dueDate: '',
      dueTime: ''
    })
  })

  it('validates required fields', () => {
    const result = validateCreateTaskForm({
      title: '',
      description: '',
      dueDate: '',
      dueTime: ''
    })

    expect(result.errors).toEqual([
      {
        field: 'title',
        message: 'Enter a task title'
      },
      {
        field: 'dueDate',
        message: 'Enter a due date'
      },
      {
        field: 'dueTime',
        message: 'Enter a due time'
      }
    ])
  })

  it('validates maximum lengths', () => {
    const result = validateCreateTaskForm({
      title: 'A'.repeat(121),
      description: 'A'.repeat(1001),
      dueDate: '2026-06-12',
      dueTime: '16:30'
    })

    expect(result.errors).toEqual([
      {
        field: 'title',
        message: 'Task title must be 120 characters or fewer'
      },
      {
        field: 'description',
        message: 'Task description must be 1000 characters or fewer'
      }
    ])
  })

  it('converts form to create task payload', () => {
    const payload = toCreateTaskPayload({
      title: '  Prepare case bundle  ',
      description: '  Collect documents  ',
      dueDate: '2026-06-12',
      dueTime: '16:30'
    })

    expect(payload).toEqual({
      title: 'Prepare case bundle',
      description: 'Collect documents',
      dueDateTime: '2026-06-12T16:30:00Z'
    })
  })

  it('converts blank description to null', () => {
    const payload = toCreateTaskPayload({
      title: 'Prepare case bundle',
      description: '   ',
      dueDate: '2026-06-12',
      dueTime: '16:30'
    })

    expect(payload.description).toBeNull()
  })

  it('gets field error by field name', () => {
    const message = getFormFieldError(
      [
        {
          field: 'title',
          message: 'Enter a task title'
        }
      ],
      'title'
    )

    expect(message).toBe('Enter a task title')
  })
})