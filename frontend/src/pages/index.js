import Head from "next/head";
import { subDays, subHours } from "date-fns";
import { Box, Container, Unstable_Grid2 as Grid,TextField,MenuItem } from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { TotalAssignments } from "src/sections/overview/overview-assignments";
import { OverviewLatestOrders } from "src/sections/overview/overview-submissions";
import { Score } from "src/sections/overview/overview-score";
import { OverviewTasksProgress } from "src/sections/overview/overview-tasks-progress";
import { TotalStudents } from "src/sections/overview/overview-total-students";
import { TotalStudentsEnrolled } from "src/sections/overview/overview-students-enrolled";
import { OverallScore } from "src/sections/overview/overview-total-score";

import { clerkClient } from "@clerk/nextjs";
import { getAuth, buildClerkProps } from "@clerk/nextjs/server";

import { useEffect,useState } from "react";
import { PrismaClient } from '@prisma/client'

import axios from 'axios';

const now = new Date();

const prisma = new PrismaClient();

const taskProgress = (data, enrolledStudents) => {
    let complete = 0;
	data.summaries.forEach(item => {
		console.log(item.is_submitted)
		if (item.is_submitted) {
		  complete += 1;
		}
	  });

    if (!enrolledStudents){
		console.log(enrolledStudents)
		return 0
	}
	return (complete/enrolledStudents * 100).toFixed(1)
	 
}

const getSubmissions = (data) =>{
	return data.summaries.map(item => ({
		id: item.id || '',
		ref: item.question_id || '', // Assuming 'question_id' is the equivalent of 'ref'
		student: {
			name:item.eval_students.firstName,
		},
		submitAt: item.submitted_on,
		status: item.is_submitted ? 'submit' : 'pending',
	  }));
	};

const getRangeValues = (arrayValues) => {
	const ranges = [{ min: 0, max: 35 }, { min: 35, max: 75 }, { min: 75, max: 100 }];
	const counts = new Array(ranges.length).fill(0);
	
	for (const value of arrayValues) {
		for (let i = 0; i < ranges.length; i++) {
		if (value >= ranges[i].min && value < ranges[i].max) {
			counts[i]++;
			break;
		}
		}
	}
	
	return counts;
	};

const calculate = (arrayValues) => {
	const ranges = [];
	const counts = [];
  
	// Define the ranges and initialize counts to zero
	for (let i = 10; i <= 100; i += 10) {
	  ranges.push({ min: i, max: i + 10 });
	  counts.push(0);
	}
	for (const value of arrayValues) {
	  for (let i = 0; i < ranges.length; i++) {
		if (value >= ranges[i].min && value <= ranges[i].max) {
		  counts[i]++;
		  break; 
		}
	  }
	}
	return counts;
  };


