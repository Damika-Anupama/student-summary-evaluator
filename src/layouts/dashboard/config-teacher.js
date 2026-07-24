import ChartBarIcon from "@heroicons/react/24/solid/ChartBarIcon";
import CogIcon from "@heroicons/react/24/solid/CogIcon";
import LockClosedIcon from "@heroicons/react/24/solid/LockClosedIcon";
import ShoppingBagIcon from "@heroicons/react/24/solid/ShoppingBagIcon";
import UserIcon from "@heroicons/react/24/solid/UserIcon";
import UserPlusIcon from "@heroicons/react/24/solid/UserPlusIcon";
import UsersIcon from "@heroicons/react/24/solid/UsersIcon";
import XCircleIcon from "@heroicons/react/24/solid/XCircleIcon";
import RectangleStackIcon from "@heroicons/react/24/solid/RectangleStackIcon";
import DocumentChartBarIcon from "@heroicons/react/24/solid/DocumentChartBarIcon";
import { SvgIcon } from "@mui/material";

export const itemsTeacher = [
	{
		title: "Overview",
		path: "/",
		icon: (
			<SvgIcon fontSize="small">
				<ChartBarIcon />
			</SvgIcon>
		),
	},
	{
		title: "Assignments",
		path: "/assignments",
		icon: (
			<SvgIcon fontSize="small">
				<RectangleStackIcon />
			</SvgIcon>
		),
	},
	{
		title: "Students",
		path: "/students",
		icon: (
			<SvgIcon fontSize="small">
				<UsersIcon />
			</SvgIcon>
		),
	},
	// {
	// 	title: "Account",
	// 	path: "/account",
	// 	icon: (
	// 		<SvgIcon fontSize="small">
	// 			<UserIcon />
	// 		</SvgIcon>
	// 	),
	// },
	{
		title: "Class report",
		path: "/report",
		icon: (
			<SvgIcon fontSize="small">
				<DocumentChartBarIcon />
			</SvgIcon>
		),
	},
	{
		title: "Settings",
		path: "/settings",
		icon: (
			<SvgIcon fontSize="small">
				<CogIcon />
			</SvgIcon>
		),
	},
	// {
	// 	title: "Login",
	// 	path: "/auth/login",
	// 	icon: (
	// 		<SvgIcon fontSize="small">
	// 			<LockClosedIcon />
	// 		</SvgIcon>
	// 	),
	// },
	// {
	// 	title: "Register",
	// 	path: "/auth/register",
	// 	icon: (
	// 		<SvgIcon fontSize="small">
	// 			<UserPlusIcon />
	// 		</SvgIcon>
	// 	),
	// },
	// {
	// 	title: "Error",
	// 	path: "/404",
	// 	icon: (
	// 		<SvgIcon fontSize="small">
	// 			<XCircleIcon />
	// 		</SvgIcon>
	// 	),
	// },
];
