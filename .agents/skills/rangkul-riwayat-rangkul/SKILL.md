---
name: rangkul-riwayat-rangkul
description: Use when building or reviewing Rangkul Health Snapshot forms, Memory Capsule copy, lansia history timelines, trend charts, attention badges, or non-diagnostic health data UI.
---

# Riwayat Rangkul

Use `docs/TDD_Rangkul.md` §3.12, §4.7, §6, §7, §9, §12, and §14.4 as the authority. Riwayat Rangkul is a continuity record for family decisions, not a medical diagnosis system.

## Core Rules

- Every completed Helper evidence submission includes five 1-to-5 indicators: energy, mobility, mood, appetite, and sleep quality.
- Every completed report includes the `cerita_hari_ini` Memory Capsule text field.
- The timeline is chronological and connects each visit to its photo, story, scores, and timestamp returned by the API.
- Trend displays must label the period and indicator. Do not present a percentage change without enough data or a clear calculation source.
- The `Perlu Perhatian` badge is rule-based: show it only when the average score declines across three consecutive visits, according to the server result or documented shared calculation.
- The badge is an attention signal, not a diagnosis. Use copy that recommends family attention or more frequent visits without claiming a clinical conclusion.
- Health Snapshot values are private data. Render them only for roles allowed by the API and do not include them in public Helper catalogue or public metadata.
- The form needs accessible labels, keyboard-operable score selection, a visible selected state, and validation that every indicator is present before submission.
- Offline evidence drafts must preserve scores, story, and photo references locally without pretending the server accepted the submission.

## UI States

Support no history, one visit, multiple visits, missing chart data, loading, failed query, private or forbidden data, pending sync, submitted, and attention states. A chart is not a substitute for the timeline and must have a text summary for users who cannot see it.

## Common Mistakes

- Using emoji characters as the only score control or status indicator.
- Calling the data a diagnosis, risk score, or clinical recommendation.
- Showing the badge after three low scores when the rule requires a downward trend.
- Hiding the story or photo behind a chart with no accessible alternative.
- Marking an offline draft as `selesai` before synchronization is confirmed.
- Calculating a trend from a single visit.

## Backend Handoff

If the API does not return the five scores, story, timeline order, trend source, badge condition, privacy scope, or sync status required by the TDD, document the gap. Do not invent a new database field or weaken the non-diagnostic rule in the UI.
