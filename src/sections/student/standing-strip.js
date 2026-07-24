import { useEffect, useState } from "react";
import NextLink from "next/link";
import axios from "axios";
import ArrowRightIcon from "@heroicons/react/24/solid/ArrowRightIcon";
import {
	Box,
	Button,
	Card,
	Skeleton,
	Stack,
	SvgIcon,
	Typography,
} from "@mui/material";
import { scoreColor } from "src/utils/score-buckets";

const Stat = ({ label, value, suffix, color }) => (
	<Box sx={{ minWidth: 96 }}>
		<Typography variant="overline" color="text.secondary">
			{label}
		</Typography>
		<Typography component="p" variant="h6" sx={{ fontWeight: 700, color }}>
			{value}
			{suffix && (
				<Typography component="span" variant="caption" color="text.secondary">
					{" "}
					{suffix}
				</Typography>
			)}
		</Typography>
	</Box>
);

// Compact "how am I doing" strip for the student home. Self-contained
// (fetches the demo profile) because this page is also embedded by the
// role switcher on "/".
export const StandingStrip = () => {
	const [profile, setProfile] = useState(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		let cancelled = false;
		axios
			.get("/api/students/1/profile")
			.then((res) => {
				if (!cancelled) setProfile(res.data.profile);
			})
			.catch(() => {
				if (!cancelled) setFailed(true);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	// Fail quietly — the strip is an extra, not a blocker.
	if (failed) return null;

	return (
		<Card sx={{ px: 3, py: 2 }}>
			<Stack
				direction="row"
				spacing={4}
				alignItems="center"
				flexWrap="wrap"
				useFlexGap
			>
				{profile ? (
					<>
						<Stat
							label="Your average"
							value={profile.overallAvg ?? "—"}
							suffix={profile.overallAvg != null ? "/100" : ""}
							color={
								profile.overallAvg != null
									? scoreColor(profile.overallAvg)
									: undefined
							}
						/>
						<Stat
							label="Submitted"
							value={profile.submittedCount}
							suffix={`of ${profile.submittedCount + profile.missingCount}`}
						/>
						<Stat
							label="To do"
							value={profile.missingCount}
							color={
								profile.missingCount > 0 ? "warning.main" : "success.main"
							}
						/>
					</>
				) : (
					<>
						<Skeleton variant="rounded" width={96} height={44} />
						<Skeleton variant="rounded" width={96} height={44} />
						<Skeleton variant="rounded" width={96} height={44} />
					</>
				)}
				<Box sx={{ flexGrow: 1 }} />
				<Button
					component={NextLink}
					href="/history-student"
					size="small"
					endIcon={
						<SvgIcon fontSize="small">
							<ArrowRightIcon />
						</SvgIcon>
					}
				>
					See your progress
				</Button>
			</Stack>
		</Card>
	);
};
