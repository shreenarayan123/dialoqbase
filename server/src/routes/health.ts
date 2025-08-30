import { FastifyPluginAsync } from "fastify";

const health: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get("/health", async function (request, reply) {
    try {
      // Check database connection
      await fastify.prisma.$queryRaw`SELECT 1`;
      
      // Check Redis connection (if queue is available)
      if (fastify.queue) {
        await fastify.queue.client.ping();
      }
      
      return {
        status: "healthy",
        timestamp: new Date().toISOString(),
        services: {
          database: "connected",
          redis: fastify.queue ? "connected" : "not configured"
        }
      };
    } catch (error) {
      reply.code(503);
      return {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  });

  fastify.get("/", async function (request, reply) {
    return {
      name: "DialoqBase API",
      version: "1.11.4",
      status: "running",
      docs: "/docs"
    };
  });
};

export default health;
