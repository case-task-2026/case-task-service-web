import request from 'supertest'
import { createApp } from '../src/app'

describe('home routes', () => {
    const app = createApp()

    it('renders the homepage with GOV UK layout', async () => {
        const response = await request(app)
            .get('/')
            .expect(200)

        expect(response.text).toContain('Manage caseworker tasks')
        expect(response.text).toContain('Case Task Service')
        expect(response.text).toContain('View tasks')
        expect(response.text).toContain('Create a task')
        expect(response.text).toContain('/govuk/govuk-frontend.min.css')
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