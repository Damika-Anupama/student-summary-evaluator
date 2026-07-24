import * as React from "react";
import {
	Box,
	Button,
	SvgIcon,
	Typography,
	Modal,
	Card,
	CardHeader,
	CardContent,
	CardActions,
	TextField,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import axios from "axios";
import { useSnackbar } from "src/contexts/snackbar-context";
import { DEMO_ASSIGNMENTS } from "src/demo/demo-data";
import {
	ASSIGNMENTS_KEY,
	createRecord,
	nextRecordId,
	readEffective,
} from "src/demo/local-store";

const style = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: { xs: "92%", sm: 600 },
	maxHeight: "90vh",
	overflowY: "auto",
};

export const CreateAssignmentBtn = (props) => {
	const { show } = useSnackbar();
	const [open, setOpen] = React.useState(false);
	const [submitting, setSubmitting] = React.useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => {
		setOpen(false);
		setTitle("");
		setQuestion("");
		setText("");
		setDeadline(dayjs());
	};

	const [title, setTitle] = React.useState("");
	const [question, setQuestion] = React.useState("");
	const [text, setText] = React.useState("");
	const [deadline, setDeadline] = React.useState(dayjs());

	const handleSubmit = async () => {
		if (!title.trim() || !question.trim()) {
			show("Please add a title and a prompt question.", "error");
			return;
		}
		setSubmitting(true);
		const payload = {
			title,
			question,
			text,
			deadline: deadline?.toISOString(),
			user_id: "1",
		};
		try {
			// Still goes through the API so the route keeps its contract, but the
			// record the visitor actually sees is the one written to the browser
			// store — the server copy dies with the lambda.
			let created = null;
			try {
				const res = await axios.post("/api/assignments", payload);
				if (res.status === 200 || res.status === 201) {
					created = res.data?.assignment ?? null;
				}
			} catch (err) {
				// A cold/unavailable demo API is not a reason to lose the input.
				console.error(err);
			}

			// The server allocates ids from per-lambda memory, which restarts at
			// the fixture maximum on every cold start and would hand back an id
			// already in use here. Allocate from the effective list instead.
			const id = nextRecordId(readEffective(ASSIGNMENTS_KEY, DEMO_ASSIGNMENTS));
			const now = new Date().toISOString();
			createRecord(ASSIGNMENTS_KEY, {
				createdBy_id: 1,
				created_at: now,
				...(created ?? {}),
				id,
				question,
				description: question,
				deadline: payload.deadline ?? created?.deadline ?? null,
				textTitle: title,
				eval_text: { id, title, text },
			});

			await props.getAssignments();
			handleClose();
			show("Assignment created.", "success");
		} catch (err) {
			console.error(err);
			show("Could not create the assignment. Please try again.", "error");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div>
			<Button
				onClick={handleOpen}
				startIcon={
					<SvgIcon fontSize="small">
						<PlusIcon />
					</SvgIcon>
				}
				variant="contained"
			>
				Create New
			</Button>
			<Modal
				open={open}
				onClose={handleClose}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box>
					<Card sx={style}>
						<CardHeader
							title="Create New Assignment"
							subheader="Please enter the details of the assignment."
							className="mb-0 pb-0"
						/>
						<CardContent>
							<TextField
								label="Title"
								variant="filled"
								className="mb-3 w-full"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
							/>
							<TextField
								label="Prompt Question"
								variant="filled"
								className="mb-3 w-full"
								value={question}
								onChange={(e) => setQuestion(e.target.value)}
							/>
							<TextField
								label="Passage Text"
								variant="filled"
								className="mb-3 w-full"
								value={text}
								onChange={(e) => setText(e.target.value)}
								multiline
								rows={5}
								placeholder="Paste the passage students will summarize…"
							/>
							<DateTimePicker
								className="mt-4"
								label="Deadline"
								renderInput={(inputProps) => (
									<TextField {...inputProps} variant="outlined" />
								)}
								value={deadline}
								onChange={(newValue) => setDeadline(newValue)}
							/>
						</CardContent>
						<CardActions className="justify-end pr-6 pb-4">
							<Button size="small" color="inherit" onClick={handleClose}>
								Cancel
							</Button>
							<Button
								size="small"
								variant="contained"
								onClick={handleSubmit}
								disabled={submitting}
							>
								{submitting ? "Creating…" : "Create Assignment"}
							</Button>
						</CardActions>
					</Card>
				</Box>
			</Modal>
		</div>
	);
};
