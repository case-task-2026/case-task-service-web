import 'dotenv/config'
import { createApp } from './app'
import { loadEnvironmentConfig } from './config/environment'

const config = loadEnvironmentConfig()
const app = createApp()

app.listen(config.port, () => {
    console.log('Case task service web listening on port ${config.port}')
})