import express, { Express, NextFunction, Request, Response } from 'express'
import nunjucks from 'nunjucks'
import path from 'path'
import { loadEnvironmentConfig } from './config/environment'
import { createHomeRouter } from './routes/homeRoutes'
import { createTaskRouter } from './routes/taskRoutes'
import { createTaskApiClient } from './tasks/taskApiClientFactory'
import { TaskApiClient } from './tasks/taskApiClient'

export interface AppDependencies {
  readonly taskApiClient?: TaskApiClient
}

export function createApp(dependencies: AppDependencies = {}): Express {
  const app = express()
  const config = loadEnvironmentConfig()
  const taskApiClient = dependencies.taskApiClient ?? createTaskApiClient(config)

  app.disable('x-powered-by')

  const projectRoot = process.cwd()
  const viewsPath = path.join(projectRoot, 'src', 'views')
  const publicPath = path.join(projectRoot, 'src', 'public')
  const govukFrontendPath = path.join(projectRoot, 'node_modules', 'govuk-frontend', 'dist', 'govuk')
  const govukAssetsPath = path.join(govukFrontendPath, 'assets')

  nunjucks.configure(viewsPath, {
    autoescape: true,
    express: app,
    noCache: process.env.NODE_ENV !== 'production'
  })

  app.set('view engine', 'njk')

  app.use(assignSecurityHeaders)
  app.use(assignViewLocals)

  app.use(express.urlencoded({ extended: false }))
  app.use(express.json())

  app.use('/public', express.static(publicPath))
  app.use('/govuk', express.static(govukFrontendPath))
  app.use('/assets', express.static(govukAssetsPath))

  app.use(createTaskRouter(taskApiClient))
  app.use(createHomeRouter())

  app.use(handleNotFound)
  app.use(handleUnexpectedError)

  return app
}

function assignSecurityHeaders(_request: Request, response: Response, next: NextFunction): void {
  response.setHeader('X-Content-Type-Options', 'nosniff')
  response.setHeader('Referrer-Policy', 'same-origin')
  response.setHeader('Cache-Control', 'no-store')

  next()
}

function assignViewLocals(request: Request, response: Response, next: NextFunction): void {
  const currentPath = request.path

  const isCreateTaskPage = currentPath === '/tasks/new'

  const isTaskPage = currentPath === '/tasks' ||
    isTaskDetailsPage(currentPath) ||
    isTaskEditPage(currentPath) ||
    isTaskStatusPage(currentPath) ||
    isTaskDeletePage(currentPath)

  response.locals.navigation = {
    home: currentPath === '/',
    tasks: !isCreateTaskPage && isTaskPage,
    createTask: isCreateTaskPage
  }

  next()
}

function isTaskDetailsPage(path: string): boolean {
  return /^\/tasks\/(?!new$)[^/]+$/.test(path)
}

function isTaskEditPage(path: string): boolean {
  return /^\/tasks\/(?!new\/)[^/]+\/edit$/.test(path)
}

function isTaskStatusPage(path: string): boolean {
  return /^\/tasks\/(?!new\/)[^/]+\/status$/.test(path)
}

function isTaskDeletePage(path: string): boolean {
  return /^\/tasks\/(?!new\/)[^/]+\/delete$/.test(path)
}

function handleNotFound(_request: Request, response: Response): void {
  response.status(404).render('errors/notFound.njk', {
    pageTitle: 'Page not found'
  })
}

function handleUnexpectedError(
  error: unknown,
  _request: Request,
  response: Response,
  next: NextFunction
): void {
  if (response.headersSent) {
    return next(error)
  }

  console.error(error)

  response.status(500).render('errors/serverError.njk', {
    pageTitle: 'Sorry, there is a problem with the service'
  })
}