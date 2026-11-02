
- Server functions that must write client-protected columns (ratings, phone_verified_at, verification_status) set `app.trusted_write` locally and reset it before every return; guard triggers trust only that flag or non-client roles, so client writes can never bypass them.
