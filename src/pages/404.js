import Head from "next/head";
import NextLink from "next/link";
import Image from "next/image";
import ArrowLeftIcon from "@heroicons/react/24/solid/ArrowLeftIcon";
import { Box, Button, Container, SvgIcon, Typography } from "@mui/material";

const Page = () => (
	<>
		<Head>
			<title>404 | Summary Evaluation System</title>
		</Head>
		<Box
			component="main"
			sx={{
				alignItems: "center",
				display: "flex",
				flexGrow: 1,
				minHeight: "100%",
			}}
		>
			<Container maxWidth="md">
				<Box
					sx={{
						alignItems: "center",
						display: "flex",
						flexDirection: "column",
					}}
				>
					<Box
						sx={{
							mb: 3,
							textAlign: "center",
						}}
					>
						<Image
							alt="Page not found"
							src="/assets/errors/error-404.png"
							width={492}
							height={492}
							style={{
								maxWidth: "100%",
								width: 400,
								height: "auto",
							}}
						/>
					</Box>
					<Typography align="center" sx={{ mb: 3 }} variant="h3">
						404: Page not found
					</Typography>
					<Typography align="center" color="text.secondary" variant="body1">
						The page you’re looking for doesn’t exist or may have moved.
						Use the navigation or head back to the dashboard.
					</Typography>
					<Button
						component={NextLink}
						href="/"
						startIcon={
							<SvgIcon fontSize="small">
								<ArrowLeftIcon />
							</SvgIcon>
						}
						sx={{ mt: 3 }}
						variant="contained"
					>
						Go back to dashboard
					</Button>
				</Box>
			</Container>
		</Box>
	</>
);

export default Page;