const Page = (props) => {
	const[assignmentID,setAssignmentID] = useState(1)
	const[contentScores, setcontentScores] = useState([])
	const[wordingScores, setwordingScores] = useState([])
	const[totalScores, setTotalScores] = useState([])
	const[submissions, setSubmission] = useState([])
	const[studentcount, setStudentCount] = useState(0)
	const[studentsenrolled, setStudentsenrolled] = useState(0)
	const[studentcompleted, setStudentcompleted] = useState(0)
    //const[assignment,setAssignment] = useState("")
	
	

	const { __clerk_ssr_state, assignments,contentValues } = props;

	useEffect(() => {
		// if (typeof window !== "undefined" && window.localStorage) {
		// 	localStorage.setItem("user_data", JSON.stringify(__clerk_ssr_state.user));
		// }
		const fetchStudentCount = async () => {
			try {
				const res = await axios.get('/api/dashboard/students/');
				setStudentCount(res.data.totalStudents)

			} catch (error) {
				// Handle any errors here, such as network issues or failed requests.
				console.error('Error updating assignmentID:', error);
			  }
		}
		fetchStudentCount();
	}, []);

	useEffect(() => {
		const fetchSummaryData = async () => {
		
			try {
				// Send a POST request to the API route to update the assignmentID on the server using Axios.
				const res = await axios.get('/api/dashboard/summaries/'+assignmentID);
				const data = res.data
				setStudentsenrolled(data.summaries.length)
				const contentScores = calculate(data.summaries.map(summary => summary.content_score));
				const wordingScores = calculate(data.summaries.map(summary => summary.wording_score));
				const totalScores = data.summaries.map(summary => {
					const contentScore = parseFloat(summary.content_score);
					const wordingScore = parseFloat(summary.wording_score);
				  
					// Check if parsing was successful before adding
					if (!isNaN(contentScore) && !isNaN(wordingScore)) {
					  return (contentScore + wordingScore)/2;
					}
				  
					// Handle cases where parsing fails (e.g., non-numeric values)
					return 0; // You can choose a different default value if needed
				  });
				

				setcontentScores(contentScores)
				setwordingScores(wordingScores)
				setTotalScores(getRangeValues(totalScores))
				// const res1 = await axios.get('/api/dashboard/summaries/');
                // console.log(res1.data.summaries)
				setSubmission(getSubmissions(data))
				
				setStudentcompleted(taskProgress(data,studentsenrolled))

			  } catch (error) {
				// Handle any errors here, such as network issues or failed requests.
				console.error('Error updating assignmentID:', error);
			  }
		}
		
		fetchSummaryData();
	}, [assignmentID]);
     
    
    const handleSelectChange = async (event) => {
		const selectedValue = event.target.value;
		const selectedQ = assignments.find((assignment) => assignment.question === selectedValue);

		setAssignmentID(selectedQ?.id);


	};

	return (
		<>
			<Head>
				<title>Overview | Summary Evaluation System</title>
			</Head>

			<Box
				component="main"
				sx={{
					flexGrow: 1,
					py: 8,
				}}
			>
				<Container maxWidth="xl">
					<Grid container spacing={3}>
					<TextField
						sx={{ mb: 2 }}
						fullWidth
						id="exampleFormControlSelect"
						select
						label="Assignment"
						helperText="Please select your assignement"
						onChange={handleSelectChange}
					>
						{assignments.map((assignment, index) => (
							<MenuItem key={index} value={assignment.question}>
								{assignment.question}
							</MenuItem>
						))}
						{/* <MenuItem  value="q1"> Question 1</MenuItem>
						<MenuItem value= "q2"> Question 2</MenuItem>
						<MenuItem  value= "q3"> Question 3</MenuItem>
						<MenuItem  value="q4"> Question 4</MenuItem> */}
					</TextField>



						<Grid xs={12} sm={6} lg={3}>
							<TotalAssignments
								difference={12}
								positive
								sx={{ height: "100%" }}
								value = {assignments.length}
							/>
						</Grid>
						<Grid xs={12} sm={6} lg={3}>
							<TotalStudents
								difference={16}
								positive={false}
								sx={{ height: "100%" }}
								value={studentcount}
							/>
						</Grid>
						<Grid xs={12} sm={6} lg={3}>
							<OverviewTasksProgress sx={{ height: "100%" }} value={studentcompleted} />
						</Grid>
						<Grid xs={12} sm={6} lg={3}>
							<TotalStudentsEnrolled sx={{ height: "100%" }} value={studentsenrolled} />
						</Grid>
						<Grid xs={6} lg={4}>
							<Score
								chartSeries={[
									{
										name: "This year",
										data: contentScores,
									},
								]}
								sx={{ height: "100%" }}
								categories = {["0-10", "10-20", "20-30","30-40","40-50","50-60","60-70","70-80","80-90","90-100" ]}
								title = "Content Score"
							/>
							
						</Grid>
						<Grid xs={6} lg={4}>
							<Score
								chartSeries={[
									{
										name: "last year",
										data: wordingScores,
									},
								]}
								sx={{ height: "100%" }}
								categories = {["0-10", "10-20", "20-30","30-40","40-50","50-60","60-70","70-80","80-90","90-100" ]}
								title = "Wording Score"
							/>
							
						</Grid>
						<Grid xs={12} md={6} lg={4}>
							<OverallScore
								chartSeries={totalScores}
								labels={["Low", "Normal", "Best"]}
								sx={{ height: "100%" }}
							/>
						</Grid>
						{/* <Grid xs={12} md={6} lg={4}>
							<OverviewLatestProducts
								products={[
									{
										id: "5ece2c077e39da27658aa8a9",
										image: "/assets/products/product-1.png",
										name: "Healthcare Erbology",
										updatedAt: subHours(now, 6).getTime(),
									},
									{
										id: "5ece2c0d16f70bff2cf86cd8",
										image: "/assets/products/product-2.png",
										name: "Makeup Lancome Rouge",
										updatedAt: subDays(subHours(now, 8), 2).getTime(),
									},
									{
										id: "b393ce1b09c1254c3a92c827",
										image: "/assets/products/product-5.png",
										name: "Skincare Soja CO",
										updatedAt: subDays(subHours(now, 1), 1).getTime(),
									},
									{
										id: "a6ede15670da63f49f752c89",
										image: "/assets/products/product-6.png",
										name: "Makeup Lipstick",
										updatedAt: subDays(subHours(now, 3), 3).getTime(),
									},
									{
										id: "bcad5524fe3a2f8f8620ceda",
										image: "/assets/products/product-7.png",
										name: "Healthcare Ritual",
										updatedAt: subDays(subHours(now, 5), 6).getTime(),
									},
								]}
								sx={{ height: "100%" }}
							/>
						</Grid> */}
						<Grid xs={12} md={12} lg={12}>
							<OverviewLatestOrders
								submissions={submissions}
								sx={{ height: "100%" }}
							/>
						</Grid>
					</Grid>
				</Container>
			</Box>
		</>
	);
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export const getServerSideProps = async (ctx) => {
	//const { userId } = getAuth(ctx.req);

	//const user = userId ? await clerkClient.users.getUser(userId) : undefined;
    const userId = 1
    const assignments = await prisma.eval_assignments.findMany({
		where: {
			createdBy_id: userId, 
		  },
	}
	)
	
	
	// const { assignmentID } = ctx.req.session.assignmentID || 0;
	// console.log(assignmentID)
	// const contentValues = await prisma.eval_summaries.findMany({
	// 	where: {
	// 	  question_id: assignmentID, // Replace 'id' with your actual field name and 'specificId' with the value you want to query by.
	// 	},
	// 	select: {
	// 	 content_score: true, // Specify the field you want to retrieve
	// 	},
	//   });
    
	return { props: {       //...buildClerkProps(ctx.req, { user }), 
	assignments: JSON.parse(
		JSON.stringify(assignments, (key, value) =>
		typeof value === 'bigint' ? value.toString() : value)
	),
    contentValues : JSON.parse(
		JSON.stringify(assignments, (key, value) =>
		typeof value === 'bigint' ? value.toString() : value)
	),   
}};
};

export default Page;
