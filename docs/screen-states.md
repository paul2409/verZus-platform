# VERZUS Screen and Widget States

Every applicable screen or widget must explicitly support the following states.

## Loading

Initial data has not arrived. Use stable skeleton dimensions.

## Success

Current valid data is available.

## Empty

Request succeeded but no records exist. Explain why and provide a meaningful next action where possible.

## Stale

Cached data is visible but refresh failed or freshness threshold passed. Show last updated time.

## Error

The feature failed. Provide retry when safe and a request ID for support.

## Offline

Network is unavailable. Preserve cached data and queue only actions that are safe to replay.

## Retrying

A retry is in progress. Do not duplicate user mutations.

## Unauthorized

No authenticated session. Redirect or request login.

## Forbidden

User is authenticated but lacks permission. Do not present as not found unless privacy policy requires it.

## Not found

The requested resource does not exist or is no longer available.

## Maintenance

Feature is intentionally unavailable. Preserve shell and unaffected modules.

## Partial failure

One or more sections failed while the rest remain usable.

## Suspended or restricted

Account or resource is restricted. Explain allowed next steps.

## Expired

Invite, reward, check-in window, or token is no longer valid.

## Conflict

Server state changed after the client loaded. Refresh current state before retrying.
