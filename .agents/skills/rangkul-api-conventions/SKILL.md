---
name: rangkul-api-conventions
description: Use when integrating Rangkul browser UI with API routes, request and response types, error states, role permissions, or endpoint contract changes.
---

# Rangkul API Conventions

Use `docs/TDD_Rangkul.md` §7, §8, §9, and §14.2 as the authority. The frontend consumes the contract and does not silently redefine it.

## Request and Response Rules

- Preserve the Indonesian field names and endpoint names defined by TDD, including `harga_dasar`, `harga_final`, `koordinator_id`, `dikonfirmasi`, and `menunggu_persetujuan_koordinator`.
- Use the shared response shape `{ error, message, fieldErrors? }` for failures when the backend contract defines it.
- Treat HTTP status as meaningful: 401 is unauthenticated, 403 is forbidden, 404 is unavailable or not exposed, 409 is a state or concurrency conflict, and 422 is validation failure.
- Render field-level errors near the field when `fieldErrors` exists. Render a useful page or action error for other failures.
- Keep request payloads aligned with the endpoint contract. Do not remove a field to hide a missing database column or stale generated type.
- Parse and validate external API data before using it in interactive UI. Do not assume a successful HTTP response contains a successful business transition.
- Add loading, empty, error, forbidden, retry, and success handling for every API-backed screen.
- Make mutation buttons idempotent from the user's perspective: prevent duplicate clicks, reflect pending state, and refetch after an ambiguous response.
- Keep API adapters separate from presentational components so mock responses can be swapped for the real route without rewriting the UI.

## Contract Change Gate

Before consuming a new endpoint, confirm method, path, request, success response, error response, allowed roles, and seed example. If one is missing, write a handoff in the plan or PR and use a temporary mock only when its shape is explicitly marked as provisional.

## Common Mistakes

- Treating any 2xx response as proof that a task, payment, or report changed state.
- Mapping `diajukan` to a guessed English string in only one page.
- Showing a generic toast for a 409 and leaving stale task data on screen.
- Logging document URLs, tokens, or sensitive payloads to the browser console.
- Catching all errors and turning forbidden data into an empty state.
- Adding a route under `src/app/api/**` from the frontend workstream without explicit backend ownership approval.

## Handoff Format

Record the gap with endpoint path, expected contract, observed response, affected UI state, and the TDD section or FR-ID that requires the behavior. Backend changes must preserve the TDD naming and add migration or regenerated types when schema work is needed.
