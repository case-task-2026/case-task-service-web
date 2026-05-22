import  { Router } from 'express'
import { TaskApiClient } from '../tasks/taskApiClient'
import { toTaskListItemViewModel } from '../tasks/taskViewModels'

export  function createTaskRouter(taskApiClient: TaskApiClient): Router {
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
                errorMessage: "The task API could not be reached. Check that the backend service is running."
            })
        }
    })

    return router
}