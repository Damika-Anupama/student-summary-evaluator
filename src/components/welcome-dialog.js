import PropTypes from "prop-types";
import ArrowsRightLeftIcon from "@heroicons/react/24/solid/ArrowsRightLeftIcon";
import MagnifyingGlassIcon from "@heroicons/react/24/solid/MagnifyingGlassIcon";
import SparklesIcon from "@heroicons/react/24/solid/SparklesIcon";
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Stack,
	SvgIcon,
	Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

const FEATURES = [
	{
		Icon: ArrowsRightLeftIcon,
		title: "Two personas",
		body: "Explore teacher analytics or practice as a student — switch anytime from the avatar menu.",
	},
	{
		Icon: MagnifyingGlassIcon,
		title: "Jump anywhere",
		body: "Press ⌘K (or Ctrl+K) to search students, assignments, and quick actions.",
	},
	{
		Icon: SparklesIcon,
		title: "Instant scoring",
		body: "Submit a summary as a student to see live content and wording feedback.",
	},
];

export const WelcomeDialog = ({ open, onClose, onChooseRole }) => (
	<Dialog
		open={open}
		onClose={onClose}
		maxWidth="xs"
		fullWidth
		aria-labelledby="welcome-dialog-title"
	>
		<DialogTitle id="welcome-dialog-title" sx={{ pb: 1 }}>
			Welcome to the demo
		</DialogTitle>
		<DialogContent>
			<Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
				An NLP-powered platform that scores student summaries on content and
				wording. Everything runs on sample data — click around freely.
			</Typography>
			<Stack spacing={2}>
				{FEATURES.map(({ Icon, title, body }) => (
					<Stack key={title} direction="row" spacing={1.5}>
						<Box
							sx={{
								width: 36,
								height: 36,
								borderRadius: 1.5,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								flexShrink: 0,
								backgroundColor: (t) => alpha(t.palette.primary.main, 0.12),
								color: "primary.main",
							}}
						>
							<SvgIcon fontSize="small">
								<Icon />
							</SvgIcon>
						</Box>
						<Box>
							<Typography variant="subtitle2">{title}</Typography>
							<Typography variant="body2" color="text.secondary">
								{body}
							</Typography>
						</Box>
					</Stack>
				))}
			</Stack>
		</DialogContent>
		<DialogActions
			sx={{
				px: 3,
				pb: 2.5,
				gap: 1,
				// Stack on phones (primary on top) — side by side the labels
				// wrap to two cramped lines.
				flexDirection: { xs: "column-reverse", sm: "row" },
				"& > :not(:first-of-type)": { ml: { xs: 0, sm: 1 } },
			}}
		>
			<Button
				fullWidth
				variant="outlined"
				onClick={() => onChooseRole("student")}
			>
				Explore as Student
			</Button>
			<Button
				fullWidth
				variant="contained"
				onClick={() => onChooseRole("teacher")}
			>
				Explore as Teacher
			</Button>
		</DialogActions>
	</Dialog>
);

WelcomeDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onChooseRole: PropTypes.func.isRequired,
};
