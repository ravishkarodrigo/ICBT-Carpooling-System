import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RideCard from '../src/components/RideCard.jsx';

const ride = {
  id: 'r1', origin: 'Maharagama', destination: 'ICBT Campus',
  date: '2026-09-02', timeStart: '08:00', timeEnd: '09:00',
  driverName: 'Kavindu', status: 'open', seatsAvailable: 2, seatsTotal: 3, notes: '',
};

describe('RideCard', () => {
  it('renders route, driver and seat availability', () => {
    render(<MemoryRouter><RideCard ride={ride} /></MemoryRouter>);
    expect(screen.getByText('Maharagama')).toBeInTheDocument();
    expect(screen.getByText('ICBT Campus')).toBeInTheDocument();
    expect(screen.getByText(/Kavindu/)).toBeInTheDocument();
    expect(screen.getByText('2 seats')).toBeInTheDocument();
  });

  it('links to the ride detail page', () => {
    render(<MemoryRouter><RideCard ride={ride} /></MemoryRouter>);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/rides/r1');
  });
});
