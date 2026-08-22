---
name: rangkul-rls-policy
description: Use when reviewing Rangkul data visibility, document access, role-based screens, region-scoped queries, or frontend assumptions about Supabase RLS.
---

# Rangkul RLS Policy Review

Use `docs/TDD_Rangkul.md` §6, §8, and §16 as the authority. This skill does not write migrations or policies in the frontend workstream. It tells the UI agent what must be verified and when to hand off.

## Core Rules

- Treat RLS as the final data boundary. Role checks in route groups, middleware, disabled buttons, and hidden fields are not substitutes for RLS.
- Keluarga can access its own lansia profiles, task data, reports, payments, messages, and Health Snapshot records only as allowed by the TDD relationship.
- Helper can access only tasks assigned or available to that Helper, its own evidence and payment history, and conversations permitted by the task relationship.
- Koordinator access is region-scoped. An RT or RW Koordinator must not receive data outside the wilayah and tingkat scope returned by the API.
- Admin actions and audit logs are privileged. Never render an Admin route as public just because its page shell loads.
- Documents and other sensitive storage objects must remain private and be accessed through short-lived signed URLs.
- Public catalogue responses must not contain KTP, family-relation documents, private addresses, Health Snapshot data, or audit metadata.
- Do not use broad client queries and filter unauthorized rows in JavaScript. Request a server response shaped for the caller's permitted scope.
- Every loading, forbidden, empty, and partial-data state should distinguish \"no data\" from \"not authorized\" without leaking whether another user's record exists.

## Frontend Verification

For each new screen, record:

1. the role that can open it;
2. the resource relationship that permits each query;
3. the server endpoint and expected forbidden response;
4. whether a signed URL or redacted response is required;
5. the empty and forbidden copy that avoids data leakage.

## Common Mistakes

- Fetching all Helpers or reports and filtering by role in the browser.
- Showing a document preview from a permanent storage URL.
- Assuming a route group protects API data.
- Treating a 403 as an empty result.
- Adding a new field or relation to the UI without checking §6 and requesting a migration if the schema lacks it.

## Backend Handoff

Request an explicit RLS test matrix for every new table or storage bucket. If the contract exposes data that violates the TDD scope, do not mask the issue by deleting fields from the response type or client payload. The backend owner must fix the policy, query, migration, or generated types.
