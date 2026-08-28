# User stories

Format: *As a `<role>`, I want `<goal>` so that `<benefit>`* with acceptance
criteria. Priority uses MoSCoW. IDs (US-x) are referenced by the backlog and PRs.

## Accounts & access
### US-1 — Register (Must)
As a student/staff member, I want to create an account so that I can use the app.
- [ ] Email must be unique and valid; password ≥ 8 chars with a letter and number.
- [ ] Passwords are stored hashed, never in plain text.
- [ ] On success I'm signed in and taken to the dashboard.

### US-2 — Log in / out (Must)
As a user, I want to log in and out so that my session is secure.
- [ ] Invalid credentials return a generic error (no account enumeration).
- [ ] Protected pages redirect to login when not authenticated.

## Offering rides
### US-3 — Post a ride (Must)
As a driver, I want to post a ride with route, date, time window and seats so that
others can find it.
- [ ] Origin, destination, date, start/end time and seat count are required.
- [ ] End time must be after start time.
- [ ] The ride appears in search as `open` with correct seat availability.

### US-4 — Manage my ride (Should)
As a driver, I want to cancel or complete my ride so that its status is accurate.
- [ ] Only the ride's driver can cancel/complete it.
- [ ] Cancelled/completed rides leave the open list and appear in history.

## Finding & joining rides
### US-5 — Search rides (Must)
As a passenger, I want to search by route and time window so that I find rides
that fit my commute.
- [ ] Matching ranks by origin/destination text match and time overlap.
- [ ] Non-matching rides are excluded.

### US-6 — Request a seat (Must)
As a passenger, I want to request a seat so that the driver can approve me.
- [ ] I cannot request my own ride or a ride that isn't `open`.
- [ ] Duplicate pending requests are prevented.

### US-7 — Approve/decline requests (Must)
As a driver, I want to accept or decline requests so that I control who joins.
- [ ] Only the driver can decide a request.
- [ ] Accepting reduces available seats; a full ride is marked `full`.
- [ ] The passenger is notified of the decision.

## Coordination
### US-8 — Message a ride partner (Should)
As a matched user, I want near-real-time chat scoped to a ride so that we can
coordinate pickup without sharing contacts publicly.
- [ ] Only ride participants can read/send in that thread.
- [ ] Messages appear without a manual refresh.

### US-9 — Notifications (Could)
As a user, I want notifications for requests, approvals and messages so that I
don't miss coordination.

## Profile & history
### US-10 — Edit profile (Could)
As a user, I want to edit my name, phone and home area so that confirmed partners
can reach me.

### US-11 — Trip history (Should)
As a user, I want to see completed/cancelled trips so that I can track my usage.
