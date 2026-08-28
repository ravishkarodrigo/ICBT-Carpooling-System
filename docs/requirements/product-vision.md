# Product vision

## Vision statement
For **ICBT students and staff** who **struggle to commute reliably during Sri
Lanka's fuel shortages and odd-even number-plate quota**, **RideShare ICBT** is a
**client–server carpooling web application** that **matches people travelling the
same route at the same time so they can share a single vehicle**. Unlike ad-hoc
messaging groups, our product **structures ride offers, seat availability, and
coordination in one place**, so fewer cars make the same trip and less fuel is
spent queuing.

## Problem context
Sri Lanka experienced fuel shortages this year. Prices rose and a quota-based
distribution system (including odd-even number-plate refuelling days) was
introduced. This directly affects how often students and staff can drive to
campus. Shared transport is a practical response: if four people on the same
route share one car, three vehicles stay out of the fuel queue that day.

## Goals and measurable objectives
| # | Objective | Success measure (target for the project) |
|---|-----------|------------------------------------------|
| G1 | Let users offer and find shared rides quickly | A user can post a ride in under 1 minute; search returns ranked matches |
| G2 | Match by route and time window (not full route optimisation) | Search returns rides scored by origin/destination + time overlap |
| G3 | Coordinate rides safely in-app | Near-real-time messaging works between matched users |
| G4 | Keep personal data protected | Passwords hashed; endpoints authorised; input validated |
| G5 | Be reliably runnable and deployable | `docker compose up --build` runs the full stack; CI is green |

Each objective maps to testable outcomes in [`../architecture/overview.md`](../architecture/overview.md)
and the acceptance criteria in [`user-stories.md`](user-stories.md).

## Target users
Primary: ICBT students who commute. Secondary: ICBT staff. Two in-app roles are
supported (student, staff); both can drive or ride.

## Out of scope (for this iteration)
Full route-optimisation algorithms, payments, live GPS tracking, and native
mobile apps. The brief specifies basic route/time-window matching only.
