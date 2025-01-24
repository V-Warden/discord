'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination'
import { Section } from '@/components/ui/section'
import { Skeleton } from '@/components/ui/skeleton'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import scrollToTop from '@/lib/scrollToTop'
import { useEffect, useRef, useState } from 'react'

const BadServersTable = () => {
	useEffect(() => {
		scrollToTop()
	}, [])

	const [data, setData] = useState<{
		count: number
		servers: {
			id: string
			name: string
			type: string
			reason: string
			createdAt: string
		}[]
	} | null>(null)
	const [isLoading, setLoading] = useState(true)
	const [search, setSearch] = useState('')
	const [submitSearch, setSubmitSearch] = useState(false)
	const [offset, setOffset] = useState(0)
	const limit = 10

	const fetchData = async (search: string, offset: number) => {
		setLoading(true)
		try {
			const res = await fetch(
				`/api/badservers?search=${search}&offset=${offset}&limit=${limit}`,
				{
					headers: {
						'Cache-Control': 'public, max-age=3600',
					},
				}
			)
			const data = await res.json()
			setData(data)
			setLoading(false)
		} catch (error) {
			console.error(error)
		}
	}
	const fetchServers = useRef(fetchData)

	const formatDate = (dateString: string) => {
		const options: Intl.DateTimeFormatOptions = {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		}
		return new Date(dateString).toLocaleDateString(undefined, options)
	}

	const searchAction = (e: React.FormEvent) => {
		e.preventDefault()
		if (search === '') return
		setSubmitSearch(true)
		setOffset(0)
		fetchServers.current(search, 0)
	}

	const resetSearch = () => {
		setSearch('')
		setSubmitSearch(false)
		setOffset(0)
		fetchServers.current('', 0)
	}

	const handlePrevious = (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault()
		if (offset > 0) {
			const newOffset = Math.max(0, offset - limit)
			setOffset(newOffset)
			fetchServers.current(search, newOffset)
		}
	}

	const handleNext = (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault()
		if (data && offset + limit < data.count) {
			const newOffset = offset + limit
			setOffset(newOffset)
			fetchServers.current(search, newOffset)
		}
	}

	const isPreviousDisabled = offset === 0
	const isNextDisabled = data ? offset + limit >= data.count : true

	const generatePaginationItems = () => {
		const totalPages = data ? Math.ceil(data.count / limit) : 0
		const currentPage = Math.floor(offset / limit) + 1
		const maxButtons = 5
		const halfMaxButtons = Math.floor(maxButtons / 2)
		let startPage = Math.max(1, currentPage - halfMaxButtons)
		let endPage = Math.min(totalPages, currentPage + halfMaxButtons)

		if (currentPage <= halfMaxButtons) {
			endPage = Math.min(totalPages, maxButtons)
		} else if (currentPage + halfMaxButtons >= totalPages) {
			startPage = Math.max(1, totalPages - maxButtons + 1)
		}

		const pages = []
		for (let i = startPage; i <= endPage; i++) {
			pages.push(
				<PaginationItem key={i}>
					<PaginationLink
						href='#'
						onClick={(e) => {
							e.preventDefault()
							if (i === currentPage) return
							const newOffset = (i - 1) * limit
							setOffset(newOffset)
							fetchServers.current(search, newOffset)
						}}
						className={
							i === currentPage
								? 'font-bold cursor-not-allowed text-white hover:bg-transparent hover:text-white'
								: ''
						}
					>
						{i}
					</PaginationLink>
				</PaginationItem>
			)
		}

		return pages
	}

	useEffect(() => {
		fetchServers.current('', 0)
	}, [])

	return (
		<Section className='md:py-0 sm:py-0 px-0 py-0 animate-appear opacity-0'>
			<div className='mx-auto flex max-w-container flex-col py-8 px-3 md:py-12'>
				<div className='flex flex-col items-center bg-background/70 rounded-md p-5 md:p-8'>
					{isLoading ? (
						<>
							<div className='flex ml-auto w-96 mb-5'>
								<Skeleton className='w-[100%] h-[36px] bg-white/50 opacity-20' />
								<Skeleton className='w-[50%] h-[36px] bg-white/50 opacity-20 ml-2' />
							</div>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>
											<Skeleton className='w-[100%] h-[30px] bg-white/50 opacity-20' />
										</TableHead>
										<TableHead>
											<Skeleton className='w-[100%] h-[30px] bg-white/50 opacity-20' />
										</TableHead>
										<TableHead>
											<Skeleton className='w-[100%] h-[30px] bg-white/50 opacity-20' />
										</TableHead>
										<TableHead>
											<Skeleton className='w-[100%] h-[30px] bg-white/50 opacity-20' />
										</TableHead>
										<TableHead>
											<Skeleton className='w-[100%] h-[30px] bg-white/50 opacity-20' />
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{Array.from({ length: 10 }).map(() => (
										<TableRow key={crypto.randomUUID()}>
											<TableCell>
												<Skeleton className='w-[100%] h-[20px] bg-white/50 opacity-20' />
											</TableCell>
											<TableCell>
												<Skeleton className='w-[100%] h-[20px] bg-white/50 opacity-20' />
											</TableCell>
											<TableCell>
												<Skeleton className='w-[100%] h-[20px] bg-white/50 opacity-20' />
											</TableCell>
											<TableCell>
												<Skeleton className='w-[100%] h-[20px] bg-white/50 opacity-20' />
											</TableCell>
											<TableCell>
												<Skeleton className='w-[100%] h-[20px] bg-white/50 opacity-20' />
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</>
					) : (
						<>
							<div className='flex flex-wrap w-full mb-5 items-center gap-3'>
								<p className='w-auto mr-auto'>
									Total servers: <strong>{data?.count}</strong>
								</p>
								<form className='w-auto flex gap-3' onSubmit={searchAction}>
									{submitSearch ? (
										<Button variant={'outline'} onClick={resetSearch}>
											Reset
										</Button>
									) : null}
									<Input
										className='border-white/50 bg-background/50 ml-auto w-48'
										placeholder='Discord ID'
										value={search}
										onChange={(e) => setSearch(e.target.value)}
									/>
									<Button type='submit'>Search</Button>
								</form>
							</div>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>ID</TableHead>
										<TableHead>Name</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Reason</TableHead>
										<TableHead>Added at</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{data?.servers?.map(
										(server: {
											id: string
											name: string
											type: string
											reason: string
											createdAt: string
										}) => (
											<TableRow key={server.id}>
												<TableCell>{server.id}</TableCell>
												<TableCell>{server.name}</TableCell>
												<TableCell>{server.type}</TableCell>
												<TableCell>{server.reason}</TableCell>
												<TableCell>{formatDate(server.createdAt)}</TableCell>
											</TableRow>
										)
									)}
								</TableBody>
							</Table>
							<Pagination className='mt-8'>
								<PaginationContent>
									<PaginationItem>
										<PaginationPrevious
											href='#'
											onClick={handlePrevious}
											className={
												isPreviousDisabled
													? 'cursor-not-allowed text-white/50 hover:bg-transparent hover:text-white/50'
													: ''
											}
										/>
									</PaginationItem>
									{generatePaginationItems()}
									<PaginationItem>
										<PaginationNext
											href='#'
											onClick={handleNext}
											className={
												isNextDisabled
													? 'cursor-not-allowed text-white/50 hover:bg-transparent hover:text-white/50'
													: ''
											}
										/>
									</PaginationItem>
								</PaginationContent>
							</Pagination>
						</>
					)}
				</div>
			</div>
		</Section>
	)
}

export default BadServersTable
