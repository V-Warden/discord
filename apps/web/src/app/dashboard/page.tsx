'use client'

import { Section } from '@/components/ui/section'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'

const FormSchema = z.object({
	enable: z.boolean().default(false),
	punishmentother: z.string().default('WARN'),
	punishmentleaker: z.string().default('WARN'),
	punishmentcheater: z.string().default('WARN'),
	punishmentsupporter: z.string().default('KICK'),
	punishmentowner: z.string().default('BAN'),
	roleid: z.string().default(''),
})

const DashboardContent = () => {
	const { data: session, status } = useSession()
	const [selectedServer, setSelectedServer] = useState('')
	const [submittedEnableStatus, setSubmittedEnableStatus] = useState(false)

	console.log(session)

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			enable: false,
			punishmentother: 'WARN',
			punishmentleaker: 'WARN',
			punishmentcheater: 'WARN',
			punishmentsupporter: 'KICK',
			punishmentowner: 'BAN',
			roleid: '',
		},
	})

	useEffect(() => {
		if (session?.adminGuilds && session.adminGuilds.length > 0) {
			setSelectedServer(session.adminGuilds[0].id)
		}
	}, [session])

	useEffect(() => {
		const fetchData = async () => {
			const res = await fetch('/api/update', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ serverId: selectedServer }),
			})
			const data = await res.json()
			console.log(data)
		}
		if (selectedServer) {
			fetchData()
		}
	}, [selectedServer])

	useEffect(() => {
		setSubmittedEnableStatus(form.getValues('enable'))
	}, [form.getValues])

	function onSubmit(data: z.infer<typeof FormSchema>) {
		toast({
			title: 'You submitted the following values:',
			description: (
				<pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
					<code className='text-white'>{JSON.stringify(data, null, 2)}</code>
				</pre>
			),
		})
		setSubmittedEnableStatus(data.enable)
	}

	return (
		<Section className='md:py-0 sm:py-0 px-0 py-0 animate-appear opacity-0'>
			<div className='mx-auto flex max-w-container flex-col py-8 px-3 md:py-12'>
				<div className='flex flex-col bg-white/5 rounded-md p-5 md:p-6'>
					{status === 'loading' ? (
						<div className='flex flex-wrap gap-6'>
							<div className='flex w-full flex-wrap'>
								<div className='flex flex-1 justify-end items-center w-full gap-5'>
									<Skeleton className='w-[104px] h-[36px] bg-white/50 opacity-20' />
									<Skeleton className='w-[180px] h-[36px] bg-white/50 opacity-20' />
								</div>
								<div className='flex flex-wrap w-full gap-8 mt-8'>
									<div className='w-full space-y-6 bg-background/60 p-6 rounded-md'>
										<Skeleton className='w-[100%] h-[120px] bg-white/50 opacity-20' />
										<Skeleton className='w-[100%] h-[120px] bg-white/50 opacity-20' />
										<Skeleton className='w-[100%] h-[120px] bg-white/50 opacity-20' />
										<Skeleton className='w-[100%] h-[120px] bg-white/50 opacity-20' />
									</div>
								</div>
							</div>
						</div>
					) : session ? (
						<div className='flex flex-wrap gap-6'>
							<div className='flex w-full flex-wrap'>
								<div className='flex flex-col md:flex-row flex-1 w-full gap-5 items-center'>
									<p className='mr-auto '>
										Warden is currently{' '}
										<strong>{submittedEnableStatus ? 'enabled' : 'disabled'} </strong>
										on this server
									</p>
									<div className='flex items-center gap-5'>
										<p>Select a server</p>
										<Select value={selectedServer} onValueChange={setSelectedServer}>
											<SelectTrigger className='w-[180px] border-white/50 bg-background/50'>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{session.adminGuilds.map((guild) => (
													<SelectItem key={guild?.id} value={guild?.id}>
														{guild?.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>
							</div>
							<div className='flex flex-row w-full gap-8'>
								<Form {...form}>
									<form
										onSubmit={form.handleSubmit(onSubmit)}
										className='w-full space-y-6 bg-background/60 p-6 rounded-md'
									>
										<div>
											<h2 className='mb-4 text-2xl font-medium'>Warden configuration</h2>
											<h3 className='mb-4 pt-2 text-lg font-medium'>Enable Warden</h3>
											<div className='space-y-4'>
												<FormField
													control={form.control}
													name='enable'
													render={({ field }) => (
														<FormItem className='flex gap-5 bg-background/50 flex-row items-center justify-between rounded-md border p-3 shadow-sm'>
															<div className='space-y-0.5'>
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
												<h3 className='pt-2 text-lg font-medium'>
													Punishment for each type
												</h3>
												<div className='flex flex-col md:flex-row  gap-4'>
													<FormField
														control={form.control}
														name='punishmentother'
														render={({ field }) => (
															<FormItem className='flex gap-5 bg-background/50 flex-row items-center justify-between rounded-md border p-3 shadow-sm w-full md:w-1/2'>
																<div className='space-y-0.5'>
																	<FormLabel>Punishment type for other</FormLabel>
																	<FormDescription>
																		Choose the punishment type for the "other" type
																	</FormDescription>
																</div>
																<FormControl>
																	<Select value={field.value} onValueChange={field.onChange}>
																		<SelectTrigger className='w-[180px] border-white/50 bg-background/50'>
																			<SelectValue />
																		</SelectTrigger>
																		<SelectContent>
																			<SelectItem value='BAN'>Ban</SelectItem>
																			<SelectItem value='KICK'>Kick</SelectItem>
																			<SelectItem value='WARN'>Warn</SelectItem>
																			<SelectItem value='ROLE'>Role</SelectItem>
																		</SelectContent>
																	</Select>
																</FormControl>
															</FormItem>
														)}
													/>
													<FormField
														control={form.control}
														name='punishmentleaker'
														render={({ field }) => (
															<FormItem className='flex gap-5 bg-background/50 flex-row items-center justify-between rounded-md border p-3 shadow-sm w-full md:w-1/2'>
																<div className='space-y-0.5'>
																	<FormLabel>Punishment type for leaker</FormLabel>
																	<FormDescription>
																		Choose the punishment type for the "leaker" type
																	</FormDescription>
																</div>
																<FormControl>
																	<Select value={field.value} onValueChange={field.onChange}>
																		<SelectTrigger className='w-[180px] border-white/50 bg-background/50'>
																			<SelectValue />
																		</SelectTrigger>
																		<SelectContent>
																			<SelectItem value='BAN'>Ban</SelectItem>
																			<SelectItem value='KICK'>Kick</SelectItem>
																			<SelectItem value='WARN'>Warn</SelectItem>
																			<SelectItem value='ROLE'>Role</SelectItem>
																		</SelectContent>
																	</Select>
																</FormControl>
															</FormItem>
														)}
													/>
												</div>
												<div className='flex flex-col md:flex-row  gap-4'>
													<FormField
														control={form.control}
														name='punishmentcheater'
														render={({ field }) => (
															<FormItem className='flex gap-5 bg-background/50 flex-row items-center justify-between rounded-md border p-3 shadow-sm w-full md:w-1/2'>
																<div className='space-y-0.5'>
																	<FormLabel>Punishment type for cheater</FormLabel>
																	<FormDescription>
																		Choose the punishment type for the "cheater" type
																	</FormDescription>
																</div>
																<FormControl>
																	<Select value={field.value} onValueChange={field.onChange}>
																		<SelectTrigger className='w-[180px] border-white/50 bg-background/50'>
																			<SelectValue />
																		</SelectTrigger>
																		<SelectContent>
																			<SelectItem value='BAN'>Ban</SelectItem>
																			<SelectItem value='KICK'>Kick</SelectItem>
																			<SelectItem value='WARN'>Warn</SelectItem>
																			<SelectItem value='ROLE'>Role</SelectItem>
																		</SelectContent>
																	</Select>
																</FormControl>
															</FormItem>
														)}
													/>
													<FormField
														control={form.control}
														name='punishmentsupporter'
														render={({ field }) => (
															<FormItem className='flex gap-5 bg-background/50 flex-row items-center justify-between rounded-md border p-3 shadow-sm w-full md:w-1/2'>
																<div className='space-y-0.5'>
																	<FormLabel>Punishment type for supporter</FormLabel>
																	<FormDescription>
																		Choose the punishment type for the "supporter" type
																	</FormDescription>
																</div>
																<FormControl>
																	<Select value={field.value} onValueChange={field.onChange}>
																		<SelectTrigger className='w-[180px] border-white/50 bg-background/50'>
																			<SelectValue />
																		</SelectTrigger>
																		<SelectContent>
																			<SelectItem value='BAN'>Ban</SelectItem>
																			<SelectItem value='KICK'>Kick</SelectItem>
																			<SelectItem value='WARN'>Warn</SelectItem>
																			<SelectItem value='ROLE'>Role</SelectItem>
																		</SelectContent>
																	</Select>
																</FormControl>
															</FormItem>
														)}
													/>
												</div>
												<FormField
													control={form.control}
													name='punishmentowner'
													render={({ field }) => (
														<FormItem className='flex gap-5 bg-background/50 flex-row items-center justify-between rounded-md border p-3 shadow-sm'>
															<div className='space-y-0.5'>
																<FormLabel>Punishment type for owner</FormLabel>
																<FormDescription>
																	Choose the punishment type for the "owner" type
																</FormDescription>
															</div>
															<FormControl>
																<Select value={field.value} onValueChange={field.onChange}>
																	<SelectTrigger className='w-[180px] border-white/50 bg-background/50'>
																		<SelectValue />
																	</SelectTrigger>
																	<SelectContent>
																		<SelectItem value='BAN'>Ban</SelectItem>
																		<SelectItem value='KICK'>Kick</SelectItem>
																		<SelectItem value='WARN'>Warn</SelectItem>
																		<SelectItem value='ROLE'>Role</SelectItem>
																	</SelectContent>
																</Select>
															</FormControl>
														</FormItem>
													)}
												/>
												<h3 className='pt-2 text-lg font-medium'>Punishment role</h3>
												<FormField
													control={form.control}
													name='roleid'
													render={({ field }) => (
														<FormItem className='flex gap-5 bg-background/50 flex-row items-center justify-between rounded-md border p-3 shadow-sm'>
															<div className='space-y-0.5'>
																<FormLabel>Role</FormLabel>
																<FormDescription>
																	Select the role to give to the user
																</FormDescription>
															</div>
															<FormControl>
																<Select value={field.value} onValueChange={field.onChange}>
																	<SelectTrigger className='w-[180px] border-white/50 bg-background/50'>
																		<SelectValue />
																	</SelectTrigger>
																	<SelectContent>
																		{session.adminGuilds
																			.find((guild) => guild.id === selectedServer)
																			?.roles.map((role) => (
																				<SelectItem key={role.id} value={role.id}>
																					{role.name}
																				</SelectItem>
																			))}
																	</SelectContent>
																</Select>
															</FormControl>
														</FormItem>
													)}
												/>
											</div>
										</div>
										<Button type='submit'>Submit</Button>
									</form>
								</Form>
							</div>
						</div>
					) : (
						'You need to sign in'
					)}
				</div>
			</div>
		</Section>
	)
}

export default DashboardContent
