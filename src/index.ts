import "dotenv/config";
import Fastify from "fastify";
import FastifySensible from "@fastify/sensible";

// Fastify & it's configuration
const fastify = Fastify({
  logger: true,
});
fastify.register(FastifySensible);

// Routes
fastify.get("/", async (request: any, reply) => {
  return {};
});

// Run the server
const start = async () => {
  try {
    const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
    const HOST = process.env.PORT ? "0.0.0.0" : "127.0.0.1";
    await fastify.listen({ port: PORT, host: HOST });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
