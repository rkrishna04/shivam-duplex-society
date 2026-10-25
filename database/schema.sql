-- Shivam Duplex Portal: PostgreSQL 15+ baseline schema
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TYPE society_role AS ENUM ('OWNER','TENANT','COMMITTEE','SECURITY','STAFF');
CREATE TYPE occupancy_status AS ENUM ('SELF_OCCUPIED','RENTED','VACANT');
CREATE TYPE approval_status AS ENUM ('PENDING','APPROVED','REJECTED');
CREATE TYPE ticket_status AS ENUM ('OPEN','IN_PROGRESS','RESOLVED','CLOSED');
CREATE TYPE expense_status AS ENUM ('DRAFT','PENDING_APPROVAL','PARTIALLY_APPROVED','APPROVED','REJECTED','PAID');
CREATE TYPE sos_type AS ENUM ('MEDICAL','FIRE','SECURITY','ANIMAL_RESCUE');

CREATE TABLE societies (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name varchar(160) NOT NULL,
 timezone varchar(64) NOT NULL DEFAULT 'Asia/Kolkata', latitude numeric(9,6), longitude numeric(9,6),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK ((latitude IS NULL AND longitude IS NULL) OR (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180))
);
CREATE TABLE users (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), full_name varchar(120) NOT NULL,
 phone_e164 varchar(16) NOT NULL UNIQUE, email varchar(254) UNIQUE, password_hash text,
 profile_photo_key text, is_active boolean NOT NULL DEFAULT true, phone_verified_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE houses (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, society_id uuid NOT NULL REFERENCES societies(id),
 house_number varchar(20) NOT NULL, occupancy occupancy_status NOT NULL DEFAULT 'VACANT',
 map_node_id varchar(80) NOT NULL, map_x numeric(8,3), map_y numeric(8,3), map_z numeric(8,3),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(society_id,house_number), UNIQUE(society_id,map_node_id)
);
CREATE TABLE house_memberships (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, house_id bigint NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, role society_role NOT NULL,
 is_primary boolean NOT NULL DEFAULT false, valid_from date NOT NULL DEFAULT CURRENT_DATE, valid_until date,
 created_at timestamptz NOT NULL DEFAULT now(), CHECK(valid_until IS NULL OR valid_until>=valid_from),
 UNIQUE(house_id,user_id,role,valid_from)
);
CREATE INDEX house_memberships_user_active_idx ON house_memberships(user_id,role,house_id) WHERE valid_until IS NULL;
CREATE UNIQUE INDEX one_primary_membership_per_user_role ON house_memberships(user_id,role) WHERE is_primary AND valid_until IS NULL;

CREATE TABLE committee_terms (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, society_id uuid NOT NULL REFERENCES societies(id),
 user_id uuid NOT NULL REFERENCES users(id), house_id bigint REFERENCES houses(id),
 position_title varchar(60) NOT NULL, row_tier smallint NOT NULL CHECK(row_tier IN (1,2)),
 assigned_line varchar(120) NOT NULL, avatar_model_key text, display_order smallint NOT NULL,
 term_start date NOT NULL, term_end date, is_current boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK(term_end IS NULL OR term_end>=term_start)
);
CREATE INDEX committee_current_order_idx ON committee_terms(society_id,row_tier,display_order) WHERE is_current;
CREATE INDEX committee_line_idx ON committee_terms(society_id,assigned_line) WHERE is_current;

CREATE TABLE tenant_leases (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), house_id bigint NOT NULL REFERENCES houses(id),
 tenant_user_id uuid NOT NULL REFERENCES users(id), lease_start date NOT NULL, lease_end date NOT NULL,
 approval approval_status NOT NULL DEFAULT 'PENDING', created_by uuid NOT NULL REFERENCES users(id),
 approved_by uuid REFERENCES users(id), approved_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK(lease_end>=lease_start)
);
CREATE INDEX tenant_leases_house_period_idx ON tenant_leases(house_id,lease_start DESC,lease_end);
CREATE INDEX tenant_leases_pending_idx ON tenant_leases(created_at) WHERE approval='PENDING';

