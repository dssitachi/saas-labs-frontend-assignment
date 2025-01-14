import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ProjectsTable from '../ProjectsTable';

// Mock data
const mockProjects = [
  {
    "s.no": 0,
    "amt.pledged": 15823,
    "blurb": "Test Project 1",
    "by": "Test User 1",
    "country": "US",
    "currency": "usd",
    "end.time": "2016-11-01T23:59:00-04:00",
    "location": "Washington, DC",
    "percentage.funded": 186,
    "num.backers": "219382",
    "state": "DC",
    "title": "Test Project 1",
    "type": "Town",
    "url": "/test1",
  },
  // Add more mock projects to test pagination
  ...Array.from({ length: 24 }, (_, i) => ({
    "s.no": i + 1,
    "amt.pledged": 10000 + i,
    "blurb": `Test Project ${i + 2}`,
    "by": `Test User ${i + 2}`,
    "country": "US",
    "currency": "usd",
    "end.time": "2016-11-01T23:59:00-04:00",
    "location": "Washington, DC",
    "percentage.funded": 100 + i,
    "num.backers": "1000",
    "state": "DC",
    "title": `Test Project ${i + 2}`,
    "type": "Town",
    "url": `/test${i + 2}`,
  })),
];

// Mock fetch
global.fetch = jest.fn();

describe('ProjectsTable Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      new Promise(() => {})
    );

    render(<ProjectsTable />);
    expect(screen.getByText('Loading projects...')).toBeInTheDocument();
  });

  it('renders error state when fetch fails', async () => {
    const errorMessage = 'Failed to fetch data';
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    render(<ProjectsTable />);

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  it('renders projects data correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProjects,
    });

    render(<ProjectsTable />);

    await waitFor(() => {
      expect(screen.getByText('186')).toBeInTheDocument();
      expect(screen.getByText('15823')).toBeInTheDocument();
    });
  });

  it('displays correct number of rows per page', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProjects,
    });

    render(<ProjectsTable />);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      // +1 for header row
      expect(rows.length).toBe(6); // 5 data rows + 1 header row
    });
  });

  it('pagination navigation works correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProjects,
    });

    render(<ProjectsTable />);

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
    });

    // Test next page navigation
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);
    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();

    // Test previous page navigation
    const prevButton = screen.getByText('Previous');
    await user.click(prevButton);
    expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
  });

  it('pagination buttons are disabled correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProjects,
    });

    render(<ProjectsTable />);

    await waitFor(() => {
      expect(screen.getByText('Previous')).toBeDisabled();
      expect(screen.getByText('Next')).not.toBeDisabled();
    });

    // Go to last page
    const lastPageButton = screen.getByText('5');
    await user.click(lastPageButton);

    expect(screen.getByText('Next')).toBeDisabled();
    expect(screen.getByText('Previous')).not.toBeDisabled();
  });

  it('handles empty data correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<ProjectsTable />);

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
      expect(screen.getByText('Previous')).toBeDisabled();
      expect(screen.getByText('Next')).toBeDisabled();
    });
  });
});