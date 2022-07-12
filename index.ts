require("dotenv").config();

import Fastify, { FastifyInstance } from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyPostgres from "@fastify/postgres";
import fastifyFormbody from "@fastify/formbody";
import fastifyCompress from "@fastify/compress";
import path from "path";

import leaderboardRoute from "./leaderboardRoute";

const fastify: FastifyInstance = Fastify({ logger: true });

fastify.addHook("preHandler", function (req, reply, done) {
	if (req.body) {
		req.log.info({ body: req.body }, "parsed body");
	}
	done();
});

fastify.register(fastifyFormbody);

fastify.register(fastifyPostgres, {
	connectionString: `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`,
});

fastify.register(fastifyStatic, { root: path.join(__dirname, "build"), preCompressed: true, setHeaders:(res, path, stat)=>{
	if(path.includes(".gz"))
		res.setHeader("Content-Encoding", "gzip")
	if(path.includes(".br"))
		res.setHeader("Content-Encoding", "br")
	
	if(path.includes("wasm"))
		res.setHeader("Content-Type", "application/wasm")
}
});




fastify.setNotFoundHandler(async (request, reply) => {
	reply.status(404).send("404 not found");
});

fastify.register(leaderboardRoute);

const start = async () => {
	try {
		await fastify.listen({ port: 2007 });
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
