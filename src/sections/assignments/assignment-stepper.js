import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import { alpha } from "@mui/material/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { ScoreAssignmentModal } from "src/sections/student/score-modal";
import { useSnackbar } from "src/contexts/snackbar-context";
import { countWords } from "src/utils/count-words";
import { getSampleSummary, getReadability } from "src/demo/demo-data";
import { formatResultText } from "src/utils/format-result";

const steps = [
	"Select an Assignment",
	"Provide Your Answer",
	"Review Your Answer",
];

// Browsers, mail clients and chat apps start truncating links past roughly
// this length, and a truncated permalink replays the wrong summary — so we
// never emit one.
export const SHARE_URL_MAX_LENGTH = 2000;

// Build a permalink that replays a scored summary on the student dashboard.
// The evaluator is deterministic, so opening the link reproduces the exact
// same scores and concept breakdown. A long summary would push the URL past
// what links reliably survive; in that case we drop the summary payload and
// fall back to the assignment-only deep link.
// Returns { url, includesSummary }; `origin` is injectable for tests.
export const buildShareUrl = (promptId, summary, origin) => {
	const base =
		origin ?? (typeof window === "undefined" ? "" : window.location.origin);
	if (!base) return { url: "", includesSummary: false };
	const params = new URLSearchParams({
		prompt_id: String(promptId),
		summary: String(summary ?? ""),
	});
	const url = `${base}/dashboard-student?${params.toString()}`;
	if (url.length <= SHARE_URL_MAX_LENGTH) {
		return { url, includesSummary: true };
	}
	const fallback = new URLSearchParams({ assignment: String(promptId) });
	return {
		url: `${base}/dashboard-student?${fallback.toString()}`,
		includesSummary: false,
	};
};

