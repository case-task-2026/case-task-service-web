"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
describe('home routes', () => {
    const app = (0, app_1.createApp)();
    it('renders the homepage', async () => {
        const response = await (0, supertest_1.default)(app)
            .get('/')
            .expect(200);
        expect(response.text).toContain('Manage caseworker tasks');
        expect(response.text).toContain('Frontend skeleton is running successfully');
    });
    it('returns health status', async () => {
        const response = await (0, supertest_1.default)(app)
            .get('/health')
            .expect(200);
        expect(response.body).toEqual({
            status: 'UP'
        });
    });
});
