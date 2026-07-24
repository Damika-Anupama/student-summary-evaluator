import { useCallback, useState } from "react";
import {
	Button,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	Typography,
} from "@mui/material";
import { useSnackbar } from "src/contexts/snackbar-context";
import { resetDemoData } from "src/demo/local-store";

export const SettingsDemoData = () => {
	const { show } = useSnackbar();
	const [confirmOpen, setConfirmOpen] = useState(false);

	const handleConfirm = useCallback(() => {
		resetDemoData();
		setConfirmOpen(false);
		show("Demo data reset — the sample assignments and roster are back.", "success");
	}, [show]);

	return (
		<>
			<Card>
				<CardHeader
					title="Demo data"
					subheader="Assignments and students you create are saved in this browser"
				/>
				<Divider />
				<CardContent>
					<Typography color="text.secondary" variant="body2">
						Resetting removes everything you have created, edited or deleted in
						this demo and restores the original sample assignments and student
						roster. Nothing leaves this device, and no other settings are
						affected.
					</Typography>
				</CardContent>
				<Divider />
				<CardActions sx={{ justifyContent: "flex-end" }}>
					<Button
						color="error"
						variant="contained"
						onClick={() => setConfirmOpen(true)}
					>
						Reset demo data
					</Button>
				</CardActions>
			</Card>
			<Dialog
				open={confirmOpen}
				onClose={() => setConfirmOpen(false)}
				aria-labelledby="reset-demo-data-title"
			>
				<DialogTitle id="reset-demo-data-title">Reset demo data?</DialogTitle>
				<DialogContent>
					<DialogContentText>
						This clears the assignments and students saved in this browser and
						restores the original sample data. It cannot be undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button color="inherit" onClick={() => setConfirmOpen(false)}>
						Cancel
					</Button>
					<Button color="error" variant="contained" onClick={handleConfirm}>
						Reset
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};
