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
import {
	ASSIGNMENTS_KEY,
	applyOverlayPatch,
	findCreatedRecord,
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

// The API responds with { assignments: <assignment> }. Parse the deadline off
// that record and fall back to null (an empty picker) rather than dayjs(undefined),
// which silently resolves to "now" and looks like a real deadline.
const parseDeadline = (value) => {
	if (!value) return null;
	const parsed = dayjs(value);
	return parsed.isValid() ? parsed : null;
};

export const ViewAssignmentModal = (props) => {
	const { show } = useSnackbar();
	const { setOpenViewModal } = props;

	const handleClose = () => {
		props.setOpenViewModal(false);
		setTitle("");
		setQuestion("");
		setText("");
		setDeadline(null);
	};

	const [title, setTitle] = React.useState("");
	const [question, setQuestion] = React.useState("");
	const [text, setText] = React.useState("");
	const [deadline, setDeadline] = React.useState(null);

	const fill = React.useCallback((assignment) => {
		const evalText = assignment.eval_text || {};
		setTitle(evalText.title || assignment.textTitle || "");
		setQuestion(assignment.question || "");
		setText(evalText.text || "");
		setDeadline(parseDeadline(assignment.deadline));
	}, []);

	// Fetch only when the modal is actually opened — this used to fire on
	// every assignments-page load for the default id.
	React.useEffect(() => {
		if (!props.openViewModal) return;
		let cancelled = false;
		axios
			.get("/api/assignments/" + props.viewID)
			.then((res) => {
				if (cancelled) return;
				// Apply any locally stored edit, otherwise the modal would show the
				// original fixture text after the visitor edited it.
				fill(applyOverlayPatch(ASSIGNMENTS_KEY, res.data?.assignments || {}));
			})
			.catch((err) => {
				if (cancelled) return;
				// The lambda that held a created assignment may be long gone, so
				// resolve the id against the browser store before giving up.
				const stored = findCreatedRecord(ASSIGNMENTS_KEY, props.viewID);
				if (stored) {
					fill(stored);
					return;
				}
				// The detail route now 404s on an unknown id. Silently leaving the
				// form blank looked like an assignment with no content, so surface
				// the failure the way the rest of the app does and close the modal.
				console.error(err);
				const missing = err?.response?.status === 404;
				show(
					missing
						? "That assignment no longer exists."
						: "Could not load the assignment. Please try again.",
					"error"
				);
				setOpenViewModal(false);
			});
		return () => {
			cancelled = true;
		};
	}, [props.viewID, props.openViewModal, setOpenViewModal, show, fill]);
	return (
		<div>
			<Modal
				open={props.openViewModal}
				onClose={handleClose}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box>
					<Card sx={style}>
						<CardHeader
							title="View Assignment"
							// subheader="Please enter the details of the assignment."
							className="mb-0 pb-0"
						/>
						<CardContent>
							<TextField
								label="Title"
								variant="filled"
								fullWidth
								sx={{ mb: 2 }}
								value={title}
								inputProps={{ readOnly: true }}
							/>
							<TextField
								label="Prompt Question"
								variant="filled"
								fullWidth
								sx={{ mb: 2 }}
								value={question}
								inputProps={{ readOnly: true }}
							/>
							<TextField
								label="Prompt"
								variant="filled"
								fullWidth
								sx={{ mb: 2 }}
								value={text}
								inputProps={{ readOnly: true }}
								multiline
								rows={4}
							/>

							<DateTimePicker
								label="Deadline"
								readOnly
								renderInput={(inputProps) => (
									<TextField {...inputProps} variant="outlined" />
								)}
								value={deadline}
								onChange={() => {}}
							/>
						</CardContent>
						<CardActions className="justify-end pr-6 pb-4">
							<Button size="small" onClick={handleClose}>
								Close
							</Button>
						</CardActions>
					</Card>
				</Box>
			</Modal>
		</div>
	);
};
