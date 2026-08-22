# EloraEstate V1

Real Estate Brokerage + CRM + Property Management Platform — Mumbai, MERN stack.

## Build status

**Milestone 1 — Foundation, Data Models & Authentication: DONE**

- Config: `backend/src/config/constants.js` (all fixed V1 enums: roles, lead
  pipeline stages, property types, statuses, etc.), `backend/src/config/db.js`
- Models (Mongoose): `User` (single collection, role-discriminated — Admin /
  Broker / Owner-Caretaker / Client), `Otp`, `Property` (public/internal
  split baked into the schema, not just the API layer), `Lead`
  (pipeline + deal fields), `Requirement`, `CartItem`, `Lineup`, `Visit`,
  `FollowUp`, `Note`, `ActivityLog`
- Auth:
  - Client "User Login": Name → Gender → Mobile → OTP (`POST /api/auth/client/otp/request`,
    `POST /api/auth/client/otp/verify`)
  - Internal "Agent Login": role select (broker / owner_caretaker) →
    registration → Admin approval → password login (`POST /api/auth/internal/register`,
    `POST /api/auth/internal/login`)
  - JWT access + refresh token pattern, `GET /api/auth/me`, `POST /api/auth/refresh`, `POST /api/auth/logout`
  - Admin user management: approve / reject / deactivate / reactivate /
    change role / grant Owner-Caretaker permissions (`/api/admin/users/...`)
  - Role-based middleware (`requireAuth`, `authorize`) enforced server-side,
    not just hidden in the UI, per spec
  - OTP delivery and SMS/WhatsApp vendor integration are isolated behind
    `services/otpDeliveryService.js` — dev mode logs the OTP to the console
    (`OTP_DEV_BYPASS=true`) so you can test without a paid SMS account; a
    real vendor plugs in there later without touching controllers

**Milestone 2 — Property CRUD, Public Site Browsing & Two-Way Matching: DONE**

- `Property`: essential-first `POST /api/properties` (draft) →
  `PATCH /api/properties/:id` (edit-later: photos, amenities, internal
  owner/caretaker/commission/documents, etc.) → `POST /api/properties/:id/publish`
  / `.../hide` / `.../archive` (archive is Admin-only)
- Public browsing: `GET /api/properties` (filters: purpose, category,
  propertyType, locationArea, min/maxPrice, bhk, furnishing, tenantType —
  defaults to Residential + Rent) and `GET /api/properties/:id`, both served
  through `Property.toPublicJSON()` so internal fields are structurally
  impossible to leak here
- Internal views: `GET /api/properties/internal/list` (broker sees only
  their own/assigned + owner-caretaker sees only their own property; Admin
  sees all) and `GET /api/properties/:id/internal`, gated by a single shared
  `canAccessPropertyInternal()` helper so the access rule lives in one place
- `Location`: Admin-managed area list (`/api/locations`) instead of a
  hardcoded enum, per spec
- `Requirement`: structured capture (`POST /api/requirements`,
  `PATCH /api/requirements/:id`), one active requirement per client
- Two-way matching (`services/matchingService.js`) — rule/filter-based, no
  AI/ML, no numeric scores, per spec:
  - Requirement → Properties: returned inline when a requirement is
    created/updated, and via the client's own `GET /api/requirements/me/matches`
  - Property → Requirements: `GET /api/properties/:id/matches` surfaces
    which existing clients might want a newly published property

**Milestone 3 — Cart, Lineup, Visits + Notifications, Follow-ups, Notes, Lead/Deal: DONE**

- `Cart` (`/api/cart`, Client-only): add/remove/list, backed by the public
  property shape — separate collection and separate write-path from Lineup,
  per spec ("Cart and Lineup are NOT the same feature")
- `Lineup` (`/api/lineups/:clientId/...`, Broker/Admin-only): add/remove
  property, per-item status transitions, capped at 10 items (schema-enforced)
- `Lead` (`services/leadService.js` + `/api/leads`): one Lead per client,
  auto-created lazily, stage only ever advances forward through the fixed
  V1 pipeline (never regresses), `assignedBroker` on Lead is the actual
  source of truth for broker-privacy/assignment everywhere else in the app;
  Admin-only reassignment endpoint; outcome (not_interested/rejected/lost)
  and internal Deal fields (status/value/commission) both gated to the
  assigned broker or Admin, never public
