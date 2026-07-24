import * as React from "react";
import {
	Box,
	Button,
	Modal,
	Card,
	CardHeader,
	CardContent,
	CardActions,
	TextField,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import axios from "axios";
import { useSnackbar } from "src/contexts/snackbar-context";
import { ASSIGNMENTS_KEY, patchRecord } from "src/demo/local-store";

const style = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: { xs: "92%", sm: 600 },
	maxHeight: "90vh",
	overflowY: "auto",
};

export const EditAssignmentModal = (props) => {
	const { assignment, open, setOpen, getAssignments } = props;
	const { show } = useSnackbar();
	const [title, setTitle] = React.useState("");
	const [question, setQuestion] = React.useState("");
	const [text, setText] = React.useState("");
	const [deadline, setDeadline] = React.useState(dayjs());
	const [submitting, setSubmitting] = React.useState(false);

	// Prefill from the already-loaded list whenever the modal opens.
	React.useEffect(() => {
		if (!open || !assignment) return;
		setTitle(assignment.title || "");
		setQuestion(assignment.description || "");
		setText(assignment.text || "");
		setDeadline(assignment.deadline ? dayjs(assignment.deadline) : dayjs());
	}, [open, assignment]);

	const handleClose = () => setOpen(false);

	const handleSave = async () => {
		if (!title.trim() || !question.trim()) {
			show("Please keep a title and a prompt question.", "error");
			return;
		}
		setSubmitting(true);
		const isoDeadline = deadline?.toISOString();
		try {
			try {
				await axios.put("/api/assignments", {
					id: assignment.id,
					title,
					question,
					text,
					deadline: isoDeadline,
				});
			} catch (err) {
				// The server copy is best-effort; the browser patch below is what
				// makes the edit outlive this lambda.
				console.error(err);
			}

			// Stored as a patch, so fields this form does not touch keep coming
			// from the fixture.
			patchRecord(ASSIGNMENTS_KEY, assignment.id, {
				question,
				description: question,
				deadline: isoDeadline ?? null,
				textTitle: title,
				eval_text: { title, text },
			});

			await getAssignments();
			handleClose();
			show("Assignment updated.", "success");
		} catch (err) {
			console.error(err);
			show("Could not update the assignment. Please try again.", "error");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Modal
			open={open}
			onClose={handleClose}
			aria-labelledby="edit-assignment-title"
		>
			<Box>
				<Card sx={style}>
					<CardHeader
						id="edit-assignment-title"
						title="Edit Assignment"
						subheader="Changes apply to this demo session."
					/>
					<CardContent>
						<TextField
							label="Title"
							fullWidth
							sx={{ mb: 2 }}
							value={title}
							onChange={(e) => setTitle(e.target.value)}
						/>
						<TextField
							label="Prompt Question"
							fullWidth
							sx={{ mb: 2 }}
							value={question}
							onChange={(e) => setQuestion(e.target.value)}
						/>
						<TextField
							label="Passage Text"
							fullWidth
							sx={{ mb: 2 }}
							multiline
							rows={4}
							value={text}
							onChange={(e) => setText(e.target.value)}
						/>
						<DateTimePicker
							label="Deadline"
							renderInput={(inputProps) => (
								<TextField {...inputProps} fullWidth variant="outlined" />
							)}
							value={deadline}
							onChange={(v) => setDeadline(v)}
						/>
					</CardContent>
					<CardActions sx={{ justifyContent: "flex-end", px: 3, pb: 2 }}>
						<Button size="small" color="inherit" onClick={handleClose}>
							Cancel
						</Button>
						<Button
							size="small"
							variant="contained"
							onClick={handleSave}
							disabled={submitting}
						>
							{submitting ? "Saving…" : "Save changes"}
						</Button>
					</CardActions>
				</Card>
			</Box>
		</Modal>
	);
};
