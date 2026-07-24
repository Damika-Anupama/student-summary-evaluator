import PropTypes from "prop-types";
import NextLink from "next/link";
import UserGroupIcon from "@heroicons/react/24/solid/UserGroupIcon";
import ClockIcon from "@heroicons/react/24/solid/ClockIcon";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
	Box,
	Card,
	CardContent,
	Chip,
	Divider,
	Stack,
	SvgIcon,
	Typography,
	CardActions,
	Button,
} from "@mui/material";
import { deadlineStatus } from "src/utils/deadline";
export const AssignmentCard = (props) => {
	const { assignment } = props;
	// `now` is injectable so the deadline label is deterministic in tests;
	// in the app the card only renders after a client fetch, so Date.now()
	// here is hydration-safe.
	const now = props.now ?? Date.now();
	const deadline = assignment.deadline
		? deadlineStatus(assignment.deadline, now)
		: null;
	// The roster the visitor edits in the students modal, so the chip and the
	// modal can never disagree about who is on the assignment.
	const studentCount = Array.isArray(assignment.studentIds)
		? assignment.studentIds.length
		: 0;
	const handleStudentModalOpen = () => {
		// The roster editor is a single shared modal, so it has to be told which
		// assignment it is editing before it opens.
		props.setStudentsAssignment?.(assignment);
		props.setOpenStudentsModal(true);
	};
	const handleEditClick = () => {
		props.setEditAssignment(assignment);
		props.setOpenEditModal(true);
	};
	const handleDeleteModalOpen = () => {
		props.setDeleteID(assignment.id);
		props.setOpenDeleteModal(true);
	};
	const handleViewClick = () => {
		props.setViewID(assignment.id);
		props.setOpenViewModal(true);
	};

	return (
		<Card
			sx={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
			}}
		>
			<CardContent sx={{ pb: 1.5 }}>
				{/* Fixture assignments (ids 1-5) have prebuilt detail pages;
				    session-created ones don't, so their titles stay plain. */}
				{assignment.id <= 5 ? (
					<Typography
						align="left"
						gutterBottom
						variant="h6"
						component={NextLink}
						href={`/assignments/${assignment.id}`}
						sx={{
							display: "block",
							color: "inherit",
							textDecoration: "none",
							"&:hover": { color: "primary.main" },
						}}
					>
						{assignment.title}
					</Typography>
				) : (
					<Typography align="left" gutterBottom variant="h6">
						{assignment.title}
					</Typography>
				)}
				<Typography align="left" variant="body1">
					{assignment.description}
				</Typography>
			</CardContent>
			<CardActions sx={{ px: 2, pb: 1.5 }}>
				<Button
					size="small"
					startIcon={<VisibilityIcon />}
					onClick={handleViewClick}
				>
					View
				</Button>
				<Button
					variant="outlined"
					size="small"
					startIcon={<EditIcon />}
					onClick={handleEditClick}
				>
					Edit
				</Button>
				{/* Flex spacer: CardActions' own child margin rule beats an sx
				    ml:auto on the button, so push with an element instead. */}
				<Box sx={{ flexGrow: 1 }} />
				<IconButton
					aria-label={`Delete ${assignment.title}`}
					color="error"
					onClick={handleDeleteModalOpen}
				>
					<DeleteIcon />
				</IconButton>
			</CardActions>
			<Box sx={{ flexGrow: 1 }} />
			<Divider />
			<Stack
				alignItems="center"
				direction="row"
				justifyContent="space-between"
				spacing={2}
				sx={{ p: 2 }}
			>
				<Stack alignItems="center" direction="row" spacing={1}>
					<SvgIcon color="action" fontSize="small">
						<ClockIcon />
					</SvgIcon>
					<Typography color="text.secondary" display="inline" variant="body2">
						{assignment.createdAt}
					</Typography>
					{deadline && (
						<Chip
							label={deadline.label}
							size="small"
							color={deadline.color}
							variant="outlined"
						/>
					)}
				</Stack>
				<Chip
					icon={
						<SvgIcon fontSize="small">
							<UserGroupIcon />
						</SvgIcon>
					}
					label={`${studentCount} ${studentCount === 1 ? "Student" : "Students"}`}
					size="small"
					variant="outlined"
					onClick={handleStudentModalOpen}
					aria-label={`Add or remove students on ${assignment.title} — ${studentCount} now`}
					sx={{ cursor: "pointer" }}
				/>
			</Stack>
		</Card>
	);
};

AssignmentCard.propTypes = {
	assignment: PropTypes.object.isRequired,
	now: PropTypes.number,
};
