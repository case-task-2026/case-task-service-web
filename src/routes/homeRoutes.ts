import { Router } from 'express'

export function createHomeRouter(): Router {
  const router = Router()

  router.get('/', (_request, response) => {
    response.render('home.njk', {
      pageTitle: 'Manage caseworker tasks'
    })
  })

  router.get('/health', (_request, response) => {
    response.status(200).json({
      status: 'UP'
    })
  })

  return router
}