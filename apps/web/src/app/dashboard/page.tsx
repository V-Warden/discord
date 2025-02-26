"use client";

import { toast } from "@/hooks/use-toast";
import scrollToTop from "@/lib/scrollToTop";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Section } from "@/components/ui/section";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

interface Role {
	id: string;
	name: string;
	permissions: number;
}

const FormSchema = z.object({
	enabled: z.boolean().default(false),
	punishmentother: z.string().default("WARN"),
	punishmentleaker: z.string().default("WARN"),
	punishmentcheater: z.string().default("WARN"),
	punishmentsupporter: z.string().default("KICK"),
	punishmentowner: z.string().default("BAN"),
	roleid: z.string().default("none"),
	unbanenabled: z.boolean().default(true),
	unbanother: z.boolean().default(true),
	unbanleaker: z.boolean().default(true),
	unbancheater: z.boolean().default(true),
	unbansupporter: z.boolean().default(true),
	unbanowner: z.boolean().default(true),
});

const DashboardContent = () => {
	const { data: session, status } = useSession();
	const [selectedServer, setSelectedServer] = useState("");
	const [submittedEnableStatus, setSubmittedEnableStatus] = useState(false);
	const [loading, setLoading] = useState(false);
	const [serverData, setServerData] = useState<{
		status: string;
		roles: Role[];
	} | null>(null);
	const [unbanUser, setUnbanUser] = useState(false);

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			enabled: false,
			punishmentother: "WARN",
			punishmentleaker: "WARN",
			punishmentcheater: "WARN",
			punishmentsupporter: "KICK",
			punishmentowner: "BAN",
			roleid: "none",
			unbanenabled: true,
			unbanother: true,
			unbanleaker: true,
			unbancheater: true,
			unbansupporter: true,
			unbanowner: true,
		},
	});

	const fetchData = useCallback(async () => {
		setLoading(true);
		try {
			const res = await fetch(
				`/api/dashboard?guildid=${selectedServer}&userid=${session?.user?.id}`,
			);
			const data = await res.json();
			setServerData(data);

			if (data.status === "error") {
				toast({
					variant: "destructive",
					title: "Error",
					description: data.message,
				});
				return;
			}

			form.reset({
				enabled: data.settings.enabled,
				punishmentother: data.settings.other,
				punishmentleaker: data.settings.leaker,
				punishmentcheater: data.settings.cheater,
				punishmentsupporter: data.settings.supporter,
				punishmentowner: data.settings.owner,
				roleid: data.settings.roleId || "none",
				unbanenabled: data.settings.unban.enabled,
				unbanother: data.settings.unban.other,
				unbanleaker: data.settings.unban.leaker,
				unbancheater: data.settings.unban.cheater,
				unbansupporter: data.settings.unban.supporter,
				unbanowner: data.settings.unban.owner,
			});
			setUnbanUser(data.settings.unban.enabled);
			setSubmittedEnableStatus(data.settings.enabled);

			setLoading(false);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	}, [selectedServer, session?.user?.id, form.reset]);

	const updateServer = async (
		guildId: string,
		userId: string,
		data: z.infer<typeof FormSchema>,
	) => {
		scrollToTop();

		try {
			setLoading(true);
			const res = await fetch("/api/dashboard", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					guildId,
					userId,
					data,
				}),
			});

			return res.json();
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Error",
				description:
					"Something went wrong while updating the server, try again later. Or contact support if the issue persists.",
			});
			return null;
		} finally {
			setLoading(false);
		}
	};

	const onSubmit = async (data: z.infer<typeof FormSchema>) => {
		if (session?.user?.id) {
			const response = await updateServer(
				selectedServer,
				session.user.id,
				data,
			);
			if (response?.status === "success") {
				toast({
					variant: "success",
					title: "Success",
					description: "Server updated successfully",
				});
			} else {
				toast({
					variant: "destructive",
					title: "Error",
					description:
						"Something went wrong while updating the server, try again later. Or contact support if the issue persists.",
				});
			}
		} else {
			toast({
				variant: "destructive",
				title: "Error",
				description:
					"You need to sign in to update the server. Please logout and login again.",
			});
		}
		setSubmittedEnableStatus(data.enabled);
	};

	const refreshRoles = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		if (session?.user?.id) {
			setLoading(true);
			scrollToTop();
			const res = await fetch(
				`/api/revalidate?userid=${session?.user?.id}&type=roles`,
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

			setLoading(false);

			if (selectedServer && session?.user?.id) {
				fetchData();
			}
		}
	};

	useEffect(() => {
		if (session?.guilds && session.guilds.length > 0) {
			setSelectedServer(session.guilds[0].id);
		}
	}, [session]);

	useEffect(() => {
		if (selectedServer && session?.user?.id) {
			fetchData();
		}
	}, [selectedServer, session?.user?.id, fetchData]);

	return (
		<Section className="md:py-0 sm:py-0 px-0 py-0 animate-appear opacity-0">
			<div className="mx-auto flex max-w-container flex-col py-8 px-3 md:py-12">
				<div className="flex flex-col bg-white/5 rounded-md p-5 md:p-6">
					{loading || status === "loading" ? (
						<div className="flex flex-wrap gap-6">
							<div className="flex w-full flex-wrap">
								<div className="flex flex-1 justify-end items-center w-full gap-5">
									<Skeleton className="w-[104px] h-[36px] bg-white/50 opacity-20" />
									<Skeleton className="w-[180px] h-[36px] bg-white/50 opacity-20" />
								</div>
								<div className="flex flex-wrap w-full gap-8 mt-6">
									<div className="w-full space-y-6 bg-background/60 p-6 rounded-md">
										<Skeleton className="w-[100%] h-[120px] bg-white/50 opacity-20" />
										<Skeleton className="w-[100%] h-[120px] bg-white/50 opacity-20" />
										<Skeleton className="w-[100%] h-[120px] bg-white/50 opacity-20" />
										<Skeleton className="w-[100%] h-[120px] bg-white/50 opacity-20" />
										<Skeleton className="w-[100%] h-[120px] bg-white/50 opacity-20" />
									</div>
								</div>
							</div>
						</div>
					) : session ? (
						(session?.guilds?.length ?? 0) > 0 ? (
							<div className="flex flex-wrap gap-6">
								<div className="flex w-full flex-wrap">
									<div className="flex flex-col md:flex-row flex-1 w-full gap-5 items-center">
										{serverData?.status === "success" ? (
											<p className="mr-auto ">
												Warden is currently{" "}
												<strong>
													{submittedEnableStatus ? "enabled" : "disabled"}{" "}
												</strong>
												on this server
											</p>
										) : null}
										<div className="flex items-center gap-5 ml-auto">
											<p>Select a server</p>
											<Select
												value={selectedServer}
												onValueChange={setSelectedServer}
											>
												<SelectTrigger className="w-[180px] border-white/50 bg-background/50">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{session.guilds.map((guild) => (
														<SelectItem key={guild?.id} value={guild?.id}>
															{guild?.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									</div>
								</div>
								{serverData?.status === "success" ? (
									<div className="flex flex-row w-full gap-8">
										<Form {...form}>
											<form
												onSubmit={form.handleSubmit(onSubmit)}
												className="w-full space-y-6 bg-background/60 p-6 rounded-md"
											>
												<div>
													<h2 className="mb-4 text-2xl font-medium">
														Warden configuration
													</h2>
													<p className="mb-4">
														If a server is missing from the "Select a server"
														dropdown, try logging out and logging back in.
													</p>
													<h3 className="mb-4 pt-2 text-lg font-medium">
														Enable Warden
													</h3>
													<div className="space-y-4">
														<FormField
															control={form.control}
															name="enabled"
															render={({ field }) => (
																<FormItem className="flex gap-5 bg-background/50 flex-row items-center justify-between rounded-md border p-3 shadow-sm">
																	<div className="space-y-0.5">
																		<FormLabel>Enable</FormLabel>
																		<FormDescription>
																			Enable the Warden bot for this server
																		</FormDescription>
																	</div>
																	<FormControl>
																		<Switch
																			checked={field.value}
																			onCheckedChange={field.onChange}
																		/>
																	</FormControl>
																</FormItem>
															)}
														/>
														<h3 className="pt-2 text-lg font-medium">
															Punishment for each type
														</h3>
														<div className="flex flex-col md:flex-row  gap-4">
															<FormField
																control={form.control}
																name="punishmentother"
																render={({ field }) => (
																	<FormItem className="flex gap-5 bg-background/50 flex-row items-center justify-between rounded-md border p-3 shadow-sm w-full md:w-1/2">
																		<div className="space-y-0.5">
																			<FormLabel>
																				Punishment type for other
																			</FormLabel>
																			<FormDescription>
																				Choose the punishment for the "other"
																				type
																			</FormDescription>
																		</div>
																		<FormControl>
																			<Select
																				value={field.value}
																				onValueChange={field.onChange}
																			>
																				<SelectTrigger className="w-[180px] border-white/50 bg-background/50">
																					<SelectValue />
																				</SelectTrigger>
																				<SelectContent>
																					<SelectItem value="BAN">
																						Ban
																					</SelectItem>
																					<SelectItem value="KICK">
																						Kick
																					</SelectItem>
																					<SelectItem value="WARN">
																						Warn
																					</SelectItem>
																					<SelectItem value="ROLE">
																						Role
																					</SelectItem>
																				</SelectContent>
																			</Select>
																		</FormControl>
																	</FormItem>
																)}
															/>
															<FormField
																control={form.control}
																name="punishmentleaker"
																render={({ field }) => (
																	<FormItem className="flex gap-5 bg-background/50 flex-row items-center justify-between rounded-md border p-3 shadow-sm w-full md:w-1/2">
																		<div className="space-y-0.5">
																			<FormLabel>
																				Punishment type for leaker
																			</FormLabel>
																			<FormDescription>
																				Choose the punishment for the "leaker"
																				type
																			</FormDescription>
																		</div>
																		<FormControl>
																			<Select
																				value={field.value}
																				onValueChange={field.onChange}
																			>
																				<SelectTrigger className="w-[180px] border-white/50 bg-background/50">
																					<SelectValue />
																				</SelectTrigger>
																				<SelectContent>
																					<SelectItem value="BAN">
																						Ban
																					</SelectItem>
																					<SelectItem value="KICK">
																						Kick
																					</SelectItem>
																					<SelectItem value="WARN">
																						Warn
																					</SelectItem>
																					<SelectItem value="ROLE">
																						Role
																					</SelectItem>
																				</SelectContent>
																			</Select>
																		</FormControl>
																	</FormItem>
																)}
															/>
														</div>
														<div className="flex flex-col md:flex-row  gap-4">
															<FormField
																control={form.control}
																name="punishmentcheater"
																render={({ field }) => (
																	<FormItem className="flex gap-5 bg-background/50 flex-row items-center justify-between rounded-md border p-3 shadow-sm w-full md:w-1/2">
																		<div className="space-y-0.5">
																			<FormLabel>
																				Punishment type for cheater
																			</FormLabel>
																			<FormDescription>
																				Choose the punishment for the "cheater"
																				type
																			</FormDescription>
																		</div>
																		<FormControl>
																			<Select
																				value={field.value}
																				onValueChange={field.onChange}
																			>
																				<SelectTrigger className="w-[180px] border-white/50 bg-background/50">
																					<SelectValue />
																				</SelectTrigger>
																				<SelectContent>
																					<SelectItem value="BAN">
																						Ban
																					</SelectItem>
																					<SelectItem value="KICK">
																						Kick
																					</SelectItem>
																					<SelectItem value="WARN">
																						Warn
																					</SelectItem>
																					<SelectItem value="ROLE">
																						Role
																					</SelectItem>
																				</SelectContent>
																			</Select>
																		</FormControl>
																	</FormItem>
																)}
															/>
															<FormField
																control={form.control}
																name="punishmentsupporter"
																render={({ field }) => (
																	<FormItem className="flex gap-5 bg-background/50 flex-row items-center justify-between rounded-md border p-3 shadow-sm w-full md:w-1/2">
																		<div className="space-y-0.5">
																			<FormLabel>
																				Punishment type for supporter
																			</FormLabel>
																			<FormDescription>
																				Choose the punishment for the
																				"supporter" type
																			</FormDescription>
																		</div>
																		<FormControl>
																			<Select
																				value={field.value}
																				onValueChange={field.onChange}
																			>
																				<SelectTrigger className="w-[180px] border-white/50 bg-background/50">
																					<SelectValue />
																				</SelectTrigger>
																				<SelectContent>
																					<SelectItem value="BAN">
																						Ban
																					</SelectItem>
																					<SelectItem value="KICK">
																						Kick
																					</SelectItem>
																					<SelectItem value="WARN">
																						Warn
																					</SelectItem>
																					<SelectItem value="ROLE">
																						Role
																					</SelectItem>
																				</SelectContent>
																			</Select>
																		</FormControl>
																	</FormItem>
																)}
															/>
														</div>
														<FormField
															control={form.control}
															name="punishmentowner"
															render={({ field }) => (
																<FormItem className="flex gap-5 bg-background/50 flex-row items-center justify-between rounded-md border p-3 shadow-sm">
																	<div className="space-y-0.5">
																		<FormLabel>
																			Punishment type for owner
																		</FormLabel>
																		<FormDescription>
																			Choose the punishment for the "owner" type
																		</FormDescription>
																	</div>
																	<FormControl>
																		<Select
																			value={field.value}
																			onValueChange={field.onChange}
																		>
																			<SelectTrigger className="w-[180px] lg:w-[558px] border-white/50 bg-background/50">
																				<SelectValue />
																			</SelectTrigger>
																			<SelectContent>
																				<SelectItem value="BAN">Ban</SelectItem>
																				<SelectItem value="KICK">
																					Kick
																				</SelectItem>
																				<SelectItem value="WARN">
																					Warn
																				</SelectItem>
																				<SelectItem value="ROLE">
																					Role
																				</SelectItem>
																			</SelectContent>
																		</Select>
																	</FormControl>
																</FormItem>
															)}
														/>
														<h3 className="pt-2 text-lg font-medium">
															Punishment role
														</h3>
														<FormField
															control={form.control}
															name="roleid"
															render={({ field }) => (
																<FormItem className="flex gap-5 bg-background/50 flex-row items-center justify-between rounded-md border p-3 shadow-sm">
																	<div className="space-y-0.5">
																		<FormLabel>Role</FormLabel>
																		<FormDescription>
																			Select a role to give to a blacklisted
																			user
																		</FormDescription>
																	</div>
																	<FormControl>
																		<Select
																			value={field.value}
																			onValueChange={field.onChange}
																		>
																			<SelectTrigger className="w-[180px] lg:w-[558px] border-white/50 bg-background/50">
																				<SelectValue />
																			</SelectTrigger>
																			<SelectContent>
																				<SelectItem value="none">
																					None
																				</SelectItem>
																				{serverData?.roles.map((role) => (
																					<SelectItem
																						key={role.id}
																						value={role.id}
																					>
																						{role.name}
																					</SelectItem>
																				))}
																			</SelectContent>
																		</Select>
																	</FormControl>
																</FormItem>
															)}
														/>
														<div className="flex w-full justify-end">
															<Button
																className="gap-2"
																onClick={(e) => refreshRoles(e)}
															>
																<FontAwesomeIcon icon={faRefresh} /> Refresh
																roles
															</Button>
														</div>
														<h3 className="pt-2 text-lg font-medium">
															Unban users
														</h3>
														<FormField
															control={form.control}
															name="unbanenabled"
															render={({ field }) => (
																<FormItem className="flex gap-5 bg-background/50 flex-row items-center justify-between rounded-md border p-3 shadow-sm">
																	<div className="space-y-0.5">
																		<FormLabel>Automatic unban</FormLabel>
																		<FormDescription>
																			Automatically unban users when their
																			appeal is accepted. This is a global
																			setting. When enabled, you can also
																			configure it for each specific type below.
																		</FormDescription>
																	</div>
																	<FormControl>
																		<Switch
																			checked={field.value}
																			onCheckedChange={(checked) => {
																				field.onChange(checked);
																				setUnbanUser(checked);
																			}}
																		/>
																	</FormControl>
																</FormItem>
															)}
														/>
														<div className="flex flex-col md:flex-row  gap-4">
															<FormField
																control={form.control}
																name="unbanother"
																render={({ field }) => (
																	<FormItem className="flex gap-5 bg-background/50 flex-row items-center justify-between rounded-md border p-3 shadow-sm w-full md:w-1/2">
																		<div className="space-y-0.5">
																			<FormLabel>Unban other</FormLabel>
																			<FormDescription>
																				Automatically unban users with the
																				"other" type.
																			</FormDescription>
																		</div>
																		<FormControl>
																			<Switch
																				disabled={!unbanUser}
																				checked={field.value}
																				onCheckedChange={field.onChange}
																			/>
																		</FormControl>
																	</FormItem>
																)}
															/>
															<FormField
																control={form.control}
																name="unbanleaker"
																render={({ field }) => (
																	<FormItem className="flex gap-5 bg-background/50 flex-row items-center justify-between rounded-md border p-3 shadow-sm w-full md:w-1/2">
																		<div className="space-y-0.5">
																			<FormLabel>Unban leaker</FormLabel>
																			<FormDescription>
																				Automatically unban users with the
																				"leaker" type.
																			</FormDescription>
																		</div>
																		<FormControl>
																			<Switch
																				disabled={!unbanUser}
																				checked={field.value}
																				onCheckedChange={field.onChange}
																			/>
																		</FormControl>
																	</FormItem>
																)}
															/>
														</div>
														<div className="flex flex-col md:flex-row  gap-4">
															<FormField
																control={form.control}
																name="unbancheater"
																render={({ field }) => (
																	<FormItem className="flex gap-5 bg-background/50 flex-row items-center justify-between rounded-md border p-3 shadow-sm w-full md:w-1/2">
																		<div className="space-y-0.5">
																			<FormLabel>Unban cheater</FormLabel>
																			<FormDescription>
																				Automatically unban users with the
																				"cheater" type.
																			</FormDescription>
																		</div>
																		<FormControl>
																			<Switch
																				disabled={!unbanUser}
																				checked={field.value}
																				onCheckedChange={field.onChange}
																			/>
																		</FormControl>
																	</FormItem>
																)}
															/>
															<FormField
																control={form.control}
																name="unbansupporter"
																render={({ field }) => (
																	<FormItem className="flex gap-5 bg-background/50 flex-row items-center justify-between rounded-md border p-3 shadow-sm w-full md:w-1/2">
																		<div className="space-y-0.5">
																			<FormLabel>Unban supporter</FormLabel>
																			<FormDescription>
																				Automatically unban users with the
																				"supporter" type.
																			</FormDescription>
																		</div>
																		<FormControl>
																			<Switch
																				disabled={!unbanUser}
																				checked={field.value}
																				onCheckedChange={field.onChange}
																			/>
																		</FormControl>
																	</FormItem>
																)}
															/>
														</div>
														<FormField
															control={form.control}
															name="unbanowner"
															render={({ field }) => (
																<FormItem className="flex gap-5 bg-background/50 flex-row items-center justify-between rounded-md border p-3 shadow-sm">
																	<div className="space-y-0.5">
																		<FormLabel>Unban owner</FormLabel>
																		<FormDescription>
																			Automatically unban users with the "owner"
																			type.
																		</FormDescription>
																	</div>
																	<FormControl>
																		<Switch
																			disabled={!unbanUser}
																			checked={field.value}
																			onCheckedChange={field.onChange}
																		/>
																	</FormControl>
																</FormItem>
															)}
														/>
													</div>
												</div>
												<Button type="submit">Submit</Button>
											</form>
										</Form>
									</div>
								) : (
									<div className="w-full space-y-6 bg-background/60 p-6 rounded-md">
										<p>You don't have the permissions to edit this server</p>
									</div>
								)}
							</div>
						) : (
							<p>
								No servers found. If you think this is an error, try logging out
								and logging in again.
							</p>
						)
					) : (
						"You need to sign in"
					)}
				</div>
			</div>
		</Section>
	);
};

export default DashboardContent;
