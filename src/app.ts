import express, { Express } from 'express'
import nunjucks from 'nunjucks'
import path from 'path'
import { createHomeRouter } from './routes/homeRoutes'

export function createApp(): Express {
    const app = express()

    const viewsPath = path.join(__dirname, 'views')
    const publicPath = path.join(__dirname, 'public')

    nunjucks.configure(viewsPath, {
        autoescape: true,
        express: app,
        noCache: process.env.NODE_ENV !== 'production'
    })

    app.set('view engine', 'njk')

    app.use(express.urlencoded({ extended: false }))
    app.use(express.json())
    app.use('/public', express.static(publicPath))

    app.use(createHomeRouter())

    return app
}