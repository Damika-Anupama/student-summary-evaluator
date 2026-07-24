import { useEffect, useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Checkbox from "@mui/material/Checkbox";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import {
	Box,
	Modal,
	Card,
	CardHeader,
	CardContent,
	CardActions,
	Typography,
} from "@mui/material";
import { useSnackbar } from "src/contexts/snackbar-context";
import { useDemoOverlay } from "src/hooks/use-demo-overlay";
import {
	ASSIGNMENTS_KEY,
	STUDENTS_KEY,
	isPersistent,
} from "src/demo/local-store";
import { rosterIdsFor, saveRoster, studentDirectory } from "src/demo/roster";

function not(a, b) {
	return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a, b) {
	return a.filter((value) => b.indexOf(value) !== -1);
}

function union(a, b) {
	return [...a, ...not(b, a)];
}

/**
 * Two-column student picker. Membership is controlled by the caller —
 * `selectedIds` is the roster and `onChange` gets the next one — so the
 * component itself owns nothing that has to be persisted.
 */
export function StudentTransferList(props) {
	const { students = [], selectedIds = [], onChange } = props;
	const [checked, setChecked] = useState([]);

	const enrolled = useMemo(
		() => students.filter((s) => selectedIds.includes(s.id)),
		[students, selectedIds]
	);
	const available = useMemo(
		() => students.filter((s) => !selectedIds.includes(s.id)),
		[students, selectedIds]
	);

	const idsOf = (items) => items.map((item) => item.id);
	const leftChecked = intersection(checked, idsOf(available));
	const rightChecked = intersection(checked, idsOf(enrolled));

	const handleToggle = (id) => () => {
		setChecked((prev) =>
			prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
		);
	};

	const numberOfChecked = (items) => intersection(checked, idsOf(items)).length;

	const handleToggleAll = (items) => () => {
		const ids = idsOf(items);
		setChecked((prev) =>
			intersection(prev, ids).length === ids.length
				? not(prev, ids)
				: union(prev, ids)
		);
	};

	const handleCheckedRight = () => {
		onChange?.([...selectedIds, ...leftChecked]);
		setChecked(not(checked, leftChecked));
	};

	const handleCheckedLeft = () => {
		onChange?.(not(selectedIds, rightChecked));
		setChecked(not(checked, rightChecked));
	};

	const customList = (title, items, emptyText) => (
		<Card variant="outlined">
			<CardHeader
				sx={{ px: 2, py: 1 }}
				avatar={
					<Checkbox
						onClick={handleToggleAll(items)}
						checked={
							numberOfChecked(items) === items.length && items.length !== 0
						}
						indeterminate={
							numberOfChecked(items) !== items.length &&
							numberOfChecked(items) !== 0
						}
						disabled={items.length === 0}
						inputProps={{
							"aria-label": `Select all ${title.toLowerCase()} students`,
						}}
					/>
				}
				title={title}
				subheader={`${numberOfChecked(items)}/${items.length} selected`}
			/>
			<Divider />
			<List
				sx={{
					width: 200,
					height: 230,
					bgcolor: "background.paper",
					overflow: "auto",
				}}
				dense
				aria-label={title}
			>
				{items.length === 0 && (
					<Typography
						color="text.secondary"
						variant="body2"
						sx={{ px: 2, py: 2 }}
					>
						{emptyText}
					</Typography>
				)}
				{items.map((student) => {
					const labelId = `transfer-list-item-${student.id}`;
					const isChecked = checked.includes(student.id);

					return (
						<ListItem key={student.id} disablePadding>
							{/* The row is the control: one focusable, Enter/Space
							    operable checkbox per student. */}
							<ListItemButton
								role="checkbox"
								aria-checked={isChecked}
								aria-labelledby={labelId}
								onClick={handleToggle(student.id)}
								sx={{
									"&:focus-visible": {
										outline: (t) => `2px solid ${t.palette.primary.main}`,
										outlineOffset: -2,
									},
								}}
							>
								<ListItemIcon sx={{ minWidth: 36 }}>
									{isChecked ? (
										<CheckBoxIcon fontSize="small" color="primary" />
									) : (
										<CheckBoxOutlineBlankIcon fontSize="small" color="action" />
									)}
								</ListItemIcon>
								<ListItemText id={labelId} primary={student.name} />
							</ListItemButton>
						</ListItem>
					);
				})}
			</List>
		</Card>
	);

	return (
		<Grid container spacing={2} justifyContent="center" alignItems="center">
			<Grid item>
				{customList("Available", available, "Everyone is on this assignment.")}
			</Grid>
			<Grid item>
				<Grid container direction="column" alignItems="center">
					<Button
						sx={{ my: 0.5 }}
						variant="outlined"
						size="small"
						onClick={handleCheckedRight}
						disabled={leftChecked.length === 0}
						aria-label="Add selected students"
					>
						&gt;
					</Button>
					<Button
						sx={{ my: 0.5 }}
						variant="outlined"
						size="small"
						onClick={handleCheckedLeft}
						disabled={rightChecked.length === 0}
						aria-label="Remove selected students"
					>
						&lt;
					</Button>
				</Grid>
			</Grid>
			<Grid item>
				{customList("Enrolled", enrolled, "No students on this assignment yet.")}
			</Grid>
		</Grid>
	);
}

const style = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: { xs: "92%", sm: 600 },
	maxHeight: "90vh",
	overflowY: "auto",
};

