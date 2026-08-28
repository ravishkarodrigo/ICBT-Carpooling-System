# Product prototyping

The working React app doubles as an **interactive, clickable prototype** — every
screen below is implemented and navigable, so usability can be checked against
real flows rather than static sketches.

## Screen inventory (implemented)
| Screen | Route | Core flow covered |
|--------|-------|-------------------|
| Login | `/login` | US-2 |
| Register | `/register` | US-1 |
| Dashboard | `/dashboard` | Overview, quick actions |
| Find a ride | `/rides` | US-5 (search + rank) |
| Ride detail | `/rides/:id` | US-6, US-8, US-4 |
| Offer a ride | `/rides/new` | US-3 |
| My rides | `/my-rides` | US-7 (approve/decline) |
| Messages | `/messages` | US-8 (real-time chat) |
| Trip history | `/history` | US-11 |
| Profile | `/profile` | US-10 |

## Low-fidelity wireframe (ride search → detail → request)

```
+-------------------------------------------------------------+
|  [sidebar]  |  Find a ride                                  |
|  Dashboard  |  From:[Maharagama] To:[ICBT] Time:[08-09] 🔍 |
|  Find ride  |  ---------------------------------------------|
|  Offer ride |  ( o Maharagama ---- o ICBT )   [2 seats][open]|
|  My rides   |  Mon 08:00-09:00 · Kavindu                    |
|  Messages   |  ( o Nugegoda   ---- o ICBT )   [1 seat ][open]|
|  History    |  ...                                          |
+-------------------------------------------------------------+
        |
        v  (click a card)
+-------------------------------------------------------------+
|  < Back                                    [3/3 free][open] |
|  o Maharagama --------------------------- o ICBT Campus     |
|  Mon 08:00-09:00 · Driver: Kavindu                         |
|  "Leaving from the junction"                              |
|  ------------------------------------------------------     |
|  [ Request a seat ]                                        |
+-------------------------------------------------------------+
```

## Usability check (to be completed by the team)
Run a short walkthrough with 2–3 classmates on the request/accept flow and record
findings here (what confused them, what you changed). This "revised after a
usability check" evidence is what the top rubric band asks for — do not invent
it; capture it from a real session.

### Findings log
| Date | Tester | Observation | Change made |
|------|--------|-------------|-------------|
|      |        |             |             |
