---
title: Shared Resource Booking
---

# Shared Resource Booking

Use this page to document how your team reserves shared resources.

## Scope

This workflow applies to any resource with limited availability, such as equipment, rooms, review slots, or demo environments.

## Booking steps

1. Open the [[calendar|Reservation Calendar]].
2. Choose an available time window.
3. Add a clear title and optional resource category.
4. Save the reservation.
5. Update or cancel the reservation if plans change.

## Conflict rules

- Do not overwrite another user's reservation without agreement.
- Keep booking titles understandable to the whole team.
- Prefer shorter reservations when demand is high.

## Admin notes

The calendar stores data in Supabase. Review `supabase/migrations/001_initial_schema.sql` before production use.
