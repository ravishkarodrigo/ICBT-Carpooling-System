/**
 * Sprint 4 — Frontend Component Tests (pure components, no Auth/socket deps)
 * Covers: Badge, ErrorBanner, EmptyState, RideCard (extended)
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const future = { v7_startTransition: true, v7_relativeSplatPath: true };

import Badge from '../src/components/Badge.jsx';
import ErrorBanner from '../src/components/ErrorBanner.jsx';
import EmptyState from '../src/components/EmptyState.jsx';
import RideCard from '../src/components/RideCard.jsx';

// ── Badge ─────────────────────────────────────────────────────────────────────
describe('Badge component', () => {
  it('[FE-B1] renders "open" with badge-open class', () => {
    render(<Badge status="open" />);
    expect(screen.getByText('open')).toHaveClass('badge-open');
  });

  it('[FE-B2] renders "full" with badge-full class', () => {
    render(<Badge status="full" />);
    expect(screen.getByText('full')).toHaveClass('badge-full');
  });

  it('[FE-B3] renders "cancelled" with badge-cancelled class', () => {
    render(<Badge status="cancelled" />);
    expect(screen.getByText('cancelled')).toHaveClass('badge-cancelled');
  });

  it('[FE-B4] renders "completed" with badge-completed class', () => {
    render(<Badge status="completed" />);
    expect(screen.getByText('completed')).toHaveClass('badge-completed');
  });

  it('[FE-B5] unknown status falls back to badge-completed class', () => {
    render(<Badge status="unknown" />);
    expect(screen.getByText('unknown')).toHaveClass('badge-completed');
  });

  it('[FE-B6] renders the status text content correctly', () => {
    render(<Badge status="open" />);
    expect(screen.getByText('open')).toBeInTheDocument();
  });
});

// ── ErrorBanner ───────────────────────────────────────────────────────────────
describe('ErrorBanner component', () => {
  it('[FE-EB1] renders message when provided', () => {
    render(<ErrorBanner message="Something went wrong" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
  });

  it('[FE-EB2] renders nothing when message is empty string', () => {
    const { container } = render(<ErrorBanner message="" />);
    expect(container.firstChild).toBeNull();
  });

  it('[FE-EB3] renders nothing when message is null', () => {
    const { container } = render(<ErrorBanner message={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('[FE-EB4] renders nothing when message is undefined', () => {
    const { container } = render(<ErrorBanner message={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('[FE-EB5] has role="alert" for accessibility', () => {
    render(<ErrorBanner message="Error!" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('[FE-EB6] applies the alert-error CSS class', () => {
    render(<ErrorBanner message="Error!" />);
    expect(screen.getByRole('alert')).toHaveClass('alert-error');
  });
});

// ── EmptyState ────────────────────────────────────────────────────────────────
describe('EmptyState component', () => {
  it('[FE-ES1] renders title and message', () => {
    render(<EmptyState title="No rides yet" message="Be the first to offer one." />);
    expect(screen.getByText('No rides yet')).toBeInTheDocument();
    expect(screen.getByText('Be the first to offer one.')).toBeInTheDocument();
  });

  it('[FE-ES2] renders optional action element', () => {
    render(
      <EmptyState title="Empty" message="Nothing here" action={<button>Create ride</button>} />
    );
    expect(screen.getByRole('button', { name: 'Create ride' })).toBeInTheDocument();
  });

  it('[FE-ES3] renders without action element without crashing', () => {
    render(<EmptyState title="Empty" message="Nothing here" />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('[FE-ES4] title is inside an h3 heading', () => {
    render(<EmptyState title="My Title" message="desc" />);
    expect(screen.getByRole('heading', { level: 3, name: 'My Title' })).toBeInTheDocument();
  });
});

// ── RideCard (extended) ───────────────────────────────────────────────────────
describe('RideCard component — extended coverage', () => {
  const base = {
    id: 'r1', origin: 'Maharagama', destination: 'ICBT Campus',
    date: '2026-09-02', timeStart: '08:00', timeEnd: '09:00',
    driverName: 'Kavindu', status: 'open', seatsAvailable: 2, seatsTotal: 3, notes: '',
  };

  it('[FE-RC1] shows seat count as "{n} seats"', () => {
    render(<MemoryRouter future={future}><RideCard ride={base} /></MemoryRouter>);
    expect(screen.getByText('2 seats')).toBeInTheDocument();
  });

  it('[FE-RC2] renders status badge', () => {
    render(<MemoryRouter future={future}><RideCard ride={base} /></MemoryRouter>);
    expect(screen.getByText('open')).toBeInTheDocument();
  });

  it('[FE-RC3] does NOT render notes section when notes is empty', () => {
    const { container } = render(
      <MemoryRouter future={future}><RideCard ride={{ ...base, notes: '' }} /></MemoryRouter>
    );
    expect(container.querySelector('p.muted')).toBeNull();
  });

  it('[FE-RC4] renders notes text when provided', () => {
    render(
      <MemoryRouter future={future}>
        <RideCard ride={{ ...base, notes: 'Pick up from junction gate' }} />
      </MemoryRouter>
    );
    expect(screen.getByText('Pick up from junction gate')).toBeInTheDocument();
  });

  it('[FE-RC5] renders the date in meta section', () => {
    render(<MemoryRouter future={future}><RideCard ride={base} /></MemoryRouter>);
    expect(screen.getByText(/2026-09-02/)).toBeInTheDocument();
  });

  it('[FE-RC6] renders time window correctly', () => {
    render(<MemoryRouter future={future}><RideCard ride={base} /></MemoryRouter>);
    expect(screen.getByText(/08:00.+09:00/)).toBeInTheDocument();
  });

  it('[FE-RC7] shows "full" badge for a full ride', () => {
    render(
      <MemoryRouter future={future}>
        <RideCard ride={{ ...base, status: 'full', seatsAvailable: 0 }} />
      </MemoryRouter>
    );
    expect(screen.getByText('full')).toHaveClass('badge-full');
  });

  it('[FE-RC8] shows "cancelled" badge for a cancelled ride', () => {
    render(
      <MemoryRouter future={future}>
        <RideCard ride={{ ...base, status: 'cancelled' }} />
      </MemoryRouter>
    );
    expect(screen.getByText('cancelled')).toHaveClass('badge-cancelled');
  });
});