- `Visit` (`/api/visits`): schedule (Client post-OTP, or Broker/Admin),
  reschedule/cancel (Client blocked inside a configurable cutoff —
  `VISIT_CLIENT_ACTION_CUTOFF_HOURS`, an explicit open question from the
  requirements report resolved with a sensible default), outcome recording
  that auto-advances the Lead stage and can spin off a Follow-up
  automatically so a completed visit never silently drops out of the pipeline
- Visit notifications (`services/notificationService.js`): WhatsApp send
  attempted per recipient (Client/Broker/Owner-Caretaker; Admin gets
  in-app-only system visibility, per spec), isolated behind one function so
  a real WhatsApp Business API integration is a self-contained swap-in
  later; every event is also recorded via the audit/timeline system
  regardless of WhatsApp delivery outcome, so WhatsApp is never the sole
  source of truth
- `FollowUp` (`/api/follow-ups`): today/overdue/upcoming/priority buckets,
  broker-scoped (Admin sees all), complete/snooze (snoozing requires a new
  due date — a follow-up can be deferred but never just disappears)
- `Note` (`/api/notes`): client or property notes, tag-based, broker-privacy
  enforced via the same Lead.assignedBroker check used everywhere else

**Milestone 4 — Dashboards, Activity Timeline & Reports: DONE**

- `GET /api/dashboard/admin`: totals, active leads, pending/overdue
  follow-ups, today's/upcoming visits, recent published properties,
  per-broker active-lead counts, recent system-wide activity
- `GET /api/dashboard/broker`: my leads by pipeline stage, today's/overdue
  follow-ups, today's/upcoming visits, my lineup count, explicit next
  actions (from `Lead.nextActionNote/DueAt`), recent activity
- `GET /api/dashboard/client`: shortlist, upcoming/past visits, recently
  viewed properties (now tracked — see below), recommended properties (via
  the same matching engine), assigned broker contact
- `GET /api/dashboard/owner`: their own properties (matched via
  `internal.ownerId`), upcoming visits at those properties, their current
  Admin-granted permissions
- `GET /api/dashboard/client-activity` (Admin/Broker): the spec's
  "Client Activity / Interested Clients" page — per-client card with
  shortlist count, last activity, next visit, next follow-up
- `GET /api/activity/client/:clientId`: full paginated CRM timeline for one
  client (Client sees their own; Broker only if assigned; Admin always) —
  built entirely from the `ActivityLog` every other controller already
  writes to, no separate timeline table to keep in sync
- `GET /api/clients` + `GET /api/clients/:clientId/crm-summary`: the
  "open client → understand in seconds" aggregation from spec section 21 —
  profile + lead/pipeline stage + active requirement + lineup + shortlist +
  visits + pending follow-ups + note count + last activity in one call
- `GET /api/reports/broker-performance` and `/business-summary`
  (Admin-only): pipeline distribution, visits completed, deals closed,
  commission totals per broker — commission figures never leave this
  Admin-gated endpoint
- Added `property.viewed` activity logging on the public property-detail
  route (only for an authenticated Client) — this is what powers
  "recently viewed" everywhere above; nothing is tracked for anonymous
  browsing

**Backend V1 feature set is now complete against the verified
requirements.** Remaining: the React frontend (public site + all four role
dashboards), and whatever comes out of running the test suite in section 41
of the original spec once this runs locally.

