import PropTypes from "prop-types";
import { TableCell, TableSortLabel } from "@mui/material";

export const SortableHeader = ({ field, label, sort, onSort, align }) => {
	const active = sort?.field === field;
	const dir = active ? sort.dir : "asc";
	return (
		<TableCell align={align} sortDirection={active ? dir : false}>
			<TableSortLabel
				active={active}
				direction={dir}
				onClick={() => onSort?.(field)}
			>
				{label}
			</TableSortLabel>
		</TableCell>
	);
};

SortableHeader.propTypes = {
	field: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	sort: PropTypes.shape({
		field: PropTypes.string,
		dir: PropTypes.oneOf(["asc", "desc"]),
	}),
	onSort: PropTypes.func,
	align: PropTypes.oneOf(["left", "center", "right", "inherit", "justify"]),
};