CREATE TABLE documents (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), society_id uuid NOT NULL REFERENCES societies(id),
 house_id bigint REFERENCES houses(id), uploaded_by uuid NOT NULL REFERENCES users(id),
 document_type varchar(60) NOT NULL, visibility varchar(16) NOT NULL CHECK(visibility IN ('SOCIETY_OWNER','UNIT_AUTHORIZED','COMMITTEE_ONLY')),
 object_key text NOT NULL, original_filename varchar(255) NOT NULL, content_type varchar(120) NOT NULL,
 byte_size bigint NOT NULL CHECK(byte_size BETWEEN 1 AND 52428800), sha256_hex char(64) NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK((visibility='SOCIETY_OWNER' AND house_id IS NULL) OR (visibility<>'SOCIETY_OWNER' AND house_id IS NOT NULL))
);
CREATE INDEX documents_society_recent_idx ON documents(society_id,created_at DESC);
CREATE INDEX documents_unit_recent_idx ON documents(house_id,created_at DESC) WHERE house_id IS NOT NULL;

CREATE TABLE maintenance_invoices (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), house_id bigint NOT NULL REFERENCES houses(id),
 billing_period date NOT NULL, amount numeric(12,2) NOT NULL CHECK(amount>=0),
 late_fee numeric(12,2) NOT NULL DEFAULT 0 CHECK(late_fee>=0), due_date date NOT NULL,
 status varchar(16) NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','PAID','OVERDUE','VOID')),
 provider_reference varchar(120), receipt_object_key text, paid_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(house_id,billing_period)
);
CREATE INDEX maintenance_due_idx ON maintenance_invoices(due_date,house_id) WHERE status IN ('PENDING','OVERDUE');
CREATE INDEX maintenance_house_history_idx ON maintenance_invoices(house_id,billing_period DESC);

CREATE TABLE society_expenses (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), society_id uuid NOT NULL REFERENCES societies(id),
 logged_by uuid NOT NULL REFERENCES users(id), expense_line varchar(120) NOT NULL,
 vendor_name varchar(160) NOT NULL, amount numeric(12,2) NOT NULL CHECK(amount>0),
 currency char(3) NOT NULL DEFAULT 'INR', invoice_object_key text NOT NULL, expense_date date NOT NULL,
 status expense_status NOT NULL DEFAULT 'PENDING_APPROVAL', idempotency_key varchar(128) NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(society_id,idempotency_key)
);
CREATE INDEX expenses_monthly_idx ON society_expenses(society_id,expense_date DESC,status);
CREATE INDEX expenses_pending_idx ON society_expenses(society_id,created_at) WHERE status IN ('PENDING_APPROVAL','PARTIALLY_APPROVED');
CREATE TABLE expense_approvals (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, expense_id uuid NOT NULL REFERENCES society_expenses(id),
 approver_id uuid NOT NULL REFERENCES users(id), decision approval_status NOT NULL, comment text,
 decided_at timestamptz NOT NULL DEFAULT now(), UNIQUE(expense_id,approver_id)
);
CREATE INDEX expense_approvals_expense_idx ON expense_approvals(expense_id,decided_at);

CREATE TABLE helpdesk_tickets (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), society_id uuid NOT NULL REFERENCES societies(id),
 house_id bigint NOT NULL REFERENCES houses(id), raised_by uuid NOT NULL REFERENCES users(id),
 assigned_committee_term_id bigint REFERENCES committee_terms(id), category_line varchar(120) NOT NULL,
 description text NOT NULL CHECK(length(description) BETWEEN 5 AND 5000), photo_object_key text,
 status ticket_status NOT NULL DEFAULT 'OPEN', idempotency_key varchar(128) NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(raised_by,idempotency_key)
);
CREATE INDEX ticket_queue_idx ON helpdesk_tickets(society_id,status,created_at DESC);
CREATE INDEX ticket_assignee_idx ON helpdesk_tickets(assigned_committee_term_id,status,created_at DESC);

