import { FastifyInstance } from "fastify";
import { v4 } from "uuid";

type params = {
	id: string;
};

async function analyticsRoute(fastify: FastifyInstance, options: any) {
	fastify.put<{ Params: params }>("/analytics/:id", async (request, reply) => {
		const { id } = request.params;
		let body = request.body;
		console.log(id);
		console.log(body);

		return reply.send(200);
	});
}
export default analyticsRoute;
