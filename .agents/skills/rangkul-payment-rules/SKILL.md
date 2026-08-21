---
name: rangkul-payment-rules
description: Use when building or reviewing Rangkul Demo Ledger, payment status, fixed-price booking, extra service approval, cancellation compensation, split amounts, or payment error UI.
---

# Rangkul Payment Rules

Use `docs/TDD_Rangkul.md` §3.4, §3.8, §3.9, §4.6, §6, §7, and §14.1 as the authority. The MVP payment path is the Demo Ledger. Midtrans must not be implied when it is not the configured provider.

## Core Rules

- The booking price is fixed at `harga_dasar`. A Helper cannot negotiate or change it from the client.
- `harga_final` equals the snapshot base price plus only extra services approved by Keluarga.
- An extra service moves the task to `menunggu_persetujuan_keluarga`. The Helper cannot continue the paused work until Keluarga approves or rejects it.
- Normal release splits the completed amount as 90% Helper, 7% Platform, and 3% Koordinator.
- If Keluarga cancels a confirmed task after funds are held in escrow, compensation is 50% to Helper and 50% refund to Keluarga. Platform and Koordinator receive 0%.
- Cancellation before funds are held has no compensation obligation.
- More than two Keluarga cancellations restricts the account and blocks new booking until the appeal flow resolves it.
- The client displays amounts returned by the server. It never calculates a payable or released amount as an authority and never accepts a user-edited split.
- A payment success screen requires confirmed server state. A returned payment URL or clicked button is not proof of `held_escrow` or `released`.
- Payment actions must be idempotent from the UI perspective. Disable duplicate submission while pending and refetch after ambiguous network errors.

## State Copy

Differentiate `pending`, `held_escrow`, `released`, `refunded`, `disputed`, and `dibatalkan_kompensasi`. Explain the next user action for each state. Do not label a Demo Ledger transaction as Midtrans escrow unless the API confirms the Midtrans provider is active.

## Common Mistakes

- Showing a final price before the extra-service decision is reflected by the API.
- Applying a 90/7/3 split to a compensated cancellation.
- Treating a payment redirect as a successful charge.
- Allowing the browser to submit a price or split that contradicts the booking snapshot.
- Removing payment fields from a request because the generated database type is stale.

## Backend Handoff

If the API omits provider, payment status, snapshot amounts, compensation details, or transaction log references, record the contract gap for the backend owner. Do not make the UI silently fall back to a different business rule.
