"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SuggestedEvent } from "@/lib/db/schema/suggestedEvents";
import { trpc } from "@/lib/trpc/client";
import { nanoid } from "@/lib/utils";
import {
	type ColumnDef,
	type ColumnFiltersState,
	type SortingState,
	type VisibilityState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
	ArrowUpDown,
	CheckIcon,
	ChevronDown,
	Loader2,
	MoreHorizontal,
	XIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const locations = [
	"Virtual",
	"Conference Center",
	"University Auditorium",
	"City Park",
	"Community Center",
	"Local Library",
	"Art Gallery",
	"Sports Arena",
	"Hotel Ballroom",
	"Outdoor Amphitheater",
];

const eventTitles = [
	"Tech Innovation Summit",
	"Annual Charity Gala",
	"Environmental Awareness Workshop",
	"Local Food Festival",
	"Career Development Seminar",
	"Fitness and Wellness Expo",
	"Art and Culture Symposium",
	"Music in the Park",
	"Entrepreneurship Bootcamp",
	"Science Fair for Kids",
];

function randomDate(start: Date, end: Date): Date {
	return new Date(
		start.getTime() + Math.random() * (end.getTime() - start.getTime()),
	);
}

export const sampleSuggestedEvents: SuggestedEvent[] = Array.from(
	{ length: 20 },
	(_, index) => {
		const startDate = randomDate(new Date(2024, 0, 1), new Date(2024, 11, 31));
		const endDate = new Date(
			startDate.getTime() + Math.random() * 1000 * 60 * 60 * 8,
		); // Up to 8 hours later

		return {
			id: nanoid(),
			title: `${eventTitles[index % eventTitles.length]} ${index + 1}`,
			description: `This is a sample description for the ${eventTitles[index % eventTitles.length]} event.`,
			start: startDate,
			end: endDate,
			location: locations[Math.floor(Math.random() * locations.length)],
			createdAt: new Date(),
			updatedAt: new Date(),
			associatedOrganization: "Sample Organization",
			registrationLink: "https://example.com",
			status: "pending",
		};
	},
);

export const columns: ColumnDef<SuggestedEvent>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "title",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				Title
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => <div>{row.getValue("title")}</div>,
	},
	{
		accessorKey: "start",
		header: "Start Date",
		cell: ({ row }) => (
			<div>{format(new Date(row.getValue("start")), "PP 'at' p")}</div>
		),
	},
	{
		accessorKey: "end",
		header: "End Date",
		cell: ({ row }) => (
			<div>{format(new Date(row.getValue("end")), "PP 'at' p")}</div>
		),
	},
	{
		accessorKey: "location",
		header: "Location",
		cell: ({ row }) => <div>{row.getValue("location")}</div>,
	},
	{
		id: "actions",
		enableHiding: false,
		cell: ({ row }) => {
			const event = row.original;

			const utils = trpc.useUtils();
			const router = useRouter();

			const { mutate: acceptSuggestedEvent, isLoading: isAccepting } =
				trpc.suggestedEvents.acceptSuggestedEvent.useMutation({
					onSuccess: async (data) => {
						await utils.suggestedEvents.getSuggestedEvents.invalidate();
						router.refresh();
						toast.success("Accepted Event!");
					},
				});

			const { mutate: rejectSuggestedEvent, isLoading: isRejecting } =
				trpc.suggestedEvents.rejectSuggestedEvent.useMutation({
					onSuccess: async (data) => {
						await utils.suggestedEvents.getSuggestedEvents.invalidate();
						router.refresh();
						toast.success("Rejected Event!");
					},
				});

			return (
				<div className="flex gap-2">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger>
								<Button
									variant="ghost"
									className="h-8 w-8 p-0"
									onClick={() => acceptSuggestedEvent({ id: event.id })}
									disabled={isAccepting}
								>
									<span className="sr-only">Open menu</span>
									{isAccepting ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<CheckIcon className="h-4 w-4" />
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								{isAccepting ? "Accepting..." : "Accept Suggested Event"}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger>
								<Button
									variant="ghost"
									className="h-8 w-8 p-0"
									onClick={() => rejectSuggestedEvent({ id: event.id })}
									disabled={isRejecting}
								>
									<span className="sr-only">Open menu</span>
									{isRejecting ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<XIcon className="h-4 w-4" />
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								{isRejecting ? "Rejecting..." : "Reject Suggested Event"}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Actions</DropdownMenuLabel>
							<DropdownMenuItem
								onClick={() => navigator.clipboard.writeText(event.id)}
							>
								Copy event ID
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem>View event details</DropdownMenuItem>
							<DropdownMenuItem>Edit event</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			);
		},
	},
];

export default function SuggestedEvents() {
	return (
		<div className="flex min-h-screen flex-col">
			<main className="flex-1">
				<section className="w-full py-6 sm:py-12 md:py-24">
					<div className="container px-4 md:px-6">
						<h1 className="mb-6 font-bold text-3xl tracking-tighter sm:text-4xl">
							Suggested Events
						</h1>
						<DataTableDemo />
					</div>
				</section>
			</main>
			<footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
				<p>© 2024 YEEMail. All rights reserved.</p>
			</footer>
		</div>
	);
}

export function DataTableDemo() {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState({});

	const table = useReactTable({
		data: sampleSuggestedEvents,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
	});

	return (
		<div className="w-full">
			<div className="flex items-center py-4">
				<Input
					placeholder="Filter emails..."
					value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
					onChange={(event) =>
						table.getColumn("email")?.setFilterValue(event.target.value)
					}
					className="max-w-sm"
				/>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="ml-auto">
							Columns <ChevronDown className="ml-2 h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{table
							.getAllColumns()
							.filter((column) => column.getCanHide())
							.map((column) => {
								return (
									<DropdownMenuCheckboxItem
										key={column.id}
										className="capitalize"
										checked={column.getIsVisible()}
										onCheckedChange={(value) =>
											column.toggleVisibility(!!value)
										}
									>
										{column.id}
									</DropdownMenuCheckboxItem>
								);
							})}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-end space-x-2 py-4">
				<div className="flex-1 text-muted-foreground text-sm">
					{table.getFilteredSelectedRowModel().rows.length} of{" "}
					{table.getFilteredRowModel().rows.length} row(s) selected.
				</div>
				<div className="space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}
