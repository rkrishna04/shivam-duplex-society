-- Secure sessions, role-aware tickets and append-only workflow events.
BEGIN;
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash char(64) NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS user_sessions_active_idx ON user_sessions(user_id, expires_at) WHERE revoked_at IS NULL;
CREATE TABLE IF NOT EXISTS helpdesk_ticket_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_id uuid NOT NULL REFERENCES helpdesk_tickets(id) ON DELETE CASCADE,
  actor_user_id uuid NOT NULL REFERENCES users(id),
  from_status ticket_status,
  to_status ticket_status NOT NULL,
  note text NOT NULL CHECK(length(note) BETWEEN 1 AND 2000),
  escalation_level smallint NOT NULL DEFAULT 1 CHECK(escalation_level BETWEEN 1 AND 4),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ticket_events_history_idx ON helpdesk_ticket_events(ticket_id, created_at);
CREATE TABLE IF NOT EXISTS login_attempts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  identifier_hash char(64) NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now(),
  succeeded boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS login_attempts_window_idx ON login_attempts(identifier_hash, attempted_at DESC);
COMMIT;
