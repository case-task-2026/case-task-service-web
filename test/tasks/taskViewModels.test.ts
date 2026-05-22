import { formatIsoDateTime, toTaskListItemViewModel } from '../../src/tasks/taskViewModels'
import { Task } from '../../src/tasks/taskTypes'

describe('taskViewModels', () => {
  it('maps TODO task to list item view model', () => {
    const task = buildTask({
      status: 'TODO'
    })

    const viewModel = toTaskListItemViewModel(task)

    expect(viewModel).toMatchObject({
      id: task.id,
      title: task.title,
      description: task.description,
      status: 'TODO',
      statusText: 'To do',
      statusTagClass: 'govuk-tag govuk-tag--grey app-status-tag'
    })

    expect(viewModel.dueDateTimeText).toContain('12 Jun 2026')
    expect(viewModel.createdAtText).toContain('14 May 2026')
  })

  it('maps IN_PROGRESS status display', () => {
    const viewModel = toTaskListItemViewModel(
      buildTask({
        status: 'IN_PROGRESS'
      })
    )

    expect(viewModel.statusText).toBe('In progress')
    expect(viewModel.statusTagClass).toBe('govuk-tag govuk-tag--blue app-status-tag')
  })

  it('maps COMPLETED status display', () => {
    const viewModel = toTaskListItemViewModel(
      buildTask({
        status: 'COMPLETED'
      })
    )

    expect(viewModel.statusText).toBe('Completed')
    expect(viewModel.statusTagClass).toBe('govuk-tag govuk-tag--green app-status-tag')
  })

  it('returns original value when date cannot be parsed', () => {
    expect(formatIsoDateTime('not-a-date')).toBe('not-a-date')
  })

  function buildTask(overrides: Partial<Task>): Task {
    return {
      id: '11111111-1111-1111-1111-111111111111',
      title: 'Prepare case bundle',
      description: 'Collect required documents',
      status: 'TODO',
      dueDateTime: '2026-06-12T16:30:00Z',
      createdAt: '2026-05-14T09:30:00Z',
      updatedAt: '2026-05-14T09:30:00Z',
      ...overrides
    }
  }
})