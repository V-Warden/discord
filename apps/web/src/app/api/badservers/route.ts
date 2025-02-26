import { findBadServerById, getBadServers } from "@warden/database/functions";
import { unstable_cacheLife as cacheLife } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

const mapServerType = (type: string) => {
	switch (type) {
		case "CHEATING":
			return "Cheating";
		case "LEAKING":
			return "Leaking";
		case "RESELLING":
		case "ADVERTISING":
		case "OTHER":
			return "Other";
		default:
			return type;
	}
};

const getServers = async (limit: number, offset: number) => {
	"use cache";
	try {
		cacheLife("hours");
		const result = await getBadServers(limit, offset);
		const servers = result.badServers.map((server) => {
			if (server) {
				const {
					updatedBy,
					createdBy,
					updatedAt,
					invite,
					oldNames,
					type,
					...filteredServer
				} = server;
				return { ...filteredServer, type: mapServerType(type) };
			}
			return null;
		});
		return { servers, count: result.count };
	} catch (error) {
		console.error(error);
		return { servers: [], count: 0 };
	}
};

const getServer = async (id: string) => {
	"use cache";
	try {
		cacheLife("hours");
		const server = await findBadServerById(id);
		if (!server) return null;
		const {
			updatedBy,
			createdBy,
			updatedAt,
			invite,
			oldNames,
			type,
			...filteredServer
		} = server;
		return { ...filteredServer, type: mapServerType(type) };
	} catch (error) {
		console.error(error);
		return null;
	}
};

export const GET = async (req: NextRequest) => {
	const { searchParams } = new URL(req.url);
	const search = searchParams.get("search") || false;
	const offset = Number.parseInt(searchParams.get("offset") || "0", 10);

	if (search) {
		try {
			const serverResult = await getServer(search);
			return NextResponse.json({
				servers: serverResult ? [serverResult] : [],
				count: serverResult ? 1 : 0,
			});
		} catch (error) {
			console.error(error);
			return NextResponse.error();
		}
	}

	try {
		const serversResult = await getServers(10, offset);
		return NextResponse.json(serversResult);
	} catch (error) {
		console.error(error);
		return NextResponse.error();
	}
};