CREATE TABLE vehicles (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, house_id bigint NOT NULL REFERENCES houses(id),
 registered_by uuid NOT NULL REFERENCES users(id), plate_normalized varchar(20) NOT NULL UNIQUE,
 vehicle_type varchar(16) NOT NULL CHECK(vehicle_type IN ('2W','4W','OTHER')),
 active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX vehicles_house_active_idx ON vehicles(house_id) WHERE active;
CREATE TABLE parking_alerts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), vehicle_id bigint NOT NULL REFERENCES vehicles(id),
 raised_by uuid NOT NULL REFERENCES users(id), blocked_location varchar(120) NOT NULL,
 status varchar(16) NOT NULL DEFAULT 'QUEUED' CHECK(status IN ('QUEUED','SENT','ACKNOWLEDGED','CANCELLED','FAILED')),
 provider_message_id text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX parking_alerts_recent_idx ON parking_alerts(created_at DESC,status);

CREATE TABLE staff (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), society_id uuid NOT NULL REFERENCES societies(id),
 full_name varchar(120) NOT NULL, staff_type varchar(40) NOT NULL, pass_token_hash text NOT NULL UNIQUE,
 is_active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE staff_house_assignments (
 staff_id uuid NOT NULL REFERENCES staff(id), house_id bigint NOT NULL REFERENCES houses(id),
 valid_from date NOT NULL DEFAULT CURRENT_DATE, valid_until date, PRIMARY KEY(staff_id,house_id,valid_from),
 CHECK(valid_until IS NULL OR valid_until>=valid_from)
);
CREATE TABLE staff_attendance (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, staff_id uuid NOT NULL REFERENCES staff(id),
 event_type varchar(8) NOT NULL CHECK(event_type IN ('ENTRY','EXIT')), gate_device_id varchar(80) NOT NULL,
 event_at timestamptz NOT NULL DEFAULT now(), idempotency_key varchar(128) NOT NULL UNIQUE
);
CREATE INDEX staff_attendance_staff_recent_idx ON staff_attendance(staff_id,event_at DESC);

CREATE TABLE emergency_sos_alerts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), society_id uuid NOT NULL REFERENCES societies(id),
 house_id bigint NOT NULL REFERENCES houses(id), triggered_by uuid NOT NULL REFERENCES users(id),
 alert_type sos_type NOT NULL, status varchar(16) NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','ACKNOWLEDGED','RESOLVED','FALSE_ALARM')),
 idempotency_key varchar(128) NOT NULL, acknowledged_by uuid REFERENCES users(id), acknowledged_at timestamptz,
 resolved_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(triggered_by,idempotency_key)
);
CREATE INDEX sos_active_recent_idx ON emergency_sos_alerts(society_id,created_at DESC) WHERE status IN ('ACTIVE','ACKNOWLEDGED');

CREATE TABLE audit_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, society_id uuid NOT NULL REFERENCES societies(id),
 actor_user_id uuid REFERENCES users(id), action varchar(100) NOT NULL, entity_type varchar(80) NOT NULL,
 entity_id text NOT NULL, request_id uuid, previous_hash char(64), payload_hash char(64) NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_entity_recent_idx ON audit_events(entity_type,entity_id,created_at DESC);
CREATE INDEX audit_society_recent_idx ON audit_events(society_id,created_at DESC);
COMMIT;

-- Production requirements:
-- Enforce house/society authorization in the API and PostgreSQL RLS.
-- Store uploads in a private object bucket with short-lived signed URLs and content scanning.
-- Require two distinct authorized approvers; lock expense rows during transitions.
-- Mutating APIs need durable idempotency records and transactional outbox events.
-- Never trust a client role switch as authorization. Validate payment webhooks and audit state changes.