## Running the backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in real secrets (JWT secrets, Mongo URI)
npm run seed:admin      # creates the first Admin account from .env values
npm run dev              # starts on http://localhost:5000
```

Requires a running MongoDB instance (local or Atlas) — set `MONGO_URI` in `.env`.

**Note:** this was built in a sandboxed environment without internet access,
so dependencies could not be `npm install`-ed or run here. Every file has
been syntax-checked (`node --check`), but you should run it locally and
smoke-test the auth endpoints (`/api/auth/...`) before we build on top of it
in the next milestone.

## Frontend

**Milestone 5 — Public Site, Auth & Dashboard Shell: DONE**

Most of this was already scaffolded (Vite + React + Tailwind, a considered
Mumbai Art Deco design system — see `tailwind.config.js` for the token
rationale, and the stepped-arch "deco step" signature motif used on cards/
buttons throughout) when I picked this up. I filled in the one missing
piece the rest of the app depended on (`App.jsx`, the router) plus the
pages nothing had built yet:

- `App.jsx`: routes the public site (Home, Properties, Property Detail,
  About, Contact, Feedback) through `PublicLayout`, and `/login`
  standalone (no site chrome, keeps the auth flow focused)
- `ProtectedRoute`: mirrors the backend's `requireAuth`/`authorize()` on
  the client side, so the UI never offers a path the API would reject
- `DashboardPage`: a working, role-dispatched summary view (Admin/Broker/
  Client/Owner-Caretaker) built directly on the Milestone 4 dashboard
  endpoints — functional today; dedicated per-role management screens
  (property add/edit, lineup builder, client CRM view, follow-up queue,
  etc.) are the next milestone, this is the landing/overview layer
- `AboutPage` / `ContactPage` / `FeedbackPage`: kept deliberately simple —
  direct call/WhatsApp links rather than bespoke contact-form backends
  nothing in the spec asked for, per "do not over-engineer V1"

Already in place before I touched it: the full public browsing experience
(category/purpose toggles, type/location/budget filters, property cards,
OTP-gated detail + schedule-visit flow, shortlist), and the combined
User Login / Agent Login page (client OTP two-step; broker/owner-caretaker
role-select → register-for-approval or password login) — all wired
correctly against the Milestone 1–4 API contract.

**Milestone 6 — Broker/Admin/Owner-Caretaker Management Screens: DONE**

Again, most of this was already built when I picked it up (`ClientsPage`,
`ClientDetailPage`, `PropertiesManagePage`, `PropertyFormPage`,
`AppLayout`, `TagInput`) — I reviewed all of it field-by-field against the
API contract (it's correct throughout) and filled the remaining gaps:

- Built `FollowUpsPage` (today/overdue/upcoming buckets, priority clients,
  complete/snooze actions), `LeadsPage` (grouped by fixed pipeline stage —
  a simple grouped list, not a drag-and-drop kanban nothing asked for),
  `AdminUsersPage` (approve/reject/deactivate/reactivate + Owner-Caretaker
  permission toggles), `AdminLocationsPage`, and `AdminReportsPage`
- Wired all of it into `App.jsx` behind `AppLayout` (the sidebar app shell)
  with per-route role guards mirroring the backend's `authorize()` exactly
- Fixed one real spec gap while reviewing `ClientDetailPage`: there was no
  way for a Broker/Admin to manually add a client — only public OTP
  self-signup created client accounts, but spec explicitly requires
  "Broker can: Add/manage clients" for offline-sourced leads (referral,
  call, WhatsApp). Added `POST /api/clients` (backend) and an inline
  "+ Add client" form on `ClientsPage` (frontend)
- Related backend fix: `leadController`'s `setNextAction`/`setOutcome`/
  `recordDeal` used to 404 if no Lead existed yet for a client; switched
  them to `findOrCreateLead` so a broker can act on a brand-new client
  immediately instead of needing some other pipeline event to happen first

**Frontend now covers the full spec surface**, including the "open client
→ understand in seconds" CRM view (next action, requirement, lineup
builder, upcoming visits, deal/outcome, tagged notes, full activity
timeline — all on one page), the essential-first/edit-later property flow,
and Admin's full user/location/report management.

### Running the frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173, proxies /api to the backend on :5000
```

Same caveat as the backend: built in a sandbox with no internet access, so
`npm install` and an actual dev-server run need to happen on your machine.

## Project structure

```
backend/
  src/
    config/       fixed enums + DB connection
    models/       Mongoose schemas
    middleware/   auth, role authorization, error handling
    controllers/  request handlers
    routes/       Express routers
    services/     matching engine, external integrations (OTP delivery, later: WhatsApp)
    utils/        JWT, OTP, ApiError, activity logging, admin seed script
    app.js        Express app (middleware stack + routes)
    server.js     entrypoint (env check, DB connect, listen)

frontend/
  src/
    api/          one file per backend resource, thin axios wrappers
    components/   Button, Chip, PropertyCard, PublicLayout, ProtectedRoute, StatCard
    context/      AuthContext (access token in memory, refresh via httpOnly cookie)
    pages/
      public/     Home, Properties (browse+filters), PropertyDetail, About, Contact, Feedback
      auth/       LoginPage (User Login / Agent Login)
      DashboardPage.jsx   role-dispatched summary view
    styles/       Tailwind entrypoint + global CSS
    App.jsx       router
    main.jsx      entrypoint
```
