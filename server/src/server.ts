import fastify from 'fastify'
import app, { initializeBackgroundServices } from './app'

const server = fastify({
  logger: true
})

const start = async () => {
  try {
    await server.register(app)
    
    const port = parseInt(process.env.PORT || '3001', 10)
    const host = process.env.HOST || '0.0.0.0'
    
    await server.listen({ port, host })
    console.log(`Server listening on ${host}:${port}`)
    
    // Initialize background services after server starts
    initializeBackgroundServices()
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...')
  await server.close()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...')
  await server.close()
  process.exit(0)
})

start()