export const AddStudentsModal = (props) => {
	const { assignment, openStudentsModal, setOpenStudentsModal, getAssignments } =
		props;
	const { show } = useSnackbar();

	// Both overlays come through useDemoOverlay, so the first render — on the
	// server and again on the client — sees the empty overlay and the seed. The
	// saved roster and any students added on /students arrive in an effect
	// immediately afterwards, which is why this modal cannot mismatch hydration.
	const studentsOverlay = useDemoOverlay(STUDENTS_KEY);
	const assignmentsOverlay = useDemoOverlay(ASSIGNMENTS_KEY);

	const students = useMemo(
		() => studentDirectory(studentsOverlay),
		[studentsOverlay]
	);
	const savedIds = useMemo(
		() => rosterIdsFor(assignment, assignmentsOverlay),
		[assignment, assignmentsOverlay]
	);

	// null means "whatever is saved". Keeping the unedited state out of React
	// is what lets the roster arrive late — the overlay hydrates one effect
	// after the first render — without either overwriting an edit in progress
	// or leaving the picker showing the seed forever.
	const [draft, setDraft] = useState(null);
	const selectedIds = draft ?? savedIds;

	// Every open starts from what is saved, which is also what makes Cancel
	// discard: nothing was written, so the next open re-reads the store.
	const assignmentId = assignment?.id;
	useEffect(() => {
		if (!openStudentsModal) return;
		setDraft(null);
	}, [openStudentsModal, assignmentId]);

	const handleClose = () => setOpenStudentsModal(false);

	const handleSave = async () => {
		if (assignment == null) {
			handleClose();
			return;
		}
		const saved = saveRoster(assignment.id, selectedIds);
		// The card list is rebuilt from the store, so the chip and this modal
		// cannot drift apart.
		await getAssignments?.();
		handleClose();
		const count = `${saved.length} student${saved.length === 1 ? "" : "s"}`;
		show(
			isPersistent()
				? `Class roster updated — ${count}.`
				: `Class roster updated — ${count} (this session only; the browser is not saving demo data).`,
			isPersistent() ? "success" : "info"
		);
	};

	return (
		<Modal
			open={openStudentsModal}
			onClose={handleClose}
			aria-labelledby="add-students-title"
		>
			<Box>
				<Card sx={style}>
					<CardHeader
						id="add-students-title"
						title="Add/Remove Students"
						subheader={
							assignment?.title
								? `Choose who is assigned “${assignment.title}”.`
								: "Please add/remove students as needed from the list below."
						}
						className="mb-0 pb-0"
					/>
					<CardContent>
						<StudentTransferList
							students={students}
							selectedIds={selectedIds}
							onChange={setDraft}
						/>
					</CardContent>
					<CardActions className="justify-end pr-6 pb-4">
						<Button size="small" color="inherit" onClick={handleClose}>
							Cancel
						</Button>
						<Button size="small" variant="contained" onClick={handleSave}>
							Save
						</Button>
					</CardActions>
				</Card>
			</Box>
		</Modal>
	);
};

export default AddStudentsModal;
