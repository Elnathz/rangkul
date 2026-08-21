---
name: rangkul-approval-model
description: Use when building or reviewing Rangkul Helper verification, Koordinator approval, radius service filtering, probation flows, or region fallback UI.
---

# Rangkul Approval Model

Use `docs/TDD_Rangkul.md` §3.3, §4.3, §4.5, §6, §7, and §9 as the authority. The product verifies people through RT/RW community structure, not every ordinary transaction.

## Core Rules

- A Helper is verified by the Koordinator in the Helper's own `wilayah_domisili`. The task location does not transfer verification authority to another region.
- The fallback order is active RT, active RW, then Admin fallback for a genuinely new region. Show the source of verification, including `verified_by_admin_fallback`, when the API exposes it.
- `probation` is the default trust tier after verification. It is not a failure state and should not be presented as a permanent ban.
- Ordinary transactions do not wait for Koordinator action after a Helper has the required trust state. Koordinator receives passive transaction information.
- Explicit transaction approval is required for a new Helper's first booking, a probation Helper, a Helper returning after more than 60 days without a task, a Helper with prior sanction history, or a high-risk category.
- Do not show a probation Helper for a booking targeted less than three hours from now, as required by §3.3.3.
- Do not make the UI infer approval eligibility from a name, region label, or stale profile cache. Use the API's explicit approval requirement and status.
- A Koordinator approval action must be scoped to the related Helper or task returned by the API. The UI cannot broaden the region filter to bypass authorization.

## UI States

Show distinct states for `pending_verification`, `verified`, `rejected`, `under_review`, and `suspended`. For an approval queue, include:

- why approval is needed;
- the Helper's verification source and region;
- the task or Helper information required for a decision;
- pending, success, conflict, forbidden, and empty states;
- a clear explanation when the current Koordinator cannot act.

## Common Mistakes

- Treating every transaction as a Koordinator gate.
- Matching a Helper to a task by region alone and ignoring `radius_layanan_km`.
- Letting a Koordinator approve a Helper outside the Helper's domicile region.
- Treating `terpercaya` as permission to bypass high-risk approval.
- Hiding the Admin fallback marker from Keluarga.
- Allowing a same-day urgent booking to select a probation Helper.

## Backend Handoff

If the API does not return approval reason, verification source, trust tier, region scope, or the forbidden response needed by the UI, record a handoff. Do not invent a client-side approval rule or edit a backend route in the frontend workstream.
