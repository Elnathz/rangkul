---
name: rangkul-state-machine
description: Use when building or reviewing Rangkul task status UI, task actions, acceptance, check-in, evidence submission, cancellation, rescheduling, or race-condition handling.
---

# Rangkul Task State Machine

Use `docs/TDD_Rangkul.md` §3.1, §3.2, §3.7, §4.5, §7, and §14.4 as the authority. This skill governs frontend behavior only. Server-side transitions, conditional updates, database constraints, and scheduled jobs belong in a backend handoff.

## Core Rules

- Treat the task status from the API as authoritative. Never infer a successful transition from a button click, optimistic local state, or a stale list response.
- The valid business statuses are `diajukan`, `menunggu_persetujuan_koordinator`, `dikonfirmasi`, `dikerjakan`, `menunggu_persetujuan_keluarga`, `selesai`, and `dibatalkan`.
- Render actions from the current role, current status, and API response. Hide or disable actions that are not valid for that combination, and explain why an action is unavailable.
- Helper acceptance must call `PATCH /api/tasks/:id/accept`. The client must not implement read-then-write acceptance and must treat HTTP 409 as a normal race outcome, not as a generic failure.
- After a 409, refresh the task or job board and tell the Helper that another Helper accepted it. Do not retry acceptance automatically.
- A task that has passed its one-hour acceptance window is not accept-able in the UI, but expiry remains a server concern.
- Evidence submission is complete only when the API confirms evidence and Health Snapshot storage together with the `selesai` transition. Do not show a submitted state after upload alone.

## Action Matrix

| Status | Keluarga | Helper | Koordinator |
| --- | --- | --- | --- |
| `diajukan` | cancel or reschedule when §3.7 permits | accept | no task transition unless the booking requires explicit approval |
| `menunggu_persetujuan_koordinator` | view waiting state | view waiting state | approve only when the TDD condition applies |
| `dikonfirmasi` | cancel or reschedule within the TDD window | start when scheduled | passive visibility unless explicit approval is required |
| `dikerjakan` | view, report concern | submit evidence, request extra service, trigger SOS | monitor or act on safety/report flows |
| `menunggu_persetujuan_keluarga` | approve or reject extra service | wait without continuing the paused work | passive visibility |
| `selesai` | confirm completion, rate, view report | view completion and payment state | view passive transaction information |
| `dibatalkan` | view reason and compensation state | view reason | view only |

The matrix is a UI guard, not an authorization mechanism. The API and RLS must still reject invalid actions.

## Common Mistakes

- Using English or invented status strings in components instead of the shared task status constants.
- Enabling the accept button after a timeout based only on the browser clock.
- Treating a disabled button as enough explanation for a blocked action.
- Showing a success toast before the API response is received.
- Reposting a failed accept request after a 409, which can create confusing duplicate attempts.

## Stop Conditions

Stop and request a backend handoff when the endpoint lacks a required status, error code, or transition result. Do not delete the payload field or change the business rule to make a type error disappear.
