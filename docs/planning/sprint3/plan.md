# Sprint 3: Payment Demo, Trust and Safety, and Communication

## Scope

- FR-PAY-01 through FR-PAY-09, with the frontend limited to payment state and Demo Ledger screens.
- FR-SVC-03 through FR-SVC-04 for Layanan Tambahan.
- FR-RPT-01 through FR-RPT-02 for formal reports and the `under_review` state.
- FR-MSG-01 through FR-MSG-03 for task chat and inbox states.
- FR-NOT-01 through FR-NOT-04 for in-app notifications.
- FR-SOS-01 for the Helper emergency action and acknowledgement UI.
- TDD §3.4, §3.6, §3.8, §3.10, §4.6, §4.8, §4.9, §4.10, §7, §9, §13, and §14.4.

## Breakdown File

- Payment screens and client states under `src/app/(keluarga)/pembayaran/[task_id]/`.
- Task detail actions for extra service, report, chat, and SOS under the existing role routes.
- Report, chat, notification, and acknowledgement components under `src/components/`.
- Shared client helpers and validation under `src/hooks/` and `src/lib/` only when the existing API contract supports them.
- Project-local domain guidance under `.agents/skills/` so future agents do not re-derive TDD rules.

## Database Changes

- None in the frontend workstream.
- Backend handoff is required if the API contract does not expose payment status, split amounts, extra-service decisions, report review state, notification read state, or emergency acknowledgement state defined by TDD §6 and §7.
- Do not remove fields from client payloads to hide a schema mismatch. Request a migration and regenerated database types from the backend owner.

## API Endpoints

- Consume the existing contracts for `POST /api/payments/:task_id/charge-dummy`, `GET /api/payments/:task_id`, and `PATCH /api/tasks/:id/complete`.
- Consume `POST /api/tasks/:id/extra-service` and `PATCH /api/tasks/:id/extra-service/:eid`.
- Consume `POST /api/reports`, `GET /api/reports`, and `PATCH /api/reports/:id`.
- Consume `GET /api/messages/conversations`, `GET /api/messages/:task_id`, `POST /api/messages`, and `PATCH /api/messages/:id/read`.
- Consume `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `POST /api/emergency`, and `PATCH /api/emergency/:id/acknowledge`.

## Testing Approach

- Run client validation tests for payment, extra-service, report, and emergency forms when a test runner is available.
- Verify loading, error, empty, disabled, success, and retry states for every new screen.
- Verify the UI never displays released funds, an approved extra service, a resolved report, or an acknowledged alert before the API confirms it.
- Verify role and task-status gates against TDD §3 and §9.
- Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` after implementation.

## Risks and Open Questions

- The repository has no test script or test framework, so automated client tests require an explicit dependency decision.
- Impeccable is referenced by the TDD but is not installed in this Codex session. UI review will use the available `ui-ux-pro-max` skill and the TDD accessibility rules until the team installs Impeccable.
- Midtrans must not be presented as active if the Demo Ledger is the configured provider.
- Existing uncommitted changes are outside this init task and must remain untouched.