export const AssignmentStepper = () => {
	const [open, setOpen] = React.useState(false);
	const [contentScore, setContentScore] = React.useState(0);
	const [wordingScore, setWordingScore] = React.useState(0);
	const [wordCount, setWordCount] = React.useState(0);
	const [matchedTerms, setMatchedTerms] = React.useState([]);
	const [missedTerms, setMissedTerms] = React.useState([]);
	const [readability, setReadability] = React.useState(null);
	const [share, setShare] = React.useState({
		url: "",
		includesSummary: false,
	});
	const [loading, setLoading] = React.useState(false);

	const handleOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};
	const [answer, setAnswer] = useState("");
	const [assignments, setAssignments] = useState([]);
	const [assignmentDetails, setAssignmentDetails] = useState({ text: "" });
	const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
	const [activeStep, setActiveStep] = React.useState(0);
	const [skipped, setSkipped] = React.useState(new Set());

	const router = useRouter();
	const { show } = useSnackbar();
	const appliedQuery = React.useRef(null);
	const preserveAnswerFor = React.useRef(null);

	// Replay a shared result: pre-fill the answer, jump to the review step, and
	// re-score so the visitor sees the same result the sharer did. Deterministic
	// scoring guarantees a match.
	const replaySharedResult = React.useCallback(
		(match, summaryText) => {
			// Keep this answer through the selection-change reset effect below.
			preserveAnswerFor.current = match.id;
			setSelectedAssignmentId(match.id);
			setAnswer(summaryText);
			setActiveStep(2);
			setLoading(true);
			setOpen(true);
			axios
				.post("/api/summaryview", {
					prompt_id: match.id,
					summary: summaryText,
				})
				.then((res) => {
					setContentScore(res.data.content_score);
					setWordingScore(res.data.wording_score);
					setWordCount(res.data.word_count ?? 0);
					setMatchedTerms(res.data.matched_terms ?? []);
					setMissedTerms(res.data.missed_terms ?? []);
					setShare(buildShareUrl(match.id, summaryText));
					setReadability(getReadability(summaryText));
					setLoading(false);
				})
				.catch(() => {
					setLoading(false);
					setOpen(false);
					show("Couldn't load the shared result.", "error");
				});
		},
		[show]
	);

	// One effect owns every URL entry point, so the deep link and the share
	// permalink can't race each other over activeStep / modal state.
	//   /dashboard-student?assignment=ID            → jump to the answer step
	//   /dashboard-student?prompt_id=ID&summary=... → replay a scored summary
	// A share permalink is the more specific intent, so it wins when a URL
	// carries both. Waits for the router to hydrate its query, then applies at
	// most once per distinct query.
	useEffect(() => {
		if (router.isReady === false || !assignments.length) return;
		const query = router.query || {};
		const queryKey = JSON.stringify([
			query.prompt_id ?? null,
			query.summary ?? null,
			query.assignment ?? null,
		]);
		if (appliedQuery.current === queryKey) return;

		const promptId = query.prompt_id;
		// A present-but-blank summary= carries nothing to replay, so treat it as
		// no share intent at all rather than scoring an empty submission.
		const sharedSummary = query.summary == null ? "" : String(query.summary);
		if (promptId && sharedSummary.trim()) {
			appliedQuery.current = queryKey;
			const match = assignments.find((a) => String(a.id) === String(promptId));
			if (!match) {
				show("That shared link points to an assignment we couldn't find.", "error");
				return;
			}
			replaySharedResult(match, sharedSummary);
			return;
		}

		const deepLinkId = query.assignment;
		if (!deepLinkId) return;
		const match = assignments.find((a) => String(a.id) === String(deepLinkId));
		if (!match) return;
		appliedQuery.current = queryKey;
		setSelectedAssignmentId(match.id);
		setActiveStep(1);
	}, [assignments, router.isReady, router.query, replaySharedResult, show]);

	const isStepSkipped = (step) => {
		return skipped.has(step);
	};
	const handleAssignmentClick = (assignmentId) => {
		setSelectedAssignmentId(assignmentId);
	};

	const handleNext = () => {
		let newSkipped = skipped;
		if (isStepSkipped(activeStep)) {
			newSkipped = new Set(newSkipped.values());
			newSkipped.delete(activeStep);
		}

		setActiveStep((prevActiveStep) => prevActiveStep + 1);
		setSkipped(newSkipped);
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	const handleReset = () => {
		setActiveStep(0);
	};

	const handleShare = React.useCallback(() => {
		if (!share.url || typeof navigator === "undefined" || !navigator.clipboard) {
			show("Sharing isn't available in this browser.", "error");
			return;
		}
		navigator.clipboard.writeText(share.url).then(
			() =>
				show(
					share.includesSummary
						? "Share link copied to clipboard."
						: "That summary is too long for a link — copied a link to the assignment instead.",
					share.includesSummary ? "success" : "info"
				),
			() => show("Couldn't copy the link.", "error")
		);
	}, [share, show]);

	const handleCopyResult = React.useCallback(() => {
		if (typeof navigator === "undefined" || !navigator.clipboard) {
			show("Copying isn't available in this browser.", "error");
			return;
		}
		const text = formatResultText({
			contentScore,
			wordingScore,
			wordCount,
			matchedTerms,
			missedTerms,
			readability,
		});
		navigator.clipboard.writeText(text).then(
			() => show("Result copied to clipboard.", "success"),
			() => show("Couldn't copy the result.", "error")
		);
	}, [
		contentScore,
		wordingScore,
		wordCount,
		matchedTerms,
		missedTerms,
		readability,
		show,
	]);

	const getAssignments = async () => {
		try {
			const res = await axios.get("/api/assignments");
			if (res.status === 200) {
				const mapped_assignments = res.data.assignments.map((assignment) => ({
					id: assignment.id,
					description: assignment.question,
					title: assignment.eval_text.title,
				}));
				setAssignments(mapped_assignments);
			}
		} catch (err) {
			/* demo: assignments fetch failed — leave list empty */
		}
	};

	useEffect(() => {
		getAssignments();
	}, []);

	// Reset the answer when selectedAssignmentId changes — unless it was just
	// populated from a shared permalink (preserveAnswerFor), which we honour once.
	useEffect(() => {
		if (preserveAnswerFor.current === selectedAssignmentId) {
			preserveAnswerFor.current = null;
			return;
		}
		setAnswer("");
	}, [selectedAssignmentId]);
	// The detail route used to answer an unknown id with the first fixture, so
	// a bad id quietly showed the wrong passage. It now 404s, which would
	// instead leave the reading passage blank with no explanation — so say so.
	const getAssignmentDetails = async (id) => {
		const res = await axios.get("/api/assignments/" + id);
		return res.data;
	};
	const handleAnswerChange = (event) => {
		setAnswer(event.target.value);
	};

	useEffect(() => {
		if (selectedAssignmentId) {
			getAssignmentDetails(selectedAssignmentId)
				.then((data) => {
					setAssignmentDetails(data.assignments ?? null);
				})
				.catch((error) => {
					console.error("Error getting assignment details:", error);
					setAssignmentDetails(null);
					show(
						error.response?.status === 404
							? "That assignment no longer exists."
							: "Couldn't load the assignment. Please try again.",
						"error"
					);
				});
		}
	}, [selectedAssignmentId, show]);

	return (
		<Box sx={{ width: "100%" }}>
			<Stepper activeStep={activeStep}>
				{steps.map((label, index) => {
					const stepProps = {};
					const labelProps = {};
					if (isStepSkipped(index)) {
						stepProps.completed = false;
					}
					return (
						<Step key={label} {...stepProps}>
							<StepLabel {...labelProps}>{label}</StepLabel>
						</Step>
					);
				})}
			</Stepper>
			<div>
				{activeStep === steps.length ? (
					<React.Fragment>
						<Typography sx={{ mt: 5, mb: 1 }}>
							All steps completed - you&apos;re finished
						</Typography>
						<Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
							<Box sx={{ flex: "1 1 auto" }} />
							<Button onClick={handleReset}>Reset</Button>
						</Box>
					</React.Fragment>
				) : (
					<React.Fragment>
						{activeStep === 0 ? (
							<Stack
								spacing={1.5}
								sx={{ mt: 3, mb: 1, maxWidth: 640, mx: "auto" }}
							>
								<Typography variant="subtitle2" color="text.secondary">
									Choose an assignment to summarize
								</Typography>
								{assignments.map((assignment) => {
									const selected = assignment.id === selectedAssignmentId;
									return (
										<Paper
											key={assignment.id}
											variant="outlined"
											role="button"
											tabIndex={0}
											aria-pressed={selected}
											aria-label={`Select ${assignment.title}`}
											onClick={() => handleAssignmentClick(assignment.id)}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													// Space would otherwise scroll the page.
													e.preventDefault();
													handleAssignmentClick(assignment.id);
												}
											}}
											sx={{
												p: 2,
												cursor: "pointer",
												borderWidth: 2,
												borderColor: selected ? "primary.main" : "divider",
												backgroundColor: selected
													? (t) => alpha(t.palette.primary.main, 0.08)
													: "background.paper",
												transition: "all 0.2s ease",
												"&:hover": {
													borderColor: "primary.main",
													transform: "translateY(-2px)",
													boxShadow: 2,
												},
												"&:focus-visible": {
													outline: (t) => `2px solid ${t.palette.primary.main}`,
													outlineOffset: 2,
												},
											}}
										>
											<Stack
												direction="row"
												alignItems="center"
												justifyContent="space-between"
												spacing={2}
											>
												<Typography
													variant="subtitle1"
													sx={{ fontWeight: selected ? 700 : 500 }}
												>
													{assignment.title}
												</Typography>
												{selected && (
													<CheckCircleIcon color="primary" fontSize="small" />
												)}
											</Stack>
										</Paper>
									);
								})}
							</Stack>
						) : activeStep === 1 ? (
							<form>
								<Stack spacing={2} sx={{ mt: 3, maxWidth: 720, mx: "auto" }}>
									<Typography variant="h6" gutterBottom>
										Title
									</Typography>
									<Typography variant="body1" gutterBottom>
										{assignments.find(
											(assignment) => assignment.id === selectedAssignmentId
										)?.title || ""}
									</Typography>
									<Typography variant="h6" gutterBottom>
										Question
									</Typography>
									<Typography variant="body1" gutterBottom>
										{assignments.find(
											(assignment) => assignment.id === selectedAssignmentId
										)?.description || ""}
									</Typography>
									<Typography variant="h6" gutterBottom>
										Text
									</Typography>
									<Typography variant="body1" gutterBottom>
										{assignmentDetails.eval_text?.text || ""}
									</Typography>
									<Stack
										direction="row"
										spacing={1}
										alignItems="center"
										flexWrap="wrap"
										useFlexGap
									>
										<Typography variant="caption" color="text.secondary">
											Short on time?
										</Typography>
										<Button
											size="small"
											variant="text"
											onClick={() =>
												setAnswer(
													getSampleSummary(selectedAssignmentId, "strong")
												)
											}
										>
											Try a strong sample
										</Button>
										<Button
											size="small"
											variant="text"
											color="inherit"
											onClick={() =>
												setAnswer(
													getSampleSummary(selectedAssignmentId, "weak")
												)
											}
										>
											Try a weak sample
										</Button>
									</Stack>
									<TextField
										label="Your Answer"
										fullWidth
										multiline
										rows={6}
										value={answer}
										onChange={handleAnswerChange}
										helperText={
											countWords(answer) === 0
												? "Write your summary in your own words."
												: `${countWords(answer)} word${
														countWords(answer) === 1 ? "" : "s"
												  } — scoring looks at both content and wording.`
										}
									/>
								</Stack>
							</form>
						) : (
							<form>
								<Stack spacing={2} sx={{ mt: 3, maxWidth: 720, mx: "auto" }}>
									<Typography variant="h6" gutterBottom>
										Title
									</Typography>
									<Typography variant="body1" gutterBottom>
										{assignments.find(
											(assignment) => assignment.id === selectedAssignmentId
										)?.title || ""}
									</Typography>
									<Typography variant="h6" gutterBottom>
										Question
									</Typography>
									<Typography variant="body1" gutterBottom>
										{assignments.find(
											(assignment) => assignment.id === selectedAssignmentId
										)?.description || ""}
									</Typography>
									<Typography variant="h6" gutterBottom>
										Text
									</Typography>
									<Typography variant="body1" gutterBottom>
										{assignmentDetails.eval_text?.text || ""}
									</Typography>
									<Typography variant="h6" gutterBottom>
										Your Answer
									</Typography>
									<Typography variant="body1" gutterBottom>
										{answer}
									</Typography>
								</Stack>
							</form>
						)}
						<Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
							<Button
								color="inherit"
								disabled={activeStep === 0}
								onClick={handleBack}
								sx={{ mr: 1 }}
							>
								Back
							</Button>
							<Box sx={{ flex: "1 1 auto" }} />
							<Button
								variant="outlined"
								onClick={async () => {
									if (activeStep === steps.length - 1) {
										setLoading(true);
										handleOpen();
										try {
											const res = await axios.post("/api/summaryview", {
												text: 1,
												prompt_id: selectedAssignmentId,
												summary: answer,
											});
											setContentScore(res.data.content_score);
											setWordingScore(res.data.wording_score);
											setWordCount(res.data.word_count ?? 0);
											setMatchedTerms(res.data.matched_terms ?? []);
											setMissedTerms(res.data.missed_terms ?? []);
											setShare(buildShareUrl(selectedAssignmentId, answer));
											setReadability(getReadability(answer));
											setLoading(false);
										} catch (error) {
											setLoading(false);
											handleClose();
											show(
												"Scoring failed — please try submitting again.",
												"error"
											);
										}
									} else {
										handleNext(); // For the "Next" button
									}
								}}
								disabled={
									!selectedAssignmentId ||
									(activeStep === 1 && answer.trim() === "")
								}
							>
								{activeStep === steps.length - 1 ? "Submit" : "Next"}
							</Button>
						</Box>
					</React.Fragment>
				)}
			</div>
			<ScoreAssignmentModal
				open={open}
				setOpen={setOpen}
				loading={loading}
				contentScore={contentScore}
				wordingScore={wordingScore}
				wordCount={wordCount}
				matchedTerms={matchedTerms}
				missedTerms={missedTerms}
				readability={readability}
				onShare={share.url ? handleShare : undefined}
				onCopyResult={handleCopyResult}
			/>
		</Box>
	);
};
