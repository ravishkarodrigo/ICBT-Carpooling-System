# Feature identification & prioritisation

Features are prioritised with **MoSCoW**, justified against the fuel-quota
problem the product exists to solve. The justification column is what the rubric
looks for at the higher bands.

| Feature | Story | Priority | Justification (tied to the problem) |
|---------|-------|----------|-------------------------------------|
| Register / login with hashed passwords | US-1, US-2 | **Must** | Identity is the basis for trust between strangers sharing a car. |
| Post a ride (route + time window + seats) | US-3 | **Must** | Without ride supply there is nothing to share; the time window is what enables matching under fixed class schedules. |
| Search & rank by route + time | US-5 | **Must** | The core value: connecting people on the *same* route/time so one car replaces several. |
| Request a seat | US-6 | **Must** | Turns a match into an actual shared trip. |
| Approve / decline + auto seat count | US-7 | **Must** | Drivers must control who joins; seat accuracy prevents overbooking. |
| Cancel / complete ride | US-4 | **Should** | Plates can't always refuel; statuses must reflect reality so searchers aren't misled. |
| In-app messaging | US-8 | **Should** | Final pickup coordination without exposing personal contacts publicly. |
| Trip history | US-11 | **Should** | Supports cost-splitting and shows usage over time. |
| Notifications | US-9 | **Could** | Improves responsiveness but coordination still works without it. |
| Profile editing | US-10 | **Could** | Useful, not essential to the first shared trip. |
| Payments, live GPS, route optimisation | — | **Won't (this iteration)** | Explicitly out of scope per the brief. |

## Prioritisation method
We scored each candidate on **user value** (does it help someone actually share a
ride today?) and **effort**, then assigned MoSCoW. Musts form the walking
skeleton delivered in early sprints; Shoulds/Coulds are pulled in as capacity
allows. See the [product backlog](../agile/product-backlog.md) for the ordered
list and [sprint planning](../agile/sprint-planning.md) for allocation.
