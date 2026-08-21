---
name: rangkul-trust-safety
description: Use when building or reviewing Rangkul identity documents, formal reports, Helper safety status, under-review flows, suspension actions, or sensitive-data UI.
---

# Rangkul Trust and Safety

Use `docs/TDD_Rangkul.md` §3.3, §3.10, §3.11, §4.10, §4.12, §6, §8, and §16 as the authority. Trust and safety screens must preserve due process and data minimization.

## Core Rules

- Two formal reports against the same Helper trigger `under_review`. A rating of one star does not trigger suspension.
- `under_review` blocks the Helper from accepting new tasks. It is not the same as a final `suspended` decision.
- Final suspension requires manual investigation and a Koordinator or Admin decision. The UI must show the decision state and reason returned by the API.
- When Keluarga adds a first lansia profile, the form requires both the lansia identity document and proof of family relationship.
- Sensitive documents use private storage and signed access. Never expose a permanent public URL, show raw storage paths, or include document contents in a public Helper catalogue.
- Only the roles and relationships allowed by TDD may see reports, Health Snapshot data, or identity documents. A client-side hidden field is not an access control.
- Report forms need a clear reason, submission progress, success confirmation, and an error state that does not imply the report was saved.
- Do not encourage users to submit duplicate or retaliatory reports. Explain that a report starts review, not automatic guilt.
- Sensitive copy should avoid diagnosis, certainty, or public shaming. Use the status language defined by the API.

## UI Review Checklist

- The report threshold and current count are visible only to authorized reviewers.
- The Helper sees an actionable review status, not private reporter identity unless the API explicitly permits it.
- Admin and Koordinator queues distinguish `menunggu`, `ditindak`, and `selesai`.
- Document previews have loading, failure, expiry, and inaccessible states.
- Any destructive suspend or account action requires confirmation and displays the reason field required by the contract.

## Common Mistakes

- Suspending after a low rating instead of a second formal report.
- Treating `under_review` as proven misconduct.
- Making a KTP URL public to simplify an image preview.
- Letting any Koordinator inspect reports outside the allowed region.
- Saying an identity document was verified when TDD only requires it to be uploaded and available for later review.

## Backend Handoff

If the API does not expose authorization-safe document access, report count, review status, audit result, or the reason for a safety action, stop the UI integration and write a handoff. Do not weaken the privacy or review rule in the client.
