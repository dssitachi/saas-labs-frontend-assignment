import "./ProjectsTable.css";
import { useState, useEffect } from "react";

type Project = {
	"s.no": number;
	"amt.pledged": number;
	blurb: string;
	by: string;
	country: string;
	currency: string;
	"end.time": string;
	location: string;
	"percentage.funded": number;
	"num.backers": string;
	state: string;
	title: string;
	type: string;
	url: string;
};

type PaginationButtonProps = {
	onClick: () => void;
	disabled?: boolean;
	children: React.ReactNode;
	isActive?: boolean;
	"aria-label"?: string;
	"aria-current"?: "page" | undefined;
};

function PaginationButton({
	onClick,
	disabled,
	children,
	isActive,
	"aria-label": ariaLabel,
	"aria-current": ariaCurrent,
}: PaginationButtonProps) {
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={`pagination-button ${isActive ? "active" : ""}`}
			aria-label={ariaLabel}
			aria-current={ariaCurrent}
		>
			{children}
		</button>
	);
}

function ProjectsTable() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const projectsPerPage = 5;
	const maxVisiblePages = 10;

	useEffect(() => {
		async function fetchProjects() {
			try {
				const response = await fetch(
					"https://raw.githubusercontent.com/saaslabsco/frontend-assignment/refs/heads/master/frontend-assignment.json"
				);
				if (!response.ok) {
					throw new Error("Failed to fetch data");
				}
				const data: Project[] = await response.json();
				setProjects(data);
				setLoading(false);
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
				setLoading(false);
			}
		};

		fetchProjects();
	}, []);

	const indexOfLastProject = currentPage * projectsPerPage;
	const indexOfFirstProject = indexOfLastProject - projectsPerPage;
	const currentProjects = projects.slice(
		indexOfFirstProject,
		indexOfLastProject
	);
	const totalPages = Math.ceil(projects.length / projectsPerPage) || 1;

	function getVisiblePageNumbers() {
		let startPage: number;
		let endPage: number;

		if (totalPages <= maxVisiblePages) {
			startPage = 1;
			endPage = totalPages;
		} else {
			if (currentPage <= 5) {
				startPage = 1;
				endPage = maxVisiblePages;
			} else if (currentPage + 4 >= totalPages) {
				startPage = totalPages - maxVisiblePages + 1;
				endPage = totalPages;
			} else {
				startPage = currentPage - 4;
				endPage = currentPage + 5;
			}
		}

		return Array.from(
			{ length: endPage - startPage + 1 },
			(_, i) => startPage + i
		);
	};

	function handlePageChange(pageNumber: number) {
		setCurrentPage(pageNumber);
	};

	if (loading) {
		return (
			<div className="loading" role="status">
				Loading projects...
			</div>
		);
	}

	if (error) {
		return (
			<div className="error" role="alert">
				Error: {error}
			</div>
		);
	}

	const visiblePages = getVisiblePageNumbers();

	return (
		<div className="container">
			<div className="table-wrapper">
				<table className="projects-table">
					<thead>
						<tr>
							<th scope="col">S.No.</th>
							<th scope="col">Percentage Funded</th>
							<th scope="col">Amount Pledged</th>
						</tr>
					</thead>
					<tbody>
						{currentProjects.map((project) => (
							<tr key={project["s.no"]}>
								<td>{project["s.no"]}</td>
								<td>{project["percentage.funded"]}</td>
								<td>{project["amt.pledged"]}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="pagination-wrapper">
				<div className="pagination-info">
					Page {currentPage} of {totalPages}
				</div>
				<div className="pagination" role="navigation" aria-label="Pagination">
					<PaginationButton
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 1}
						aria-label="Previous page"
					>
						Previous
					</PaginationButton>

					{visiblePages.map((pageNumber) => (
						<PaginationButton
							key={pageNumber}
							onClick={() => handlePageChange(pageNumber)}
							isActive={currentPage === pageNumber}
							aria-label={`Page ${pageNumber}`}
							aria-current={currentPage === pageNumber ? "page" : undefined}
						>
							{pageNumber}
						</PaginationButton>
					))}

					<PaginationButton
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
						aria-label="Next page"
					>
						Next
					</PaginationButton>
				</div>
			</div>
		</div>
	);
};

export default ProjectsTable;
