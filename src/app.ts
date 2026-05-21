import express, { Express } from 'express'
import nunjucks from 'nunjucks'
import path from 'path'
import { createHomeRouter } from './routes/homeRoutes'

export function createApp(): Express {
    const app = express()

    const projectRoot = process.cwd()
    const viewsPath = path.join(projectRoot, 'src', 'views')
    const publicPath = path.join(projectRoot,'src', 'public')
    const govukFrontendPath = path.join(projectRoot, 'node_modules', 'govuk-frontend', 'dist', 'govuk')
    const govukAssetsPath = path.join(govukFrontendPath, 'assets')

    nunjucks.configure(viewsPath, {
        autoescape: true,
        express: app,
        noCache: process.env.NODE_ENV !== 'production'
    })

    app.set('view engine', 'njk')

    app.use(express.urlencoded({ extended: false }))
    app.use(express.json())

    app.use('/public', express.static(publicPath))
    app.use('/govuk', express.static(govukFrontendPath))
    app.use('/assets', express.static(govukAssetsPath))

    app.use(createHomeRouter())

    return app
}