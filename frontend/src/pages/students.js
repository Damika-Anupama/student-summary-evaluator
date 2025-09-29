import { useCallback, useMemo, useState } from "react";
import Head from "next/head";
import { subDays, subHours } from "date-fns";
import ArrowDownOnSquareIcon from "@heroicons/react/24/solid/ArrowDownOnSquareIcon";
import ArrowUpOnSquareIcon from "@heroicons/react/24/solid/ArrowUpOnSquareIcon";
import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import {
	Box,
	Button,
	Container,
	Stack,
	SvgIcon,
	Typography,
} from "@mui/material";
import { useSelection } from "src/hooks/use-selection";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { StudentsTable } from "src/sections/student/students-table";
import { StudentsSearch } from "src/sections/student/students-search";
import { applyPagination } from "src/utils/apply-pagination";

const now = new Date();

const data1 = [
	{
		id: "5e887ac47eed253091be10cb",
		address: {
			city: "Cleveland",
			country: "USA",
			state: "Ohio",
			street: "2849 Fulton Street",
		},
		avatar: "/assets/avatars/avatar-carson-darrin.png",
		createdAt: subDays(subHours(now, 7), 1).getTime(),
		email: "carson.darrin@devias.io",
		name: "Carson Darrin",
		phone: "304-428-3097",
	},
	{
		id: "5e887b209c28ac3dd97f6db5",
		address: {
			city: "Atlanta",
			country: "USA",
			state: "Georgia",
			street: "1865  Pleasant Hill Road",
		},
		avatar: "/assets/avatars/avatar-fran-perez.png",
		createdAt: subDays(subHours(now, 1), 2).getTime(),
		email: "fran.perez@devias.io",
		name: "Fran Perez",
		phone: "712-351-5711",
	},
	{
		id: "5e887b7602bdbc4dbb234b27",
		address: {
			city: "North Canton",
			country: "USA",
			state: "Ohio",
			street: "4894  Lakeland Park Drive",
		},
		avatar: "/assets/avatars/avatar-jie-yan-song.png",
		createdAt: subDays(subHours(now, 4), 2).getTime(),
		email: "jie.yan.song@devias.io",
		name: "Jie Yan Song",
		phone: "770-635-2682",
	},
	{
		id: "5e86809283e28b96d2d38537",
		address: {
			city: "Madrid",
			country: "Spain",
			name: "Anika Visser",
			street: "4158  Hedge Street",
		},
		avatar: "/assets/avatars/avatar-anika-visser.png",
		createdAt: subDays(subHours(now, 11), 2).getTime(),
		email: "anika.visser@devias.io",
		name: "Anika Visser",
		phone: "908-691-3242",
	},
	{
		id: "5e86805e2bafd54f66cc95c3",
		address: {
			city: "San Diego",
			country: "USA",
			state: "California",
			street: "75247",
		},
		avatar: "/assets/avatars/avatar-miron-vitold.png",
		createdAt: subDays(subHours(now, 7), 3).getTime(),
		email: "miron.vitold@devias.io",
		name: "Miron Vitold",
		phone: "972-333-4106",
	},
	{
		id: "5e887a1fbefd7938eea9c981",
		address: {
			city: "Berkeley",
			country: "USA",
			state: "California",
			street: "317 Angus Road",
		},
		avatar: "/assets/avatars/avatar-penjani-inyene.png",
		createdAt: subDays(subHours(now, 5), 4).getTime(),
		email: "penjani.inyene@devias.io",
		name: "Penjani Inyene",
		phone: "858-602-3409",
	},
	{
		id: "5e887d0b3d090c1b8f162003",
		address: {
			city: "Carson City",
			country: "USA",
			state: "Nevada",
			street: "2188  Armbrester Drive",
		},
		avatar: "/assets/avatars/avatar-omar-darboe.png",
		createdAt: subDays(subHours(now, 15), 4).getTime(),
		email: "omar.darobe@devias.io",
		name: "Omar Darobe",
		phone: "415-907-2647",
	},
	{
		id: "5e88792be2d4cfb4bf0971d9",
		address: {
			city: "Los Angeles",
			country: "USA",
			state: "California",
			street: "1798  Hickory Ridge Drive",
		},
		avatar: "/assets/avatars/avatar-siegbert-gottfried.png",
		createdAt: subDays(subHours(now, 2), 5).getTime(),
		email: "siegbert.gottfried@devias.io",
		name: "Siegbert Gottfried",
		phone: "702-661-1654",
	},
	{
		id: "5e8877da9a65442b11551975",
		address: {
			city: "Murray",
			country: "USA",
			state: "Utah",
			street: "3934  Wildrose Lane",
		},
		avatar: "/assets/avatars/avatar-iulia-albu.png",
		createdAt: subDays(subHours(now, 8), 6).getTime(),
		email: "iulia.albu@devias.io",
		name: "Iulia Albu",
		phone: "313-812-8947",
	},
	{
		id: "5e8680e60cba5019c5ca6fda",
		address: {
			city: "Salt Lake City",
			country: "USA",
			state: "Utah",
			street: "368 Lamberts Branch Road",
		},
		avatar: "/assets/avatars/avatar-nasimiyu-danai.png",
		createdAt: subDays(subHours(now, 1), 9).getTime(),
		email: "nasimiyu.danai@devias.io",
		name: "Nasimiyu Danai",
		phone: "801-301-7894",
	},
];

