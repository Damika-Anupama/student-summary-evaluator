import ChartBarIcon from "@heroicons/react/24/solid/ChartBarIcon";
import RectangleStackIcon from "@heroicons/react/24/solid/RectangleStackIcon";
import ClipboardDocumentListIcon from "@heroicons/react/24/solid/ClipboardDocumentListIcon";
import { SvgIcon } from "@mui/material";

export const itemsStudent = [
	{
		title: "Dashboard",
		path: "/dashboard-student",
		icon: (
			<SvgIcon fontSize="small">
				<ChartBarIcon />
			</SvgIcon>
		),
	},
	{
		title: "Assignments",
		path: "/assignments-student",
		icon: (
			<SvgIcon fontSize="small">
				<ClipboardDocumentListIcon />
			</SvgIcon>
		),
	},
	{
		title: "History",
		path: "/history-student",
		icon: (
			<SvgIcon fontSize="small">
				<RectangleStackIcon />
			</SvgIcon>
		),
	},
];
