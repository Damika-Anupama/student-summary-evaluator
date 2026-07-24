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
} from "@mui/material";

import axios from "axios";
import { useSnackbar } from "src/contexts/snackbar-context";
import { ASSIGNMENTS_KEY, removeRecord } from "src/demo/local-store";

const style = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: { xs: "92%", sm: 480 },
};

export const DeleteAssignmentModal = (props) => {
	const { show } = useSnackbar();
	const [submitting, setSubmitting] = React.useState(false);

	const handleClose = () => {
		props.setOpenDeleteModal(false);
	};

	const handleSubmit = async () => {
		setSubmitting(true);
		try {
			try {
				await axios.delete("/api/assignments", {
					data: { id: props.deleteID },
				});
			} catch (err) {
				// The server delete only affects one lambda's memory; the tombstone
				// below is what actually keeps the assignment gone.
				console.error(err);
			}

			removeRecord(ASSIGNMENTS_KEY, props.deleteID);

			await props.getAssignments();
			handleClose();
			show("Assignment deleted.", "success");
		} catch (err) {
			console.error(err);
			show("Could not delete the assignment. Please try again.", "error");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div>
			<Modal
				open={props.openDeleteModal}
				onClose={handleClose}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box>
					<Card sx={style}>
						<CardHeader
							title="Delete Assignment"
							// subheader="Please enter the details of the assignment."
							className="mb-0 pb-0"
						/>
						<CardContent className="mb-0 pb-0">
							<Typography variant="body1" className="mb-4">
								Are you sure you want to delete this assignment?
							</Typography>
						</CardContent>
						<CardActions className="justify-end pr-6 pb-4">
							<Button size="small" color="inherit" onClick={handleClose}>
								Cancel
							</Button>
							<Button
								size="small"
								color="error"
								variant="contained"
								onClick={handleSubmit}
								disabled={submitting}
							>
								{submitting ? "Deleting…" : "Confirm"}
							</Button>
						</CardActions>
					</Card>
				</Box>
			</Modal>
		</div>
	);
};
