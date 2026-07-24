import MagnifyingGlassIcon from "@heroicons/react/24/solid/MagnifyingGlassIcon";
import { Card, InputAdornment, OutlinedInput, SvgIcon } from "@mui/material";
import PropTypes from "prop-types";

export const AssignmentSearch = ({ value = "", onChange }) => (
	<Card sx={{ p: 2 }}>
		<OutlinedInput
			value={value}
			onChange={onChange}
			fullWidth
			placeholder="Search previous assignments"
			startAdornment={
				<InputAdornment position="start">
					<SvgIcon color="action" fontSize="small">
						<MagnifyingGlassIcon />
					</SvgIcon>
				</InputAdornment>
			}
			sx={{ maxWidth: 500 }}
		/>
	</Card>
);

AssignmentSearch.propTypes = {
	value: PropTypes.string,
	onChange: PropTypes.func,
};
