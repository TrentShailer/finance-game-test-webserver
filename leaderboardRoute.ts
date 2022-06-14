import { FastifyInstance } from "fastify";
import { v4 } from "uuid";

interface ILeaderboardAddBody {
	secret: string;
	name: string;
	score: number;
}

async function leaderboardRoutes(fastify: FastifyInstance, options: any) {
	fastify.get("/leaderboard", async (request, reply) => {
		const client = await fastify.pg.connect();

		const leaderboardQuery = await client.query<{
			score_id: string;
			name: string;
			score: number;
		}>("SELECT score_id, name, score FROM scores ORDER BY score DESC LIMIT 10;");

		client.release();

		return reply.send(leaderboardQuery.rows);
	});

	fastify.post<{ Body: ILeaderboardAddBody }>("/leaderboard/add", async (request, reply) => {
		if (request.body.secret !== process.env.GAME_SECRET) {
			return reply.send(403);
		}

		//! NAME FILTER HERE
		//! SCORE FILTER HERE

		const client = await fastify.pg.connect();

		const leaderboardQuery = await client.query<{
			score_id: string;
			name: string;
			score: number;
		}>("SELECT score_id, name, score FROM scores ORDER BY score DESC LIMIT 10;");

		let betterScore = false;

		for (let i = 0; i < leaderboardQuery.rowCount; i++) {
			let row: { score_id: string; name: string; score: number } = leaderboardQuery.rows[i];
			if (request.body.score > row.score) {
				betterScore = true;
				break;
			}
		}
		if (leaderboardQuery.rowCount == 0) {
			betterScore = true;
		}

		if (betterScore) {
			await client.query("INSERT INTO scores(score_id, name, score) VALUES($1, $2, $3);", [
				v4(),
				request.body.name,
				request.body.score,
			]);
		}
		client.release();
		return reply.send(200);
	});
}
export default leaderboardRoutes;