const useStudents = (data, page, rowsPerPage) => {
	return useMemo(() => {
		return applyPagination(data, page, rowsPerPage);
	}, [page, rowsPerPage]);
};

const useStudentIds = (students) => {
	return useMemo(() => {
		return students.map((student) => student.id);
	}, [students]);
};

const fetchUsers = async () => {
	const users = await clerkClient.users.getUserList();
	return users;
};

const Page = (props) => {
	const [data, setData] = useState(() =>
		props.students.map((student) => {
			return {
				id: student.id,
				address: {
					city: "Salt Lake City",
					country: "USA",
					state: "Utah",
					street: "368 Lamberts Branch Road",
				},
				avatar: "/assets/avatars/avatar-nasimiyu-danai.png",
				createdAt: subDays(subHours(now, 1), 9).getTime(),
				email: "nasimiyu.danai@devias.io",
				name: student.firstName + " " + student.lastName,
				phone: "801-301-7894",
			};
		})
	);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const students = useStudents(data, page, rowsPerPage);
	const studentsIds = useStudentIds(students);
	const studentsSelection = useSelection(studentsIds);

	console.log(props.students);

	const handlePageChange = useCallback((event, value) => {
		setPage(value);
	}, []);

	const handleRowsPerPageChange = useCallback((event) => {
		setRowsPerPage(event.target.value);
	}, []);

	return (
		<>
			<Head>
				<title>Students | Summary Evaluation System</title>
			</Head>
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					py: 8,
				}}
			>
				<Container maxWidth="xl">
					<Stack spacing={3}>
						<Stack direction="row" justifyContent="space-between" spacing={4}>
							<Stack spacing={1}>
								<Typography variant="h4">Students</Typography>
								<Stack alignItems="center" direction="row" spacing={1}>
									<Button
										color="inherit"
										startIcon={
											<SvgIcon fontSize="small">
												<ArrowUpOnSquareIcon />
											</SvgIcon>
										}
									>
										Import
									</Button>
									<Button
										color="inherit"
										startIcon={
											<SvgIcon fontSize="small">
												<ArrowDownOnSquareIcon />
											</SvgIcon>
										}
									>
										Export
									</Button>
								</Stack>
							</Stack>
							<div>
								<Button
									startIcon={
										<SvgIcon fontSize="small">
											<PlusIcon />
										</SvgIcon>
									}
									variant="contained"
								>
									Add
								</Button>
							</div>
						</Stack>
						<StudentsSearch />
						<StudentsTable
							count={data.length}
							items={students}
							onDeselectAll={studentsSelection.handleDeselectAll}
							onDeselectOne={studentsSelection.handleDeselectOne}
							onPageChange={handlePageChange}
							onRowsPerPageChange={handleRowsPerPageChange}
							onSelectAll={studentsSelection.handleSelectAll}
							onSelectOne={studentsSelection.handleSelectOne}
							page={page}
							rowsPerPage={rowsPerPage}
							selected={studentsSelection.selected}
						/>
					</Stack>
				</Container>
			</Box>
		</>
	);
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export const getStaticProps = async () => {
	// Dummy students data
	const students = [
		{
			id: 1,
			firstName: "John",
			lastName: "Doe",
			email: "john.doe@example.com",
			contactNo: "1234567890",
			address: "123 Main St",
			createdAt: new Date("2025-01-15"),
		},
		{
			id: 2,
			firstName: "Jane",
			lastName: "Smith",
			email: "jane.smith@example.com",
			contactNo: "0987654321",
			address: "456 Oak Ave",
			createdAt: new Date("2025-01-20"),
		},
		{
			id: 3,
			firstName: "Mike",
			lastName: "Johnson",
			email: "mike.johnson@example.com",
			contactNo: "5551234567",
			address: "789 Pine Rd",
			createdAt: new Date("2025-02-01"),
		},
		{
			id: 4,
			firstName: "Emily",
			lastName: "Davis",
			email: "emily.davis@example.com",
			contactNo: "5559876543",
			address: "321 Elm St",
			createdAt: new Date("2025-02-10"),
		},
		{
			id: 5,
			firstName: "Sarah",
			lastName: "Wilson",
			email: "sarah.wilson@example.com",
			contactNo: "5555555555",
			address: "654 Maple Dr",
			createdAt: new Date("2025-02-15"),
		},
	];

	return {
		props: {
			students: JSON.parse(
				JSON.stringify(students, (key, value) =>
					typeof value === "bigint" ? value.toString() : value
				)
			),
		},
	};
};

export default Page;
