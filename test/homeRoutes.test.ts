import request from 'supertest'
import { createApp } from '../src/app'

describe('home routes', () => {
    const app = createApp()

    it('renders the homepage', async () => {
        const response = await request(app)
            .get('/')
            .expect(200)

        expect(response.text).toContain('Manage caseworker tasks')
        expect(response.text).toContain('Frontend skeleton is running successfully')
    })

    it('returns health status', async () => {
        const response = await request(app)
            .get('/health')
            .expect(200)

        expect(response.body).toEqual({
            status: 'UP'
            })
        })
    })