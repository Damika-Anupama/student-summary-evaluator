import * as React from "react";
import NextLink from "next/link";
import {
	Box,
	Button,
	Chip,
	Typography,
	Modal,
	Card,
	CardHeader,
	CardContent,
	CardActions,
	CircularProgress,
	Divider,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Stack,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CheckCircleOutlineIcon from "@heroicons/react/24/outline/CheckCircleIcon";
import LinkIcon from "@heroicons/react/24/outline/LinkIcon";
import ClipboardDocumentIcon from "@heroicons/react/24/outline/ClipboardDocumentIcon";
import axios from "axios";
import { clampPct, scoreColor, verdict } from "src/utils/score-buckets";

const style = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: { xs: "92%", sm: 600 },
	maxHeight: "90vh",
	overflowY: "auto",
};



const ScoreDial = ({ label, value, size = 104 }) => {
	const pct = clampPct(value);
	const color = scoreColor(pct);
	return (
		<Box sx={{ textAlign: "center" }}>
			<Box sx={{ position: "relative", display: "inline-flex" }}>
				<CircularProgress
					variant="determinate"
					value={100}
					size={size}
					thickness={4}
					sx={{ color: (t) => alpha(t.palette.text.primary, 0.08) }}
				/>
				<CircularProgress
					variant="determinate"
					value={pct}
					size={size}
					thickness={4}
					sx={{
						color,
						position: "absolute",
						left: 0,
						"& .MuiCircularProgress-circle": { strokeLinecap: "round" },
					}}
				/>
				<Box
					sx={{
						position: "absolute",
						inset: 0,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1 }}>
						{pct}
						<Typography component="span" variant="caption" color="text.secondary">
							%
						</Typography>
					</Typography>
				</Box>
			</Box>
			<Typography variant="subtitle2" sx={{ mt: 1 }}>
				{label}
			</Typography>
		</Box>
	);
};

export const ScoreAssignmentModal = (props) => {
	const [remarks, setRemarks] = React.useState([]);

	const handleClose = () => {
		props.setOpen(false);
	};

	// Load AI improvement suggestions when results are ready.
	React.useEffect(() => {
		let active = true;
		if (props.open && !props.loading) {
			axios
				.post("/api/remarks", {
					contentScore: props.contentScore,
					wordingScore: props.wordingScore,
				})
				.then((res) => {
					if (active) setRemarks(res.data?.result?.bullets || []);
				})
				.catch(() => {
					if (active) setRemarks([]);
				});
		}
		return () => {
			active = false;
		};
	}, [props.open, props.loading, props.contentScore, props.wordingScore]);

	return (
		<div>
			<Modal
				open={props.open}
				onClose={handleClose}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box>
					<Card sx={style}>
						<CardHeader title="Your Scores" />
						<CardContent>
							{props.loading ? (
								<Box
									sx={{
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										gap: 2,
										py: 5,
									}}
								>
									<CircularProgress />
									<Typography variant="body2" color="text.secondary">
										Evaluating your summary…
									</Typography>
								</Box>
							) : (
								<>
									{(() => {
										const content = clampPct(props.contentScore);
										const wording = clampPct(props.wordingScore);
										const overall = Math.round((content + wording) / 2);
										return (
											<Box sx={{ py: 2 }}>
												<Typography
													align="center"
													variant="subtitle1"
													sx={{ fontWeight: 600, mb: 0.5 }}
												>
													{verdict(overall)}
												</Typography>
												{props.wordCount > 0 && (
													<Typography
														align="center"
														variant="caption"
														color="text.secondary"
														sx={{ display: "block", mb: 2 }}
													>
														{props.wordCount} words evaluated
														{props.readability?.label &&
														props.readability.label !== "—"
															? ` · readability: ${props.readability.label}`
															: ""}
													</Typography>
												)}
												<Box
													sx={{
														display: "flex",
														justifyContent: "center",
														alignItems: "center",
														gap: { xs: 2, sm: 4 },
														flexWrap: "wrap",
													}}
												>
													<ScoreDial label="Content" value={content} />
													<ScoreDial
														label="Overall"
														value={overall}
														size={132}
													/>
													<ScoreDial label="Wording" value={wording} />
												</Box>
											</Box>
										);
									})()}
									<Divider />
									{(props.matchedTerms?.length > 0 ||
										props.missedTerms?.length > 0) && (
										<Box sx={{ mt: 2 }}>
											<Typography variant="subtitle1" gutterBottom>
												Key concepts from the source
											</Typography>
											{props.matchedTerms?.length > 0 && (
												<Box sx={{ mb: props.missedTerms?.length ? 1.5 : 0 }}>
													<Typography
														variant="caption"
														color="text.secondary"
														sx={{ display: "block", mb: 0.5 }}
													>
														Covered in your summary
													</Typography>
													<Stack
														direction="row"
														spacing={0.5}
														useFlexGap
														flexWrap="wrap"
													>
														{props.matchedTerms.map((term) => (
															<Chip
																key={term}
																label={term}
																size="small"
																color="success"
																variant="outlined"
															/>
														))}
													</Stack>
												</Box>
											)}
											{props.missedTerms?.length > 0 && (
												<Box>
													<Typography
														variant="caption"
														color="text.secondary"
														sx={{ display: "block", mb: 0.5 }}
													>
														Consider adding
													</Typography>
													<Stack
														direction="row"
														spacing={0.5}
														useFlexGap
														flexWrap="wrap"
													>
														{props.missedTerms.map((term) => (
															<Chip
																key={term}
																label={term}
																size="small"
																color="warning"
																variant="outlined"
															/>
														))}
													</Stack>
												</Box>
											)}
										</Box>
									)}
									{remarks.length > 0 && (
										<Box sx={{ mt: 2 }}>
											<Typography variant="subtitle1" gutterBottom>
												Suggestions to improve
											</Typography>
											<List dense>
												{remarks.map((bullet, i) => (
													<ListItem key={i} alignItems="flex-start" disableGutters>
														<ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
															<Box sx={{ width: 18, height: 18, color: "success.main" }}>
																<CheckCircleOutlineIcon />
															</Box>
														</ListItemIcon>
														<ListItemText primary={bullet} />
													</ListItem>
												))}
											</List>
										</Box>
									)}
								</>
							)}
						</CardContent>
						<CardActions
							sx={{ justifyContent: "flex-end", pr: 3, pb: 2, gap: 1 }}
						>
							<Button size="small" color="inherit" onClick={handleClose}>
								Close
							</Button>
							{!props.loading && props.onCopyResult && (
								<Button
									size="small"
									color="inherit"
									onClick={props.onCopyResult}
									startIcon={
										<Box sx={{ width: 18, height: 18 }}>
											<ClipboardDocumentIcon />
										</Box>
									}
								>
									Copy summary
								</Button>
							)}
							{!props.loading && props.onShare && (
								<Button
									size="small"
									color="inherit"
									onClick={props.onShare}
									startIcon={
										<Box sx={{ width: 18, height: 18 }}>
											<LinkIcon />
										</Box>
									}
								>
									Copy link
								</Button>
							)}
							{!props.loading && (
								<Button
									size="small"
									variant="contained"
									component={NextLink}
									href="/history-student"
								>
									See your progress
								</Button>
							)}
						</CardActions>
					</Card>
				</Box>
			</Modal>
		</div>
	);
};
