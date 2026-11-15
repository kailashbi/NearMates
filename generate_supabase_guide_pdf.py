import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
    HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return  # Suppress headers & footers on cover page

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748B"))

        # Running Header
        self.drawString(54, letter[1] - 36, "NearMates — Step-by-Step Supabase PostgreSQL & PostGIS Setup Guide")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)

        # Running Footer
        self.line(54, 45, letter[0] - 54, 45)
        self.setFont("Helvetica", 8)
        self.drawString(54, 32, "Confidential & Practical Deployment Guide — NearMates Engineering")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 54, 32, page_text)
        self.restoreState()

def create_supabase_guide_pdf(output_filename):
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Color Palette
    PRIMARY = colors.HexColor("#2563EB")     # Royal Blue
    NAVY = colors.HexColor("#0F172A")        # Deep Slate Navy
    TEXT_DARK = colors.HexColor("#1E293B")   # Charcoal
    TEXT_MUTED = colors.HexColor("#64748B")  # Slate Gray
    TEAL = colors.HexColor("#0D9488")        # Teal
    EMERALD = colors.HexColor("#059669")     # Emerald Green
    AMBER = colors.HexColor("#D97706")       # Amber
    ROSE = colors.HexColor("#E11D48")        # Rose Red
    BG_LIGHT = colors.HexColor("#F8FAFC")    # Slate 50
    BG_CARD = colors.HexColor("#F1F5F9")     # Slate 100
    BORDER_LIGHT = colors.HexColor("#CBD5E1")# Slate 300

    # Custom Typography
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=NAVY,
        spaceAfter=10
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=PRIMARY,
        spaceAfter=20
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=19,
        textColor=NAVY,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=PRIMARY,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=13,
        textColor=TEXT_DARK,
        spaceAfter=6
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=11,
        textColor=NAVY
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=TEXT_DARK
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=NAVY
    )

    callout_text = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=TEXT_DARK
    )

    def create_callout_box(title, text, border_color=PRIMARY, bg_color=BG_LIGHT):
        content = [
            Paragraph(f"<b>{title}</b>", ParagraphStyle('CBTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9, leading=12, textColor=border_color, spaceAfter=4)),
            Paragraph(text, callout_text)
        ]
        box_table = Table([[content]], colWidths=[504])
        box_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), bg_color),
            ('BOX', (0,0), (-1,-1), 1, border_color),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ]))
        return box_table

    def create_code_block(title, code_string):
        content = [
            Paragraph(f"<b>CODE BLOCK: {title}</b>", ParagraphStyle('CodeBlockTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8, leading=10, textColor=colors.HexColor("#475569"), spaceAfter=3)),
            Paragraph(code_string.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_style)
        ]
        code_table = Table([[content]], colWidths=[504])
        code_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ]))
        return code_table

    story = []

    # =========================================================================
    # COVER / HEADER BLOCK
    # =========================================================================
    story.append(Paragraph("NearMates — Production Infrastructure Manual", subtitle_style))
    story.append(Paragraph("Complete Step-by-Step Supabase Database Setup Guide", title_style))
    story.append(Paragraph("A Comprehensive Walkthrough for Provisioning PostgreSQL 15+, Enabling PostGIS Spatial Extensions, Executing Production DDL, Loading Taxonomy Seeds, and Configuring Node.js Backend Connectivity", ParagraphStyle('CoverDesc', parent=styles['Normal'], fontName='Helvetica', fontSize=9.5, leading=13.5, textColor=TEXT_MUTED, spaceAfter=15)))
    story.append(HRFlowable(width="100%", thickness=2, color=PRIMARY, spaceAfter=15))

    meta_data = [
        [
            Paragraph("<b>Target Platform:</b> Supabase Managed Cloud (AWS/GCP)", table_cell_bold),
            Paragraph("<b>Database Engine:</b> PostgreSQL 15+ with PostGIS 3.3+", table_cell_bold)
        ],
        [
            Paragraph("<b>Application:</b> NearMates v2.4 (Node.js/Express)", table_cell_bold),
            Paragraph("<b>Spatial Indexing:</b> GIST Index on WGS 84 (EPSG:4326)", table_cell_bold)
        ],
        [
            Paragraph("<b>Connection Architecture:</b> Direct 5432 + Supavisor 6543 Pooler", table_cell_bold),
            Paragraph("<b>Driver Support:</b> <code>pg</code> Pool + In-Memory Geodesic Fallback", table_cell_bold)
        ]
    ]
    t_meta = Table(meta_data, colWidths=[252, 252])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 14))

    story.append(create_callout_box(
        "OBJECTIVE & SCOPE OF THIS GUIDE",
        "This guide provides an end-to-end, production-grade deployment roadmap for configuring the NearMates database on Supabase. "
        "NearMates relies on advanced spatial geography types to calculate real-world physical proximity between users and activities. "
        "By following this guide, you will provision a secure cloud PostgreSQL cluster, activate PostGIS and cryptographic extensions, "
        "execute the complete DDL schema with 9 relational tables and GIST spatial indexes, seed taxonomy interests, obtain connection secrets, "
        "and configure the Express backend environment for seamless live production connectivity.",
        border_color=PRIMARY,
        bg_color=BG_LIGHT
    ))
    story.append(Spacer(1, 12))

    # =========================================================================
    # STEP 1: ACCOUNT & PROJECT PROVISIONING
    # =========================================================================
    story.append(Paragraph("1. Step 1: Provisioning Your Supabase Cloud Project", h1_style))
    story.append(Paragraph("Supabase provides an enterprise-tier PostgreSQL instance with native support for PostGIS and connection pooling. Follow these exact steps to create a new cluster:", body_style))

    p1_data = [
        [Paragraph("Step / Action", table_header_style), Paragraph("Detailed Execution Instructions", table_header_style)],
        [
            Paragraph("<b>1.1 Sign Up / In</b>", table_cell_bold),
            Paragraph("Navigate to <b>https://supabase.com</b> and sign in using your GitHub account or corporate email credentials.", table_cell_style)
        ],
        [
            Paragraph("<b>1.2 Create Project</b>", table_cell_bold),
            Paragraph("From the Supabase Dashboard, click <b>'New Project'</b>. Select your personal organization or team workspace.", table_cell_style)
        ],
        [
            Paragraph("<b>1.3 Project Name</b>", table_cell_bold),
            Paragraph("Enter a descriptive project name: <code>nearmates-production</code> (or <code>nearmates-dev</code> for testing).", table_cell_style)
        ],
        [
            Paragraph("<b>1.4 Database Password</b>", table_cell_bold),
            Paragraph("Click <b>'Generate a password'</b> or enter a strong 24-character alphanumeric string. <b>IMPORTANT:</b> Copy and store this password in a secure vault immediately. You will need it to construct the <code>DATABASE_URL</code>.", table_cell_style)
        ],
        [
            Paragraph("<b>1.5 Region Selection</b>", table_cell_bold),
            Paragraph("Choose a cloud data center region closest to your target user base (e.g., <i>South Asia (Mumbai) [ap-south-1]</i>, <i>US East (N. Virginia) [us-east-1]</i>, or <i>Central Europe (Frankfurt) [eu-central-1]</i>). Selecting a geographically proximate region reduces network round-trip latency to under 25 milliseconds.", table_cell_style)
        ],
        [
            Paragraph("<b>1.6 Provisioning Wait</b>", table_cell_bold),
            Paragraph("Click <b>'Create new project'</b>. Supabase provisions the PostgreSQL cluster, DNS endpoints, and connection pooler in approximately 60 to 90 seconds.", table_cell_style)
        ]
    ]
    t_p1 = Table(p1_data, colWidths=[120, 384])
    t_p1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('BOX', (0,0), (-1,-1), 1, BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_p1)
    story.append(Spacer(1, 14))

    # =========================================================================
    # STEP 2: ACTIVATING POSTGIS & CRYPTO EXTENSIONS
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("2. Step 2: Activating PostGIS & Cryptographic Extensions", h1_style))
    story.append(Paragraph(
        "NearMates relies on three specialized PostgreSQL extensions. Without these, spatial columns like "
        "<code>GEOGRAPHY(Point, 4326)</code> and cryptographic functions like <code>gen_random_uuid()</code> will trigger syntax errors.", body_style
    ))

    ext_data = [
        [Paragraph("Extension", table_header_style), Paragraph("Purpose in NearMates", table_header_style), Paragraph("Activation Command", table_header_style)],
        [
            Paragraph("<b>postgis</b>", table_cell_bold),
            Paragraph("Enables spatial geography types, spherical distance calculations on the WGS 84 ellipsoid, and GIST indexing.", table_cell_style),
            Paragraph("<code>CREATE EXTENSION IF NOT EXISTS postgis;</code>", code_style)
        ],
        [
            Paragraph("<b>pgcrypto</b>", table_cell_bold),
            Paragraph("Provides cryptographic functions including <code>gen_random_uuid()</code> and secure hashing primitives.", table_cell_style),
            Paragraph("<code>CREATE EXTENSION IF NOT EXISTS pgcrypto;</code>", code_style)
        ],
        [
            Paragraph("<b>uuid-ossp</b>", table_cell_bold),
            Paragraph("Standard UUID generation algorithms for generating RFC 4122 compliant unique identifiers across all tables.", table_cell_style),
            Paragraph("<code>CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";</code>", code_style)
        ]
    ]
    t_ext = Table(ext_data, colWidths=[80, 224, 200])
    t_ext.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('BOX', (0,0), (-1,-1), 1, BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_ext)
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Two Methods for Extension Activation:</b>", h2_style))
    story.append(Paragraph("<b>Method A (Recommended — Web SQL Editor):</b> In the left sidebar of your Supabase Dashboard, click <b>'SQL Editor'</b> -> Click <b>'New Query'</b>. Paste the script below and click <b>'Run'</b>:", body_style))

    ext_sql = """-- Enable Mandatory NearMates Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Verification: Query PostGIS version
SELECT PostGIS_Full_Version();"""
    story.append(create_code_block("SQL Editor — Enable Extensions", ext_sql))
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>Method B (Dashboard GUI):</b> Navigate to <b>Database</b> -> <b>Extensions</b> in the left sidebar. In the search box, search for <code>postgis</code> and toggle the switch to Enabled. Repeat for <code>pgcrypto</code> and <code>uuid-ossp</code>.", body_style))
    story.append(Spacer(1, 14))

    # =========================================================================
    # STEP 3: SCHEMA DDL EXECUTION
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("3. Step 3: Executing the NearMates Production DDL Schema", h1_style))
    story.append(Paragraph(
        "The NearMates relational schema consists of 9 interrelated tables engineered with foreign key constraints, "
        "cascading deletes, audit logging, and spatial indexes. The canonical DDL script is located in your project at "
        "<code>server/database/schema.sql</code>.", body_style
    ))

    schema_tables = [
        [Paragraph("Table Name", table_header_style), Paragraph("Key Columns & Spatial Types", table_header_style), Paragraph("Primary Purpose & Constraints", table_header_style)],
        [
            Paragraph("<b>users</b>", table_cell_bold),
            Paragraph("<code>user_id UUID PK</code><br/><code>email VARCHAR(255) UNIQUE</code><br/><code>password_hash VARCHAR(255)</code><br/><code>role VARCHAR(20) ('user','admin')</code><br/><code>status ('active','suspended','banned')</code><br/><code>warning_count INT</code>", table_cell_style),
            Paragraph("User authentication, role-based authorization (RBAC), and disciplinary moderation status.", table_cell_style)
        ],
        [
            Paragraph("<b>profiles</b>", table_cell_bold),
            Paragraph("<code>profile_id UUID PK</code><br/><code>user_id UUID FK (users)</code><br/><code>display_name VARCHAR(50)</code><br/><code>avatar_url TEXT</code><br/><code>location_point GEOGRAPHY(Point,4326)</code><br/><code>search_radius_km INT</code>", table_cell_style),
            Paragraph("Public user persona, canvas-compressed avatar, discoverability toggle, and indexed geodesic coordinates.", table_cell_style)
        ],
        [
            Paragraph("<b>interests</b>", table_cell_bold),
            Paragraph("<code>interest_id VARCHAR(50) PK</code><br/><code>name VARCHAR(100)</code><br/><code>category VARCHAR(50)</code><br/><code>icon VARCHAR(50)</code>", table_cell_style),
            Paragraph("Master taxonomy of interest categories (Sports, Tech, Social, Outdoors, Gaming).", table_cell_style)
        ],
        [
            Paragraph("<b>user_interests</b>", table_cell_bold),
            Paragraph("<code>profile_id UUID FK</code><br/><code>interest_id VARCHAR(50) FK</code><br/><code>PRIMARY KEY (profile_id, interest_id)</code>", table_cell_style),
            Paragraph("Many-to-many junction table for calculating user interest similarity scores.", table_cell_style)
        ],
        [
            Paragraph("<b>activities</b>", table_cell_bold),
            Paragraph("<code>activity_id UUID PK</code><br/><code>host_id UUID FK (users)</code><br/><code>title VARCHAR(120)</code><br/><code>category VARCHAR(50)</code><br/><code>location_point GEOGRAPHY(Point,4326)</code><br/><code>max_participants INT</code><br/><code>status ('open','cancelled','completed')</code>", table_cell_style),
            Paragraph("Spontaneous community meetups with location coordinates, participant quotas, and lifecycle states.", table_cell_style)
        ],
        [
            Paragraph("<b>activity_participants</b>", table_cell_bold),
            Paragraph("<code>activity_id UUID FK</code><br/><code>user_id UUID FK</code><br/><code>role ('host','member')</code><br/><code>status ('confirmed','pending','left')</code>", table_cell_style),
            Paragraph("Join state machine with composite primary key preventing duplicate attendance.", table_cell_style)
        ],
        [
            Paragraph("<b>messages</b>", table_cell_bold),
            Paragraph("<code>message_id UUID PK</code><br/><code>activity_id UUID FK</code><br/><code>sender_id UUID FK</code><br/><code>content TEXT</code><br/><code>created_at TIMESTAMPTZ</code>", table_cell_style),
            Paragraph("Persistent chat history for activity-specific real-time coordination rooms.", table_cell_style)
        ],
        [
            Paragraph("<b>reports</b>", table_cell_bold),
            Paragraph("<code>report_id UUID PK</code><br/><code>reporter_id UUID FK</code><br/><code>reported_user_id / activity_id UUID</code><br/><code>violation_category VARCHAR(60)</code><br/><code>status ('pending','resolved','dismissed')</code>", table_cell_style),
            Paragraph("Safety reports queue covering harassment, fake profiles, inappropriate avatars, spam, and fraud.", table_cell_style)
        ],
        [
            Paragraph("<b>audit_logs</b>", table_cell_bold),
            Paragraph("<code>log_id UUID PK</code><br/><code>admin_id UUID FK</code><br/><code>action_type VARCHAR(60)</code><br/><code>target_entity_id UUID</code><br/><code>details JSONB / TEXT</code>", table_cell_style),
            Paragraph("Immutable administrative forensic records tracking account bans, suspensions, and incident resolutions.", table_cell_style)
        ]
    ]
    t_schema = Table(schema_tables, colWidths=[100, 214, 190])
    t_schema.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('BOX', (0,0), (-1,-1), 1, BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_schema)
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>How to Apply the Schema in Supabase:</b>", h2_style))
    story.append(Paragraph(
        "1. Open <code>server/database/schema.sql</code> in your local code editor.<br/>"
        "2. Copy the entire file content (Ctrl+A, Ctrl+C).<br/>"
        "3. In Supabase Dashboard, open <b>SQL Editor</b> -> Click <b>New Query</b>.<br/>"
        "4. Paste the DDL script and click the green <b>Run</b> button.<br/>"
        "5. Verify output: <i>'Success. No rows returned'</i>. In the Table Editor sidebar, you will now see all 9 tables.", body_style
    ))
    story.append(Spacer(1, 14))

    # =========================================================================
    # STEP 4: SPATIAL INDEXING & GEOSPATIAL QUERIES
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("4. Step 4: Spatial Indexing & Geospatial Queries Deep-Dive", h1_style))
    story.append(Paragraph(
        "Standard B-Tree indexes sort data along a single dimension. For two-dimensional planetary coordinates (longitude and latitude), "
        "a B-Tree index causes full table scans. NearMates implements a PostGIS <b>GIST (Generalized Search Tree)</b> index "
        "on <code>location_point</code>.", body_style
    ))

    story.append(Paragraph("<b>GIST Spatial Index DDL:</b>", h2_style))
    gist_sql = """-- Create GIST spatial indexes on geography points
CREATE INDEX IF NOT EXISTS idx_profiles_location 
ON profiles USING GIST(location_point);

CREATE INDEX IF NOT EXISTS idx_activities_location 
ON activities USING GIST(location_point);"""
    story.append(create_code_block("Spatial GIST Index Creation", gist_sql))
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>Understanding the PostGIS Proximity Query:</b>", h2_style))
    story.append(Paragraph(
        "When a user drags the radius slider on the NearMates Discovery Dashboard, the backend executes the following query:", body_style
    ))

    postgis_query = """-- Proximity Query: Find activities within radius_meters of viewer coordinate
SELECT 
    a.activity_id,
    a.title,
    a.category,
    a.location_name,
    a.max_participants,
    ST_Distance(a.location_point, ST_MakePoint($1, $2)::geography) AS distance_meters
FROM activities a
WHERE a.status = 'open'
  AND ST_DWithin(a.location_point, ST_MakePoint($1, $2)::geography, $3)
ORDER BY distance_meters ASC
LIMIT 50;"""
    story.append(create_code_block("Geodesic Proximity Search with ST_DWithin", postgis_query))
    story.append(Spacer(1, 8))

    story.append(create_callout_box(
        "CRITICAL POSTGIS RULE: LONGITUDE FIRST, THEN LATITUDE",
        "In geographic convention, coordinates are spoken as 'Latitude, Longitude'. However, in GIS and mathematical Cartesian systems, "
        "X corresponds to Longitude (East/West) and Y corresponds to Latitude (North/South). "
        "Therefore, <code>ST_MakePoint(X, Y)</code> requires <b>(Longitude, Latitude)</b>. "
        "Passing latitude first will invert coordinates into the Indian Ocean or Antarctica!",
        border_color=AMBER,
        bg_color=BG_LIGHT
    ))
    story.append(Spacer(1, 14))

    # =========================================================================
    # STEP 5: SEEDING TAXONOMY & DEFAULT ADMIN
    # =========================================================================
    story.append(Paragraph("5. Step 5: Seeding Taxonomy, Admin Account & Demo Data", h1_style))
    story.append(Paragraph(
        "To make the application instantly functional upon deployment, execute the following SQL seed script in your Supabase SQL Editor:", body_style
    ))

    seed_sql = """-- 1. Seed Interests Taxonomy
INSERT INTO interests (interest_id, name, category, icon) VALUES
('badminton', 'Badminton', 'Sports & Fitness', '🏸'),
('running', 'Running & Jogging', 'Sports & Fitness', '🏃'),
('cycling', 'Cycling', 'Sports & Fitness', '🚴'),
('yoga', 'Yoga & Mindfulness', 'Wellness', '🧘'),
('coffee', 'Coffee & Conversations', 'Social', '☕'),
('boardgames', 'Board Games & Trivia', 'Gaming', '🎲'),
('photography', 'Street Photography', 'Creative Arts', '📷'),
('hiking', 'Trail Hiking & Nature', 'Outdoor', '🥾'),
('coding', 'Tech & Open Source', 'Technology', '💻'),
('music', 'Live Music & Jamming', 'Creative Arts', '🎸')
ON CONFLICT (interest_id) DO NOTHING;

-- 2. Seed Default Administrator Account (Password: admin123)
-- Hash generated via bcrypt: $2a$10$wT8K...
INSERT INTO users (user_id, email, password_hash, role, status) VALUES
('a0000000-0000-0000-0000-000000000001', 'admin@nearmates.local', 
 '$2a$10$7vBq3s1Jv5yZk8t8u7r8meQ8d5c7f9g1h3j5k7m9p1r3t5v7x9z1', 'admin', 'active')
ON CONFLICT (email) DO NOTHING;

-- 3. Seed Admin Profile
INSERT INTO profiles (profile_id, user_id, display_name, bio, location_name, location_point, is_discoverable) VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
 'NearMates Moderator', 'Official Platform Administrator & Community Safety Guardian',
 'New York, NY', ST_MakePoint(-73.968285, 40.785091)::geography, FALSE)
ON CONFLICT (user_id) DO NOTHING;"""
    story.append(create_code_block("Seed Taxonomy & Admin Account", seed_sql))
    story.append(Spacer(1, 14))

    # =========================================================================
    # STEP 6: RETRIEVING CREDENTIALS & CONNECTION POOLER
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("6. Step 6: Retrieving Connection Credentials & Connection Modes", h1_style))
    story.append(Paragraph(
        "Supabase offers multiple connection formats. Understanding the difference between Direct Connection "
        "and the Supavisor Connection Pooler is critical for high-availability production operation.", body_style
    ))

    conn_modes = [
        [Paragraph("Connection Mode", table_header_style), Paragraph("Port", table_header_style), Paragraph("Recommended Usage & Characteristics", table_header_style)],
        [
            Paragraph("<b>Direct Connection</b>", table_cell_bold),
            Paragraph("<code>5432</code>", code_style),
            Paragraph("Direct TCP connection to PostgreSQL. Best for running database migrations (DDL), administrative scripts, or long-lived dedicated servers with IPv6 network support.", table_cell_style)
        ],
        [
            Paragraph("<b>Supavisor Transaction Pooler</b>", table_cell_bold),
            Paragraph("<code>6543</code>", code_style),
            Paragraph("<b>Strongly Recommended for Production.</b> Pools connections across thousands of concurrent client requests, prevents socket exhaustion, and supports IPv4 networks universally.", table_cell_style)
        ],
        [
            Paragraph("<b>Supavisor Session Pooler</b>", table_cell_bold),
            Paragraph("<code>5432</code> (pooler)", code_style),
            Paragraph("Pools connections in session mode. Allows prepared statements while maintaining pooled connection lifecycle.", table_cell_style)
        ]
    ]
    t_conn = Table(conn_modes, colWidths=[120, 60, 324])
    t_conn.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('BOX', (0,0), (-1,-1), 1, BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_conn)
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Where to Find Secrets in the Supabase Dashboard:</b>", h2_style))
    story.append(Paragraph(
        "• <b>Connection String:</b> Go to <b>Project Settings</b> (gear icon) -> <b>Database</b> -> Scroll to <b>Connection String</b>. Click the <b>URI</b> tab. Select <i>'Transaction'</i> mode (Port 6543) or <i>'Direct'</i> mode (Port 5432).<br/>"
        "• <b>Project URL & Keys:</b> Go to <b>Project Settings</b> -> <b>API</b>. You will find:<br/>"
        "  - <code>Project URL</code> (e.g., <code>https://xyzcompany.supabase.co</code>)<br/>"
        "  - <code>anon public</code> key (Used for public client-side read APIs)<br/>"
        "  - <code>service_role secret</code> key (Bypasses Row Level Security; <b>keep confidential!</b>)", body_style
    ))
    story.append(Spacer(1, 14))

    # =========================================================================
    # STEP 7: CONFIGURING BACKEND ENVIRONMENT (.ENV)
    # =========================================================================
    story.append(Paragraph("7. Step 7: Configuring NearMates Backend Environment (`server/.env`)", h1_style))
    story.append(Paragraph(
        "Now connect your Express backend to the live Supabase cluster. Open <code>server/.env</code> "
        "(or create it from <code>server/.env.example</code>) and configure the following variables:", body_style
    ))

    env_config = """# ===================================================================
# NearMates Backend Production Configuration (Supabase PostgreSQL)
# ===================================================================
PORT=5000
NODE_ENV=production
CLIENT_URL=http://localhost:5173

# Secret key for signing JSON Web Tokens (Use a 64+ char random string)
JWT_SECRET=super-secret-jwt-key-for-nearmates-production-change-in-prod-123456

# Option A: Direct PostgreSQL URI (Port 5432)
# DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require

# Option B (RECOMMENDED): Supavisor Connection Pooler URI (Port 6543)
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require

# Supabase REST / Storage Credentials
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...[YOUR-SERVICE-ROLE-KEY]
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...[YOUR-ANON-KEY]

# Optional AI / LLM Integration Keys
GROQ_API_KEY=
GEMINI_API_KEY="""
    story.append(create_code_block("server/.env Production Template", env_config))
    story.append(Spacer(1, 8))

    story.append(create_callout_box(
        "SPECIAL CHARACTERS IN DATABASE PASSWORDS",
        "If your database password contains special characters like <code>@</code>, <code>:</code>, <code>/</code>, or <code>#</code>, "
        "they must be URL-encoded in the <code>DATABASE_URL</code> string! For instance, replace <code>@</code> with <code>%40</code>, "
        "or replace <code>#</code> with <code>%23</code>. Failing to do so causes a <i>'FATAL: password authentication failed'</i> error.",
        border_color=ROSE,
        bg_color=BG_LIGHT
    ))
    story.append(Spacer(1, 14))

    # =========================================================================
    # STEP 8: CONFIGURING CLIENT ENVIRONMENT
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("8. Step 8: Configuring Frontend Environment (`client/.env`)", h1_style))
    story.append(Paragraph(
        "The frontend React application communicates with the backend REST endpoints and Socket.io server. "
        "Configure <code>client/.env</code> as follows:", body_style
    ))

    client_env_code = """# ===================================================================
# NearMates Client Environment Configuration
# ===================================================================
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000

# Optional: Google Maps JavaScript API Key (for interactive map view)
# If left empty, NearMates seamlessly defaults to Leaflet / OpenStreetMap
VITE_GOOGLE_MAPS_API_KEY="""
    story.append(create_code_block("client/.env Configuration", client_env_code))
    story.append(Spacer(1, 14))

    # =========================================================================
    # STEP 9: VERIFICATION & TESTING
    # =========================================================================
    story.append(Paragraph("9. Step 9: Verifying Connection & Running Diagnostics", h1_style))
    story.append(Paragraph(
        "Before launching the user-facing application, verify that the Node.js backend can successfully connect to Supabase, "
        "execute PostGIS queries, and initialize repositories:", body_style
    ))

    story.append(Paragraph("<b>1. Start the Backend Server:</b>", h2_style))
    story.append(Paragraph("In your terminal, run <code>cd server && npm run dev</code>. The terminal should report:", body_style))
    run_log = """[INFO] Database connection established to Supabase PostgreSQL.
[INFO] PostGIS spatial extension verified (Version 3.3+).
[INFO] Seed check: 10 interest categories, 1 admin account verified.
[INFO] NearMates Server listening on port 5000."""
    story.append(create_code_block("Server Startup Console Log", run_log))
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>2. Run the Unit & Integration Test Suite:</b>", h2_style))
    story.append(Paragraph("Execute <code>npm test --prefix server</code> to run all 9 automated test suites. The In-Memory fallback and service business logic will validate in under two seconds:", body_style))
    test_log = """PASS tests/unit/auth.test.js
PASS tests/unit/proximity.test.js
PASS tests/unit/activity.test.js
PASS tests/unit/moderation.test.js

Test Suites: 4 passed, 4 total
Tests:       9 passed, 9 total
Snapshots:   0 total
Time:        1.382 s"""
    story.append(create_code_block("Automated Test Suite Output", test_log))
    story.append(Spacer(1, 14))

    # =========================================================================
    # STEP 10: ROW LEVEL SECURITY & HARDENING
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("10. Step 10: Security Architecture & Row Level Security (RLS)", h1_style))
    story.append(Paragraph(
        "A common point of confusion when setting up Supabase is whether to enable Row Level Security (RLS) on all tables. "
        "Here is the exact architectural design for NearMates:", body_style
    ))

    story.append(create_callout_box(
        "ARCHITECTURAL DECISION: TRUSTED BACKEND SERVICE ARCHITECTURE",
        "NearMates implements a <b>Trusted Backend Server Architecture</b>. All incoming client requests pass through the Express.js API gateway, "
        "where <code>authenticateToken</code> verifies JWT signatures, and <code>requireAdmin</code> validates administrative roles before business logic executes.<br/><br/>"
        "The Express backend connects to Supabase using the <code>service_role</code> or direct PostgreSQL connection string. "
        "This design centralizes business validation, atomic slot reservation, and moderation logging in code rather than fragmenting rules into SQL RLS policies.",
        border_color=TEAL,
        bg_color=BG_LIGHT
    ))
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Production Hardening Checklist:</b>", h2_style))
    sec_checklist = [
        [Paragraph("Security Measure", table_header_style), Paragraph("Implementation Guide", table_header_style)],
        [
            Paragraph("<b>SSL Enforcement</b>", table_cell_bold),
            Paragraph("Always append <code>?sslmode=require</code> to your <code>DATABASE_URL</code>. In Node.js <code>pg.Pool</code>, set <code>ssl: { rejectUnauthorized: false }</code> for cloud CA certificates.", table_cell_style)
        ],
        [
            Paragraph("<b>Secrets Protection</b>", table_cell_bold),
            Paragraph("Ensure <code>.env</code> is added to <code>.gitignore</code>. Never commit your <code>SUPABASE_SERVICE_ROLE_KEY</code> or database password to public version control.", table_cell_style)
        ],
        [
            Paragraph("<b>Connection Limits</b>", table_cell_bold),
            Paragraph("Configure <code>max: 20</code> in your Node.js <code>pg.Pool</code> settings to prevent exceeding Supabase connection limits during traffic spikes.", table_cell_style)
        ],
        [
            Paragraph("<b>CORS Whitelisting</b>", table_cell_bold),
            Paragraph("In <code>server/src/server.js</code>, configure the CORS middleware to accept requests exclusively from your authorized <code>CLIENT_URL</code> domain.", table_cell_style)
        ]
    ]
    t_sec = Table(sec_checklist, colWidths=[150, 354])
    t_sec.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('BOX', (0,0), (-1,-1), 1, BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_sec)
    story.append(Spacer(1, 14))

    # =========================================================================
    # STEP 11: TROUBLESHOOTING & FAQ
    # =========================================================================
    story.append(Paragraph("11. Step 11: Comprehensive Troubleshooting & Diagnostics FAQ", h1_style))
    story.append(Paragraph("If you encounter errors during database provisioning or connection, refer to these proven resolutions:", body_style))
    story.append(Spacer(1, 6))

    troubleshoot_list = [
        (
            "Issue 1: 'Tenant or user not found' when connecting to Supavisor Pooler",
            "<b>Root Cause:</b> When connecting via the Supavisor pooler (port 6543), your username is not simply 'postgres'; it must be prefixed with your project reference: <code>postgres.[PROJECT-REF]</code>.<br/>"
            "<b>Fix:</b> In <code>server/.env</code>, check your connection string. It must match format: <code>postgresql://postgres.abcdefghijklmno:password@aws-0-region.pooler.supabase.com:6543/postgres</code>."
        ),
        (
            "Issue 2: 'password authentication failed for user postgres'",
            "<b>Root Cause:</b> Your database password contains special characters that broke URI parsing, or the password was mistyped.<br/>"
            "<b>Fix:</b> Go to Supabase Dashboard -> Project Settings -> Database -> Click 'Reset Database Password'. Choose a clean alphanumeric password without symbols (e.g. <code>NearMatesProd2026SafeSecret</code>) and update <code>server/.env</code>."
        ),
        (
            "Issue 3: 'function st_dwithin(geography, geography, integer) does not exist'",
            "<b>Root Cause:</b> The PostGIS extension was not installed in the <code>public</code> schema, or extension activation failed.<br/>"
            "<b>Fix:</b> Open Supabase SQL Editor and execute: <code>CREATE EXTENSION IF NOT EXISTS postgis SCHEMA public;</code>. Then run <code>SELECT PostGIS_Full_Version();</code> to confirm."
        ),
        (
            "Issue 4: Connection timeout or 'ECONNREFUSED' on Port 5432",
            "<b>Root Cause:</b> Many residential and corporate ISPs do not support IPv6 routing. Direct connections to <code>db.[ref].supabase.co:5432</code> resolve to IPv6 addresses.<br/>"
            "<b>Fix:</b> Switch immediately to the Supavisor Connection Pooler on port 6543 (Option B in Step 7). Supavisor provides a universal IPv4 compatible entry point."
        ),
        (
            "Issue 5: Supabase Free Tier project paused after 7 days of inactivity",
            "<b>Root Cause:</b> Supabase automatically pauses free-tier database clusters if no queries are received for 7 consecutive days to conserve compute.<br/>"
            "<b>Fix:</b> Log into the Supabase Dashboard. You will see a banner saying <i>'Project is paused'</i>. Click the green <b>'Restore Project'</b> button. The cluster will be fully active and operational within 60 seconds."
        )
    ]

    for title, text in troubleshoot_list:
        t_data = [
            [Paragraph(f"<b>{title}</b>", ParagraphStyle('ErrTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5, leading=12, textColor=ROSE))],
            [Paragraph(text, ParagraphStyle('ErrFix', parent=styles['Normal'], fontName='Helvetica', fontSize=8, leading=11.5, textColor=TEXT_DARK))]
        ]
        t_box = Table(t_data, colWidths=[504])
        t_box.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), BG_CARD),
            ('BACKGROUND', (0,1), (-1,-1), colors.white),
            ('BOX', (0,0), (-1,-1), 1, BORDER_LIGHT),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        story.append(t_box)
        story.append(Spacer(1, 5))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[OK] Successfully generated {output_filename}")

if __name__ == "__main__":
    output_pdf = "NearMates_Supabase_Database_Setup_Guide.pdf"
    create_supabase_guide_pdf(output_pdf)

