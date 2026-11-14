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
            # Skip header and footer on cover page
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748B"))

        # Header
        self.drawString(54, letter[1] - 36, "NearMates — Comprehensive Technical Architecture & Project Documentation")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)

        # Footer
        self.line(54, 45, letter[0] - 54, 45)
        self.setFont("Helvetica", 8)
        self.drawString(54, 32, "Confidential & Proprietary — NearMates Engineering")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 54, 32, page_text)
        self.restoreState()

def create_project_pdf(output_filename):
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    PRIMARY = colors.HexColor("#2563EB")     # Royal Blue
    NAVY = colors.HexColor("#0F172A")        # Deep Slate Navy
    TEXT_DARK = colors.HexColor("#1E293B")   # Charcoal
    TEXT_MUTED = colors.HexColor("#64748B")  # Slate Gray
    TEAL = colors.HexColor("#0D9488")        # Teal
    EMERALD = colors.HexColor("#10B981")     # Emerald Green
    ROSE = colors.HexColor("#E11D48")        # Rose Red
    BG_LIGHT = colors.HexColor("#F8FAFC")    # Cool White/Slate 50
    BORDER_LIGHT = colors.HexColor("#E2E8F0")

    # Typography Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=NAVY,
        spaceAfter=10
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=18,
        textColor=PRIMARY,
        spaceAfter=25
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=NAVY,
        spaceBefore=16,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=PRIMARY,
        spaceBefore=11,
        spaceAfter=5,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'Heading3_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=NAVY,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=TEXT_DARK,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor("#0F172A"),
        backColor=colors.HexColor("#F1F5F9"),
        borderPadding=5,
        spaceAfter=6
    )

    callout_style = ParagraphStyle(
        'Callout_Text',
        parent=body_style,
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor("#1E3A8A")
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

    story = []

    # ========================================================
    # COVER / TITLE BANNER
    # ========================================================
    story.append(Spacer(1, 20))
    story.append(Paragraph("NEARMATES FULL-STACK ARCHITECTURE", ParagraphStyle(
        'Badge', fontName='Helvetica-Bold', fontSize=9, textColor=PRIMARY, spaceAfter=8
    )))
    story.append(Paragraph("NearMates — Comprehensive Technical Architecture & Project Documentation", title_style))
    story.append(Paragraph("Hyper-Local Spontaneous Activity Matching, Social Discovery & Moderation Platform", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=PRIMARY, spaceBefore=0, spaceAfter=15))

    meta_table_data = [
        [Paragraph("<b>Project Repository:</b>", table_cell_bold), Paragraph("https://github.com/kailashbi/NearMates", table_cell_style)],
        [Paragraph("<b>Architecture Type:</b>", table_cell_bold), Paragraph("Full-Stack Decoupled (React 18 + Node.js Express + PostGIS + Socket.io)", table_cell_style)],
        [Paragraph("<b>Authors & Lead Devs:</b>", table_cell_bold), Paragraph("Kailash & Collaborator (Full-Stack Contribution)", table_cell_style)],
        [Paragraph("<b>Documentation Scope:</b>", table_cell_bold), Paragraph("End-to-End System Design, Matching Engine, Moderation Engine & Data Flow", table_cell_style)],
        [Paragraph("<b>Status & Quality:</b>", table_cell_bold), Paragraph("Production-Ready (Automated Test Suites Passing & Verified Client Build)", table_cell_style)]
    ]
    meta_table = Table(meta_table_data, colWidths=[130, 374])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 20))

    # Executive Summary Callout Box
    summary_html = """<b>Executive Summary:</b> NearMates is a modern, hyper-local social coordination platform engineered to eliminate friction in organizing spontaneous real-world recreational activities (sports, coding coworking, board games, running, cafe discussions). It introduces a deterministic, multi-factor <b>Smart Matching Engine</b>, real-time WebSocket messaging, an HTML5 canvas client-side image compression pipeline, a dual-engine database fallback architecture (PostgreSQL PostGIS with In-Memory Demo Fallback), and a comprehensive 4-part <b>Admin Moderation & Incident Investigation Console</b>. This document details the system's objectives, technology choices, architectural data flows, overcome technical challenges, limitations, and future roadmap with exact codebase references."""
    summary_table = Table([[Paragraph(summary_html, callout_style)]], colWidths=[504])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EFF6FF")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#BFDBFE")),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(summary_table)

    story.append(PageBreak())

    # ========================================================
    # SECTION 1: OBJECTIVES & REAL-WORLD PROBLEM
    # ========================================================
    story.append(Paragraph("1. Main Objective & Real-World Problem Solved", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER_LIGHT, spaceBefore=2, spaceAfter=10))

    story.append(Paragraph("<b>The Urban Isolation & Spontaneity Deficit:</b>", h2_style))
    story.append(Paragraph(
        "Modern urban centers and remote-first work cultures have exacerbated social isolation and reduced spontaneous real-world interactions. Traditional social networks (e.g., Facebook, Instagram) emphasize passive digital consumption, asynchronous feeds, and vanity metrics rather than real-time physical assembly. Existing meetup solutions (e.g., Meetup.com, Eventbrite) suffer from high organizer fee friction, rigid schedules days or weeks in advance, impersonal mass groups (30+ attendees), and high no-show rates. Conversely, dating applications optimize for romantic matching rather than platonic shared hobbies.",
        body_style
    ))
    story.append(Paragraph(
        "When an individual wants to play badminton, find a cycling pace partner, co-work at a local coffee shop, or assemble a board game table on a Thursday evening, no platform currently facilitates instant, trust-verified, proximity-aware coordination within their immediate radius.",
        body_style
    ))

    story.append(Paragraph("<b>NearMates Core Mission & Value Proposition:</b>", h2_style))
    story.append(Paragraph(
        "NearMates was built from the ground up to solve this 'last-mile social coordination' dilemma. The platform fulfills four essential objectives:",
        body_style
    ))

    story.append(Paragraph("• <b>Proximity & Timing First:</b> Connects verified individuals within customizable micro-radii (1–100 km, default 15 km) who are currently active and available.", bullet_style))
    story.append(Paragraph("• <b>Domain-Driven Shared Interests:</b> Categorizes users according to a granular 7-domain taxonomy (Sports, Fitness, Games, Food, Tech, Outdoors, Culture) to avoid mismatched expectations.", bullet_style))
    story.append(Paragraph("• <b>Intimate, High-Accountability Group Sizes:</b> Supports min/max participant bounds (e.g., exactly 4 players for doubles tennis/badminton) with host approval or auto-join policies.", bullet_style))
    story.append(Paragraph("• <b>Community Safety & Trust Ecosystem:</b> Embeds peer reviews, mutual star ratings, account status tracking (active/suspended/banned), formal warnings, and an administrative incident escalation pipeline.", bullet_style))

    story.append(Spacer(1, 10))

    # Real World Impact Table
    problem_matrix = [
        [Paragraph("<b>Problem in Current Landscape</b>", table_header_style), Paragraph("<b>NearMates Architectural Solution</b>", table_header_style)],
        [Paragraph("Large impersonal groups with 60% no-show rate", table_cell_bold), Paragraph("Capped participation (min 1, max 100) with approval workflow and verified RSVP roster", table_cell_style)],
        [Paragraph("Scheduling friction (events planned weeks in advance)", table_cell_bold), Paragraph("Spontaneous discovery feed filtering activities happening today or this weekend nearby", table_cell_style)],
        [Paragraph("Safety risks, harassment, fake bots, and spam", table_cell_bold), Paragraph("7-category incident reporting, JWT role enforcement, host ratings, and admin ban/suspension controls", table_cell_style)],
        [Paragraph("High platform membership fees for organizers", table_cell_bold), Paragraph("Open lightweight REST & WebSocket architecture with free instant broadcast of intent", table_cell_style)]
    ]
    p_table = Table(problem_matrix, colWidths=[200, 304])
    p_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('BACKGROUND', (0,1), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(p_table)

    story.append(Spacer(1, 15))

    # ========================================================
    # SECTION 2: TECHNOLOGY STACK & METHODOLOGY
    # ========================================================
    story.append(Paragraph("2. Technology Stack & Architectural Methodology", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER_LIGHT, spaceBefore=2, spaceAfter=10))

    story.append(Paragraph(
        "The technology stack was chosen based on three uncompromising criteria: <b>sub-second real-time responsiveness</b>, <b>geospatial calculation efficiency</b>, and <b>frictionless local deployment without cloud dependencies</b>.",
        body_style
    ))

    stack_table_data = [
        [Paragraph("<b>Tier</b>", table_header_style), Paragraph("<b>Technology</b>", table_header_style), Paragraph("<b>Engineering Justification & Methodology</b>", table_header_style)],
        [
            Paragraph("<b>Frontend Framework</b>", table_cell_bold),
            Paragraph("React 18.3 + Vite 6", table_cell_style),
            Paragraph("React's functional component paradigm and hooks provide reactive UI rendering. Vite delivers instant HMR (<100ms) and highly optimized rollup production bundles (~119 KB gzip) compared to legacy Webpack.", table_cell_style)
        ],
        [
            Paragraph("<b>Styling & Icons</b>", table_cell_bold),
            Paragraph("Tailwind CSS + Lucide Icons", table_cell_style),
            Paragraph("Utility-first styling avoids CSS specificity conflicts and provides consistent responsive design (mobile/desktop). Lucide React offers lightweight, tree-shakeable SVG icons for high visual hierarchy.", table_cell_style)
        ],
        [
            Paragraph("<b>Image Processing</b>", table_cell_bold),
            Paragraph("HTML5 Canvas Client-Side Engine", table_cell_style),
            Paragraph("Custom client-side image compression converts user device photos into bounded (400x400) JPEG data URLs (~40-80 KB), eliminating heavy third-party S3/Cloudinary upload latency and avoiding server memory bloat.", table_cell_style)
        ],
        [
            Paragraph("<b>Backend API</b>", table_cell_bold),
            Paragraph("Node.js (ESM) + Express 4.21", table_cell_style),
            Paragraph("Asynchronous non-blocking event loop handles high-concurrency I/O effortlessly. Pure ES Modules (`import/export`) align with modern JavaScript standards.", table_cell_style)
        ],
        [
            Paragraph("<b>Real-Time Layer</b>", table_cell_bold),
            Paragraph("Socket.io 4.8", table_cell_style),
            Paragraph("Bi-directional WebSocket protocol enables instantaneous group activity messaging, live typing indicators, and immediate notification dispatch without polling.", table_cell_style)
        ],
        [
            Paragraph("<b>Validation & Security</b>", table_cell_bold),
            Paragraph("Joi + Helmet + JWT + Bcryptjs", table_cell_style),
            Paragraph("Strict runtime schema validation on every API endpoint. Helmet sets secure HTTP headers. Bcrypt (10 salt rounds) guarantees one-way password hashing. Stateless JWT enables horizontal scale.", table_cell_style)
        ],
        [
            Paragraph("<b>Production Database</b>", table_cell_bold),
            Paragraph("PostgreSQL 15 + PostGIS (Supabase)", table_cell_style),
            Paragraph("PostGIS provides true spherical Earth geography indexing (`ST_DWithin`, `ST_SetSRID`, `ST_MakePoint`, GiST indexes) for accurate, sub-millisecond proximity matching.", table_cell_style)
        ],
        [
            Paragraph("<b>Fallback Database</b>", table_cell_bold),
            Paragraph("InMemoryRepository (Demo Mode)", table_cell_style),
            Paragraph("Repository Pattern fallback activates automatically when `DATABASE_URL` is omitted, allowing complete zero-setup demonstration, offline development, and instant test execution.", table_cell_style)
        ]
    ]

    s_table = Table(stack_table_data, colWidths=[90, 110, 304])
    s_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('BACKGROUND', (0,1), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(s_table)

    story.append(PageBreak())

    # ========================================================
    # SECTION 3: SYSTEM ARCHITECTURE & DATA FLOW
    # ========================================================
    story.append(Paragraph("3. System Architecture & End-to-End Data Flow", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER_LIGHT, spaceBefore=2, spaceAfter=10))

    story.append(Paragraph("<b>Architectural Layer Decomposition:</b>", h2_style))
    story.append(Paragraph(
        "NearMates follows a decoupled, <b>Layered Clean Architecture</b> separating presentation, request routing, business logic, and data persistence:",
        body_style
    ))

    arch_layers = [
        Paragraph("<b>1. Client Presentation Tier:</b> React AppLayout hosting navigation (Navbar, Sidebar, MobileNav), authenticated contexts (AuthContext, NotificationContext, SocketContext), and routed views (Discovery, Activities, Chat, Profiles, Admin Console). Located in `client/src/`.", body_style),
        Paragraph("<b>2. API Gateway & Security Tier:</b> Express application applying Helmet headers, CORS policies, Global rate limiting, Express JSON parser (10MB limit), and JWT token interception (`requireAuth`, `requireAdmin`). Located in `server/src/app.js` and `server/src/middleware/`.", body_style),
        Paragraph("<b>3. Service & Business Domain Tier:</b> Pure domain services implementing business rules: `AuthService`, `UserService`, `ActivityService`, `MatchingEngine`, `AdminService`, `ReportService`, and `NotificationService`. Located in `server/src/services/`.", body_style),
        Paragraph("<b>4. Repository & Persistence Tier:</b> Abstract `IRepository` interface with concrete implementations: `SupabaseRepository` (SQL / PostGIS) and `InMemoryRepository` (seeded in-memory collections). Bound dynamically via `RepositoryFactory`. Located in `server/src/repositories/`.", body_style)
    ]
    for layer in arch_layers:
        story.append(layer)

    story.append(Spacer(1, 8))

    # Architecture Diagram Table Box
    diagram_text = """<b>LAYERED DATA FLOW OVERVIEW:</b><br/>
[React UI Client] &lt;--- WebSocket (Socket.io) ---&gt; [SocketHandler] (Live Chat &amp; Notifications)<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|<br/>
&nbsp;&nbsp;&nbsp;&nbsp;HTTP REST (Axios)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;v&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|<br/>
[Express Router: /api/v1] ---&gt; [Security &amp; RateLimit Middleware] --&gt; [Controllers]<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;v<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[Domain Services &amp; Matching Engine]<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;v<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[Repository Factory (IRepository)]<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\\<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[Supabase PostGIS / PostgreSQL]&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[InMemory Demo Storage]"""
    diag_table = Table([[Paragraph(diagram_text, code_style)]], colWidths=[504])
    diag_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('BOX', (0,0), (-1,-1), 1, BORDER_LIGHT),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(diag_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>The Smart Matching Engine Mathematical Formulation:</b>", h2_style))
    story.append(Paragraph(
        "Located in `server/src/services/matchingEngine.js`, the matching engine ranks candidate users relative to a searching user using a multi-factor deterministic scoring algorithm:",
        body_style
    ))

    formula_text = """<b>Match Score S = W_interest * S_interest + W_proximity * S_proximity + W_availability * S_availability + W_trust * S_trust</b><br/><br/>
&bull; <b>Interest Overlap (W = 45%):</b> Jaccard similarity between candidate and user interests: <i>S_interest = |I_user &cap; I_candidate| / |I_user &cup; I_candidate|</i><br/>
&bull; <b>Proximity Gradient (W = 35%):</b> Linear decay over search radius R: <i>S_proximity = max(0, 1 - (Distance_km / Radius_km))</i><br/>
&bull; <b>Availability Status (W = 10%):</b> 1.0 if status is 'available', 0.2 if 'busy', 0.0 if 'offline'<br/>
&bull; <b>Community Trust Rating (W = 10%):</b> Star rating normalized: <i>S_trust = (Rating / 5.0)</i>"""
    formula_table = Table([[Paragraph(formula_text, body_style)]], colWidths=[504])
    formula_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F0FDF4")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#BBF7D0")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(formula_table)

    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>End-to-End Functional Flows:</b>", h2_style))
    story.append(Paragraph("• <b>User Onboarding & Profile Photo Flow:</b> User uploads device photo &rarr; `imageUtils.js` creates a compressed 400x400 JPEG data URL &rarr; Transmitted via `POST /api/auth/register` &rarr; Stored in `profiles.avatar_url` &rarr; JWT token returned with profile payload &rarr; Rendered throughout Navbar, Discovery cards, and Profile view.", bullet_style))
    story.append(Paragraph("• <b>Activity Coordination Flow:</b> Host broadcasts intent with category, location, and capacity (`POST /api/activities`) &rarr; Nearby users discover activity via geospatial index &rarr; Prospective attendee submits RSVP (`POST /api/activities/:id/join`) &rarr; Host receives instant notification &rarr; Host approves participant &rarr; Socket.io group room instantiated for attendees.", bullet_style))
    story.append(Paragraph("• <b>Safety Incident & Moderation Flow:</b> User flags abuse (`POST /api/reports`) &rarr; Moderation queue updates in `AdminDashboardPage.jsx` &rarr; Admin inspects evidence &rarr; Admin executes decision (warn, suspend, ban, or remove activity) &rarr; Offender's account status updated and subsequent login/requests rejected with 403.", bullet_style))

    story.append(PageBreak())

    # ========================================================
    # SECTION 4: CHALLENGES, BUGS & RESOLUTIONS
    # ========================================================
    story.append(Paragraph("4. Technical Challenges Faced & Engineering Solutions", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER_LIGHT, spaceBefore=2, spaceAfter=10))

    challenges = [
        (
            "1. High-Resolution Mobile Image Upload Bottlenecks & Memory Bloat",
            "Modern smartphone cameras produce 8MB-18MB JPEG/HEIC photos. Uploading raw files over mobile connections caused HTTP 413 Payload Too Large errors, slow network transfer, and server memory pressure.",
            "Engineered `client/src/utils/imageUtils.js` using the HTML5 Canvas API. The file is read locally via `FileReader`, rendered onto an in-memory canvas scaled to a maximum bounding box of 400x400 pixels while preserving aspect ratio, and exported as a high-quality (85%) JPEG data URL. This reduced payload sizes by 98% (down to ~50-80 KB) with zero noticeable loss in avatar clarity, allowing instantaneous uploads without third-party storage costs."
        ),
        (
            "2. Zero-Config Environment Deployment vs. Production PostGIS Requirements",
            "Setting up local PostgreSQL with PostGIS extensions (`postgis`, `pgcrypto`, `uuid-ossp`) creates significant friction for collaborators and evaluation environments without live Supabase credentials.",
            "Implemented the <b>Repository Factory Pattern</b> (`server/src/repositories/repositoryFactory.js`). If `DATABASE_URL` is omitted, NearMates seamlessly initializes an `InMemoryRepository` pre-populated with deterministic seed data (`server/seeds/demoData.js`), Haversine spherical distance calculation, and full feature fidelity (matching engine, chat, admin moderation, and reports). All unit tests pass in both environments."
        ),
        (
            "3. Stateful WebSocket Synchronization with Asynchronous REST API Events",
            "Activity approvals and moderation bans executed over HTTP REST needed to reflect immediately in open user chat rooms and notification badges without requiring browser refreshes.",
            "Unified the HTTP and WebSocket layers in `server/src/server.js` by binding Socket.io to the underlying Node HTTP server and dispatching real-time events (`request_approved`, `activity_cancelled`, `account_suspended`) directly to the target recipient's socket room upon database commit."
        ),
        (
            "4. Granular Account Status & Privilege Enforcement",
            "Banning or suspending an account needed to take effect immediately, intercepting both future login attempts and currently active JWT sessions, while distinguishing between permanent bans and temporary suspensions.",
            "Updated the database schema to include `status` (`active`, `suspended`, `banned`), `ban_reason`, `suspended_until`, and `suspension_reason`. Updated `authService.js` to reject login attempts with detailed reasons, and updated `authMiddleware.js` to check user status on every authenticated request, returning `403 Forbidden` and terminating active sessions instantly."
        ),
        (
            "5. Joi URI Scheme Rejection of Data URLs",
            "Initially, profile validation schemas used `Joi.string().uri()`, which strictly permitted `http`/`https` protocols and rejected base64 data URLs (`data:image/jpeg;base64,...`), causing registration to fail when users uploaded local photos.",
            "Refactored `server/src/validators/schemaValidators.js` to accept clean string payloads (`Joi.string().allow('', null)`) across `registerSchema` and `updateProfileSchema`, enabling seamless support for both hosted HTTP URLs and optimized data URLs."
        )
    ]

    for title, problem, solution in challenges:
        story.append(Paragraph(f"<b>{title}</b>", h2_style))
        story.append(Paragraph(f"<b>Problem:</b> {problem}", body_style))
        story.append(Paragraph(f"<b>Resolution:</b> {solution}", body_style))
        story.append(Spacer(1, 4))

    story.append(PageBreak())

    # ========================================================
    # SECTION 5: LIMITATIONS & FUTURE SCOPE
    # ========================================================
    story.append(Paragraph("5. Key Limitations & Future Strategic Scope", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER_LIGHT, spaceBefore=2, spaceAfter=10))

    story.append(Paragraph("<b>Current System Limitations:</b>", h2_style))
    story.append(Paragraph("• <b>In-Memory Persistence Volatility:</b> When deployed in demo fallback mode without a configured PostgreSQL instance, changes (new users, reports, activities) are stored in server RAM and reset upon server restart.", bullet_style))
    story.append(Paragraph("• <b>Web-Responsive vs. Native Mobile OS:</b> The client is currently an optimized Progressive Web Application (PWA) running in mobile browsers rather than a native compiled iOS/Android binary with background push wakeups.", bullet_style))
    story.append(Paragraph("• <b>Client-Side Geolocation Dependency:</b> User coordinates depend on the browser's `navigator.geolocation` API permission or manual location text entry.", bullet_style))
    story.append(Paragraph("• <b>Manual Financial Settlement:</b> While activities support estimated cost parameters (e.g., $15 court fee), payments are settled off-platform via cash or peer-to-peer apps.", bullet_style))

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>Future Scope & Strategic Roadmap:</b>", h2_style))

    roadmap_data = [
        [Paragraph("<b>Phase</b>", table_header_style), Paragraph("<b>Strategic Feature</b>", table_header_style), Paragraph("<b>Architectural Implementation Plan</b>", table_header_style)],
        [
            Paragraph("<b>Phase 1 (Q1)</b>", table_cell_bold),
            Paragraph("AI-Powered Smart Activity Suggestions", table_cell_style),
            Paragraph("Integrate vector embeddings (Gemini Embedding API / pgvector) on user bios and activity descriptions to suggest uncanny interest matches beyond exact keyword taxonomy.", table_cell_style)
        ],
        [
            Paragraph("<b>Phase 2 (Q2)</b>", table_cell_bold),
            Paragraph("Integrated In-App Escrow & Expense Split", table_cell_style),
            Paragraph("Stripe Connect integration allowing organizers to split venue booking costs (e.g. synthetic badminton court or escape room fees) with automated participant refunds on cancellation.", table_cell_style)
        ],
        [
            Paragraph("<b>Phase 3 (Q3)</b>", table_cell_bold),
            Paragraph("Native Mobile Applications", table_cell_style),
            Paragraph("Port presentation components to React Native / Expo to support native push notifications (APNs / FCM), background geolocation tracking, and biometric login (FaceID / TouchID).", table_cell_style)
        ],
        [
            Paragraph("<b>Phase 4 (Q4)</b>", table_cell_bold),
            Paragraph("Automated AI Content Moderation", table_cell_style),
            Paragraph("Pre-submission image moderation using Vision AI to automatically detect explicit photos and NLP toxicity filtering on chat messages before human moderator escalation.", table_cell_style)
        ]
    ]

    r_table = Table(roadmap_data, colWidths=[90, 130, 284])
    r_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), TEAL),
        ('BACKGROUND', (0,1), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(r_table)

    story.append(PageBreak())

    # ========================================================
    # SECTION 6: CODEBASE MAP & IMPLEMENTATION WALKTHROUGH
    # ========================================================
    story.append(Paragraph("6. Codebase Location Map & Implementation Walkthrough", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER_LIGHT, spaceBefore=2, spaceAfter=10))

    story.append(Paragraph(
        "Below is the exact file-by-file structural mapping of NearMates, identifying where each capability is implemented across the client and server repositories:",
        body_style
    ))

    codemap_data = [
        [Paragraph("<b>Component / Feature</b>", table_header_style), Paragraph("<b>File Location in Repository</b>", table_header_style), Paragraph("<b>Key Responsibilities & Functions</b>", table_header_style)],
        [
            Paragraph("<b>Sign Up & Photo Upload</b>", table_cell_bold),
            Paragraph("`client/src/pages/auth/RegisterPage.jsx`", table_cell_style),
            Paragraph("Avatar preview circle, file picker integration, geolocation detection, input validation, calls AuthContext.register.", table_cell_style)
        ],
        [
            Paragraph("<b>Canvas Image Optimizer</b>", table_cell_bold),
            Paragraph("`client/src/utils/imageUtils.js`", table_cell_style),
            Paragraph("`processImageFile()`: Resizes image files to max 400x400 on an HTML5 canvas and converts to lightweight JPEG data URL.", table_cell_style)
        ],
        [
            Paragraph("<b>Admin Console UI</b>", table_cell_bold),
            Paragraph("`client/src/pages/admin/AdminDashboardPage.jsx`", table_cell_style),
            Paragraph("4 sections: Overview metrics, User Management (ban/suspend/warn), Activity Roster & removal, Incident Investigation & report resolution.", table_cell_style)
        ],
        [
            Paragraph("<b>Universal Report Modal</b>", table_cell_bold),
            Paragraph("`client/src/components/common/ReportModal.jsx`", table_cell_style),
            Paragraph("Multi-category report modal (fake profile, harassment, spam, photo, activity, message) with evidence input.", table_cell_style)
        ],
        [
            Paragraph("<b>Profile & Discovery Views</b>", table_cell_bold),
            Paragraph("`client/src/pages/profile/ProfilePage.jsx`<br/>`client/src/pages/dashboard/DashboardPage.jsx`", table_cell_style),
            Paragraph("Renders user avatar, rating, review history, status toggle (available/busy/offline), and 'Report Member' action.", table_cell_style)
        ],
        [
            Paragraph("<b>Activity Management View</b>", table_cell_bold),
            Paragraph("`client/src/pages/activities/ActivityDetailsPage.jsx`", table_cell_style),
            Paragraph("Activity details, host info, RSVP workflow, participant roster, Report Activity button, and admin moderation toolbar.", table_cell_style)
        ],
        [
            Paragraph("<b>Real-Time Chat View</b>", table_cell_bold),
            Paragraph("`client/src/pages/chat/ChatPage.jsx`", table_cell_style),
            Paragraph("Direct and group chat messaging via Socket.io, typing indicators, message log, and partner report button.", table_cell_style)
        ],
        [
            Paragraph("<b>Auth Service & Status Guard</b>", table_cell_bold),
            Paragraph("`server/src/services/authService.js`<br/>`server/src/middleware/authMiddleware.js`", table_cell_style),
            Paragraph("Bcrypt password verification, JWT generation, and interception of banned/suspended accounts returning 403 Forbidden.", table_cell_style)
        ],
        [
            Paragraph("<b>Admin Operations Service</b>", table_cell_bold),
            Paragraph("`server/src/services/adminService.js`<br/>`server/src/controllers/adminController.js`", table_cell_style),
            Paragraph("Orchestrates user bans, suspensions, warnings, activity removal, and 7-step report investigation resolution.", table_cell_style)
        ],
        [
            Paragraph("<b>User Report Endpoints</b>", table_cell_bold),
            Paragraph("`server/src/routes/reportRoutes.js`<br/>`server/src/controllers/reportController.js`", table_cell_style),
            Paragraph("Public reporting routes mounted at `/api/reports` allowing authenticated members to report violations.", table_cell_style)
        ],
        [
            Paragraph("<b>Smart Matching Engine</b>", table_cell_bold),
            Paragraph("`server/src/services/matchingEngine.js`", table_cell_style),
            Paragraph("Deterministic multi-variable algorithm ranking nearby candidates based on interest overlap, proximity, availability, and rating.", table_cell_style)
        ],
        [
            Paragraph("<b>In-Memory Fallback Engine</b>", table_cell_bold),
            Paragraph("`server/src/repositories/inMemoryRepository.js`", table_cell_style),
            Paragraph("Full demo repository replica storing users, activities, memberships, reports, metrics, and Haversine distance calculations.", table_cell_style)
        ],
        [
            Paragraph("<b>Production PostGIS Schema</b>", table_cell_bold),
            Paragraph("`server/database/schema.sql`<br/>`server/src/repositories/supabaseRepository.js`", table_cell_style),
            Paragraph("DDL defining users (with status, ban_reason, suspended_until), activities (with removed status), and reports with PostGIS indexing.", table_cell_style)
        ],
        [
            Paragraph("<b>Automated Test Suites</b>", table_cell_bold),
            Paragraph("`server/tests/auth.test.js`<br/>`server/tests/admin.test.js`", table_cell_style),
            Paragraph("Automated verification of login, registration with custom avatar, admin metrics, account suspension, bans, and report resolution.", table_cell_style)
        ]
    ]

    c_table = Table(codemap_data, colWidths=[110, 160, 234])
    c_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('BACKGROUND', (0,1), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(c_table)

    # Build the document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Documentation successfully generated at: {output_filename}")

if __name__ == '__main__':
    target = os.path.join(os.path.dirname(__file__), "NearMates_Complete_Project_Documentation.pdf")
    create_project_pdf(target)
