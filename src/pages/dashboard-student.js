import Head from "next/head";
import { Box, Container, Stack, Typography } from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { AssignmentStepper } from "src/sections/assignments/assignment-stepper";
import { StandingStrip } from "src/sections/student/standing-strip";

export const Page = () => (
	<>
		<Head>
			<title>Student Dashboard | Summary Evaluation System</title>
		</Head>
		<Box
			component="main"
			sx={{
				flexGrow: 1,
				py: 8,
			}}
		>
			<Container maxWidth="lg">
				<Stack spacing={3}>
					<Stack spacing={1}>
						<Typography component="h1" variant="h4">Practice a summary</Typography>
						<Typography color="text.secondary" variant="body2">
							Pick an assignment, read the passage, and submit your summary to
							get instant content and wording feedback.
						</Typography>
					</Stack>
					<StandingStrip />
					<AssignmentStepper />
				</Stack>
			</Container>
		</Box>
	</>
);

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
