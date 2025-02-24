"use client";

import { toast } from "@/hooks/use-toast";
import { saveAs } from "file-saver";
import { signIn, useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface Guild {
	id: string;
	name: string;
	icon: string;
}

const ServerCheckerContent = () => {
	const { data: session, status } = useSession();
	const [loading, setLoading] = useState(false);
	const [guilds, setGuilds] = useState([]);
	const [randomHash, setRandomHash] = useState("");
	const [timestamp, setTimestamp] = useState(0);
	const section = useRef<HTMLDivElement>(null);

	const fetchData = useCallback(async () => {
		if (!session?.user?.id) return;
		setLoading(true);

		try {
			const res = await fetch(
				`/api/server-checker?userid=${session?.user?.id}`,
				{
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
			const data = await res.json();

			if (data.status !== "success") {
				toast({
					variant: "destructive",
					title: "Error",
					description:
						"An error occurred while fetching your guilds. Try logging out and logging back in.",
				});
				return;
			}

			setGuilds(data.guilds);
			setRandomHash(data.randomHash);
			setTimestamp(data.timestamp);
		} catch (error) {
			console.error(error);
			toast({
				variant: "destructive",
				title: "Error",
				description:
					"An error occurred while fetching your guilds. Try logging out and logging back in.",
			});
		} finally {
			setLoading(false);
		}
	}, [session?.user?.id]);

	const reFetchData = async () => {
		const res = await fetch(
			`/api/revalidate?userid=${session?.user?.id}&type=check`,
			{
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
		const data = await res.json();

		if (data.status !== "success")
			return toast({
				variant: "destructive",
				title: "Error",
				description:
					"An error occurred while fetching your guilds. Try logging out and logging back in.",
			});

		fetchData();
	};

	const downloadImage = async () => {
		const response = await fetch("/api/server-checker", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				userId: session?.user?.id,
			}),
		});
		const blob = await response.blob();
		saveAs(blob, `${randomHash}-${timestamp}.png`);
	};

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return (
		<Section className="md:py-0 sm:py-0 px-0 py-0 animate-appear opacity-0">
			<div className="mx-auto flex max-w-container flex-col py-8 px-3 md:py-12">
				<div
					className="flex flex-col items-center bg-white/5 rounded-md p-5"
					ref={section}
				>
					<div className="bg-background/60 w-full p-5 md:p-8 rounded-md">
						{loading || status === "loading" ? (
							<>
								<div className="flex flex-wrap mb-10">
									<Skeleton className="w-[100%] h-[112px] bg-white/50 opacity-20" />
								</div>
								<Skeleton className="w-[80%] h-[30px] bg-white/50 opacity-20 mb-4" />
								<Skeleton className="w-[60%] h-[20px] bg-white/50 opacity-20 mb-4" />
								<Skeleton className="w-[80%] h-[20px] bg-white/50 opacity-20 mb-10" />
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-14">
												<Skeleton className="w-[100%] h-[30px] bg-white/50 opacity-20" />
											</TableHead>
											<TableHead className="w-[30%]">
												<Skeleton className="w-[100%] h-[30px] bg-white/50 opacity-20" />
											</TableHead>
											<TableHead className="w-[70%]">
												<Skeleton className="w-[100%] h-[30px] bg-white/50 opacity-20" />
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{Array.from({ length: 6 }).map((_, index) => (
											<TableRow key={`skeleton-${index + 1}`}>
												<TableCell className="w-14">
													<Skeleton className="h-10 w-10 rounded-full bg-white/50 opacity-20" />
												</TableCell>
												<TableCell className="w-[30%]">
													<Skeleton className="w-[100%] h-[20px] bg-white/50 opacity-20" />
												</TableCell>
												<TableCell className="w-[70%]">
													<Skeleton className="w-[100%] h-[20px] bg-white/50 opacity-20" />
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</>
						) : session ? (
							<div className="flex flex-wrap flex-col w-full gap-8">
								<div className="flex flex-wrap gap-12 bg-background/50 p-5 rounded-md shadow-lg">
									<div className="flex flex-1 flex-col justify-evenly">
										<Avatar className="animate-fade-in delay-100 opacity-0">
											<AvatarImage src={session.user.image} />
											<AvatarFallback>CN</AvatarFallback>
										</Avatar>
										<div className="flex flex-1 flex-col justify-center">
											<p className="text-muted-foreground">
												Logged in as{" "}
												<strong className="text-white capitalize">
													{session.user.name}
												</strong>
											</p>
										</div>
									</div>
									<div className="flex flex-col justify-center">
										<p>
											<strong className="font-semibold">Random hash:</strong>{" "}
											{randomHash}
										</p>
										<p>
											<strong className="font-semibold">User ID:</strong>{" "}
											{session.user.id}
										</p>
										<p>
											<strong className="font-semibold">UTC:</strong>{" "}
											{new Date(timestamp * 1000).toUTCString()}
										</p>
									</div>
								</div>
								{guilds.length > 0 ? (
									<>
										<div>
											<h2 className="mb-4 text-2xl font-medium">
												You have been found in{" "}
												<strong className="font-semibold animate-appear delay-150 opacity-0">
													{guilds.length}
												</strong>{" "}
												blacklisted server.
											</h2>
											<p>
												The servers listed below are flagged as bad servers. To
												proceed with your appeal (if you have one open), you
												must leave these servers.
											</p>
											<p>
												After leaving the servers, click on "Do another check"
												to verify if you are still in any blacklisted servers.
											</p>
										</div>
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead className="w-14">Icon</TableHead>
													<TableHead className="w-[30%]">Server ID</TableHead>
													<TableHead className="w-[70%]">Server name</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{guilds.map((guild: Guild) => (
													<TableRow key={guild.id}>
														<TableCell className="w-14">
															<Avatar className="animate-fade-in delay-100 opacity-0">
																<AvatarImage
																	src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=80`}
																/>
																<AvatarFallback>
																	{guild.name.slice(0, 2).toUpperCase()}
																</AvatarFallback>
															</Avatar>
														</TableCell>
														<TableCell className="w-[30%]">
															{guild.id}
														</TableCell>
														<TableCell className="w-[70%]">
															{guild.name}
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</>
								) : (
									<>
										<div>
											<h2 className="mb-4 text-2xl font-medium">
												You have not been found in any blacklisted servers.
											</h2>
											<p>
												<strong>You are all good!</strong> To proceed with your
												appeal (if you have one open), click the "Download as
												png" button below and send it in your appeal ticket.
											</p>
										</div>
									</>
								)}
								<div className="flex items-center justify-center gap-10">
									{guilds.length === 0 ? (
										<Button
											variant="dia"
											size="lg"
											className="mt-5 max-w-[600px] w-full animate-appear delay-150 opacity-0"
											onClick={() => downloadImage()}
										>
											Download as png
										</Button>
									) : null}
									<Button
										variant="default"
										size="lg"
										className="mt-5 max-w-[600px] w-full animate-appear delay-150 opacity-0"
										onClick={() => reFetchData()}
									>
										Do another check
									</Button>
								</div>
							</div>
						) : (
							<>
								<h1 className="mb-4 text-2xl font-medium">
									Check for Blacklisted Servers
								</h1>
								<p className="mb-5">
									Log in with your Discord account to see if you are part of any
									servers that have been flagged as blacklisted.
								</p>
								<Button
									variant="default"
									size="lg"
									onClick={() => signIn("discord")}
								>
									Login with Discord
								</Button>
							</>
						)}
					</div>
				</div>
			</div>
		</Section>
	);
};

export default ServerCheckerContent;
