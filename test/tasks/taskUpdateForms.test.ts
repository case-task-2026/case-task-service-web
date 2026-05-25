import {
  parseUpdateTaskDetailsForm,
  parseUpdateTaskStatusForm,
  toUpdateTaskDetailsForm,
  toUpdateTaskDetailsPayload,
  toUpdateTaskStatusPayload,
  validateUpdateTaskDetailsForm,
  validateUpdateTaskStatusForm
} from '../../src/tasks/taskForms'
import { Task } from '../../src/tasks/taskTypes'

describe('task update forms', () => {
  it('parses update task details form body', () => {
    const form = parseUpdateTaskDetailsForm({
      title: 'Updated task',
      description: 'Updated description',
      dueDate: '2026-07-01',
      dueTime: '10:30'
    })

    expect(form).toEqual({
      title: 'Updated task',
      description: 'Updated description',
      dueDate: '2026-07-01',
      dueTime: '10:30'
    })
  })

  it('validates update task details form', () => {
    const result = validateUpdateTaskDetailsForm({
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

  it('converts update details form to payload', () => {
    const payload = toUpdateTaskDetailsPayload({
      title: '  Updated task  ',
      description: '  Updated description  ',
      dueDate: '2026-07-01',
      dueTime: '10:30'
    })

    expect(payload).toEqual({
      title: 'Updated task',
      description: 'Updated description',
      dueDateTime: '2026-07-01T10:30:00Z'
    })
  })

  it('pre-populates update details form from task', () => {
    const form = toUpdateTaskDetailsForm(buildTask())

    expect(form).toEqual({
      title: 'Prepare case bundle',
      description: 'Collect documents',
      dueDate: '2026-06-12',
      dueTime: '16:30'
    })
  })

  it('parses update status form body', () => {
    const form = parseUpdateTaskStatusForm({
      status: 'IN_PROGRESS'
    })

    expect(form).toEqual({
      status: 'IN_PROGRESS'
    })
  })

  it('validates missing update status', () => {
    const result = validateUpdateTaskStatusForm({
      status: ''
    })

    expect(result.errors).toEqual([
      {
        field: 'status',
        message: 'Select a task status'
      }
    ])
  })

  it('converts update status form to payload', () => {
    const payload = toUpdateTaskStatusPayload({
      status: 'COMPLETED'
    })

    expect(payload).toEqual({
      status: 'COMPLETED'
    })
  })

  function buildTask(overrides: Partial<Task> = {}): Task {
    return {
      id: '11111111-1111-1111-1111-111111111111',
      title: 'Prepare case bundle',
      description: 'Collect documents',
      status: 'TODO',
      dueDateTime: '2026-06-12T16:30:00Z',
      createdAt: '2026-05-14T09:30:00Z',
      updatedAt: '2026-05-14T09:30:00Z',
      ...overrides
    }
  }
})