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
        self.drawString(54, letter[1] - 36, "NearMates — 10-Minute Complete Video Demonstration Script & Presentation Guide")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)

        # Running Footer
        self.line(54, 45, letter[0] - 54, 45)
        self.setFont("Helvetica", 8)
        self.drawString(54, 32, "Confidential & Practical Evaluation Guide — NearMates Engineering")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 54, 32, page_text)
        self.restoreState()

def create_video_script_pdf(output_filename):
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
    BG_LIGHT = colors.HexColor("#F8FAFC")    # Cool Slate 50
    BG_CARD = colors.HexColor("#F1F5F9")     # Slate 100
    BORDER_LIGHT = colors.HexColor("#CBD5E1")# Border slate

    # Custom Typography Styles
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
        fontSize=15,
        leading=20,
        textColor=NAVY,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=PRIMARY,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'Heading3_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=TEAL,
        spaceBefore=6,
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

    narration_style = ParagraphStyle(
        'Narration_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13.5,
        textColor=NAVY,
        spaceAfter=4
    )

    action_style = ParagraphStyle(
        'Action_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=PRIMARY,
        spaceAfter=3
    )

    tech_note_style = ParagraphStyle(
        'TechNote_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=TEXT_MUTED,
        spaceAfter=3
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

    def build_segment_table(time_range, duration, title, screen_actions, narration, tech_takeaways):
        header_p = Paragraph(f"<b>SEGMENT: {time_range} ({duration}) — {title.upper()}</b>", table_header_style)
        
        # Row 1: Header
        # Row 2: Screen Actions
        # Row 3: Spoken Narration (Word-for-Word)
        # Row 4: Engineering Defense / Key Takeaway
        
        actions_p = [
            Paragraph("<b>VISUAL & SCREEN ACTIONS (What the viewer sees):</b>", action_style),
            Paragraph(screen_actions, body_style)
        ]
        
        narration_p = [
            Paragraph("<b>SPOKEN NARRATION (Exact Word-for-Word Script):</b>", ParagraphStyle('NarTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5, leading=12, textColor=NAVY, spaceAfter=3)),
            Paragraph(narration, narration_style)
        ]
        
        takeaways_p = [
            Paragraph("<b>TECHNICAL ARCHITECTURE TALKING POINTS:</b>", ParagraphStyle('TechTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5, leading=12, textColor=TEAL, spaceAfter=3)),
            Paragraph(tech_takeaways, tech_note_style)
        ]

        t = Table([
            [header_p],
            [actions_p],
            [narration_p],
            [takeaways_p]
        ], colWidths=[504])

        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,0), NAVY),
            ('BACKGROUND', (0,1), (0,1), BG_LIGHT),
            ('BACKGROUND', (0,2), (0,2), colors.white),
            ('BACKGROUND', (0,3), (0,3), BG_CARD),
            ('BOX', (0,0), (-1,-1), 1, BORDER_LIGHT),
            ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        return t

    story = []

    # =========================================================================
    # COVER / HEADER BLOCK
    # =========================================================================
    story.append(Paragraph("NearMates — Comprehensive Demonstration Blueprint", subtitle_style))
    story.append(Paragraph("10-Minute Video Script & Presentation Guide", title_style))
    story.append(Paragraph("A Second-by-Second Production Script, Visual Choreography, Spoken Commentary & Technical Defense", ParagraphStyle('CoverDesc', parent=styles['Normal'], fontName='Helvetica', fontSize=10, leading=14, textColor=TEXT_MUTED, spaceAfter=15)))
    story.append(HRFlowable(width="100%", thickness=2, color=PRIMARY, spaceAfter=15))

    # Metadata Grid
    meta_data = [
        [
            Paragraph("<b>Total Video Duration:</b> 10 Minutes (600s)", table_cell_bold),
            Paragraph("<b>Production Format:</b> Live Screen Recording + PiP Camera", table_cell_bold)
        ],
        [
            Paragraph("<b>Project Version:</b> v2.4 (React 18 + Express + PostGIS)", table_cell_bold),
            Paragraph("<b>Demo Roles:</b> User A (Alex), User B (Priya), Admin Moderator", table_cell_bold)
        ],
        [
            Paragraph("<b>Primary Target Audience:</b> Technical Evaluators, Recruiters, Judges", table_cell_bold),
            Paragraph("<b>Resolution & FPS:</b> 1080p 60fps (Recommended Audio: Crisp USB Mic)", table_cell_bold)
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
    story.append(Spacer(1, 15))

    # Executive Overview
    story.append(create_callout_box(
        "HOW TO EXECUTE A WINNING 10-MINUTE TECHNICAL DEMONSTRATION",
        "A successful live project presentation does not simply click through forms; it tells a compelling human story, solves a palpable problem, and transparently proves robust full-stack software engineering. This script is engineered with exact second-by-second pacing, synchronized screen choreography, and precise verbal cues. Follow the 8 structured segments below to demonstrate seamless user registration, client-side Canvas optimization, PostGIS proximity queries, real-time WebSocket messaging, and the multi-tier Admin moderation console.",
        border_color=PRIMARY,
        bg_color=BG_LIGHT
    ))
    story.append(Spacer(1, 12))

    # Pre-demo Staging Checklist
    story.append(Paragraph("1. Pre-Demonstration Environment Setup Checklist", h1_style))
    checklist_data = [
        [Paragraph("Component", table_header_style), Paragraph("Preparation Instruction", table_header_style), Paragraph("Status", table_header_style)],
        [
            Paragraph("<b>Backend Server</b>", table_cell_bold),
            Paragraph("Run <code>cd server && npm run dev</code>. Ensure terminal outputs <i>'Server listening on port 5000'</i> and database driver reports connected.", table_cell_style),
            Paragraph("<b>Verified</b>", table_cell_bold)
        ],
        [
            Paragraph("<b>Client Frontend</b>", table_cell_bold),
            Paragraph("Run <code>cd client && npm run dev</code>. Verify Vite dev server opens at <code>http://localhost:5173</code> without console errors.", table_cell_style),
            Paragraph("<b>Verified</b>", table_cell_bold)
        ],
        [
            Paragraph("<b>Browser Windows</b>", table_cell_bold),
            Paragraph("Open 2 side-by-side Chrome windows:<br/>• Window Left (50% screen): Chrome Normal Profile (Alex Rivera)<br/>• Window Right (50% screen): Chrome Incognito Window (Priya Sharma)<br/>• Have an extra tab ready for Admin Dashboard (<code>admin@nearmates.local</code>).", table_cell_style),
            Paragraph("<b>Configured</b>", table_cell_bold)
        ],
        [
            Paragraph("<b>Demo Media Assets</b>", table_cell_bold),
            Paragraph("Place a high-resolution sample profile photo (~5MB JPEG/PNG) on the Desktop for instant drag-and-drop into the registration avatar uploader.", table_cell_style),
            Paragraph("<b>Ready</b>", table_cell_bold)
        ],
        [
            Paragraph("<b>Database State</b>", table_cell_bold),
            Paragraph("Ensure clean demo seeds are loaded with 5+ initial activities and mock nearby users in Central Park / Manhattan coordinate space.", table_cell_style),
            Paragraph("<b>Seeded</b>", table_cell_bold)
        ]
    ]
    t_check = Table(checklist_data, colWidths=[100, 334, 70])
    t_check.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('BACKGROUND', (0,1), (-1,-1), colors.white),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('BOX', (0,0), (-1,-1), 1, BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_check)
    story.append(Spacer(1, 14))

    # =========================================================================
    # MINUTE-BY-MINUTE SCRIPT BREAKDOWN
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("2. Minute-by-Minute Demonstration Script (00:00 – 10:00)", h1_style))
    story.append(Paragraph("Follow each segment strictly according to its timestamp. If a step finishes early, pause on the visual UI rather than rushing ahead.", body_style))
    story.append(Spacer(1, 8))

    # Segment 1
    s1_actions = (
        "• Camera begins with speaker PiP (bottom-right corner) and full-screen browser showing NearMates hero landing page.<br/>"
        "• Mouse hovers smoothly over the headline: 'Find your crew. Do things together. Right now.'<br/>"
        "• Scroll down to show feature highlights: Proximity Radar, Spontaneous Activities, and Verified Safety.<br/>"
        "• At 00:45, click the primary 'Get Started' button navigating directly to the Registration page."
    )
    s1_narrative = (
        "\"Hello everyone, and welcome! Today I am thrilled to present NearMates — a full-stack, hyper-local activity discovery "
        "and companion-matching web application.<br/><br/>"
        "Have you ever wanted to play a pickup game of badminton, try a new coffee shop, or go for an evening run, but found yourself "
        "without a partner? Traditional social networks are broadcast-heavy and disconnected from physical proximity, while dating apps "
        "impose awkward romantic pressure. Scheduling through messaging groups takes days of tedious back-and-forth.<br/><br/>"
        "NearMates solves this real-world friction by connecting nearby individuals around spontaneous real-world activities within minutes, "
        "powered by PostGIS spatial indexing, zero-latency client-side optimizations, and a robust community moderation framework. "
        "Let's dive into the live application!\""
    )
    s1_tech = (
        "• Problem Domain: Friction of spontaneous, interest-aligned, hyper-local social meetup coordination.<br/>"
        "• Core Value Proposition: Zero-friction activity discovery, dynamic spatial filtering, and community safety enforcement."
    )
    story.append(build_segment_table("00:00 – 01:00", "60 Seconds", "The Hook, Problem Statement & Platform Vision", s1_actions, s1_narrative, s1_tech))
    story.append(Spacer(1, 12))

    # Segment 2
    s2_actions = (
        "• Show the Registration form: enter Name: 'Alex Rivera', Email: 'alex.rivera@example.com', Password: '••••••••'.<br/>"
        "• Drag and drop a high-resolution 6.4 MB camera JPEG into the circular profile avatar dropzone.<br/>"
        "• Briefly toggle Chrome DevTools Network Tab / Console: highlight that client-side HTML5 Canvas compression immediately reduced the image to ~38 KB (<100ms) with zero server payload bloat.<br/>"
        "• Click 'Create Account'. Onboarding opens: Alex selects interests ['Badminton', 'Running', 'Coffee & Conversations'], sets radius slider to 15 km, clicks 'Finish Profile'."
    )
    s2_narrative = (
        "\"We start with onboarding. Notice our new profile photo uploader right here on the sign-up form. "
        "Instead of burdening the backend with bulky multi-megabyte image processing pipelines or paying for third-party cloud transform APIs, "
        "NearMates features a custom client-side HTML5 Canvas compression utility. "
        "When I drop this 6.4 megabyte DSLR photo, our engine renders it onto an off-screen Canvas context, constrains it to 512-by-512 pixels, "
        "and compresses it to an optimized JPEG data URI in under 100 milliseconds right in the user's browser.<br/><br/>"
        "Now I select Alex's passions — Badminton, Running, and Coffee — and define a 15-kilometer discovery radius. "
        "Alex's account is verified, assigned a secure stateless JWT token, and initialized in the database with geospatial coordinates.\""
    )
    s2_tech = (
        "• Client Optimization: <code>imageUtils.js</code> HTML5 Canvas 2D context compression (max 512px, 0.82 quality factor).<br/>"
        "• Security: MIME validation, Base64 Data URI sanitization, zero server CPU overhead during image ingestion."
    )
    story.append(build_segment_table("01:00 – 02:15", "75 Seconds", "User Registration, Avatar Compression & Onboarding", s2_actions, s2_narrative, s2_tech))
    story.append(Spacer(1, 12))

    # Segment 3
    s3_actions = (
        "• Alex lands on the primary Discovery Dashboard.<br/>"
        "• Show the interactive Proximity Radar and activity card grid. Move the radius slider from 5 km to 25 km: cards animate smoothly as the query radius expands.<br/>"
        "• Click on the Category filter: toggle 'Sports & Fitness' and 'Social'.<br/>"
        "• Click on 'Near Mates (People)' tab: demonstrate nearby users with shared interest match badges (e.g. '85% Match - 3 Common Interests', '1.2 km away')."
    )
    s3_narrative = (
        "\"Alex is now on the Discovery Dashboard. Notice the real-time proximity radar. "
        "As I slide the discovery radius from 5 kilometers to 25 kilometers, the dashboard dynamically queries the backend. "
        "Behind the scenes, PostgreSQL and PostGIS evaluate spherical geography using the <code>ST_DWithin</code> function against a spatial GIST index, "
        "returning results in under 20 milliseconds.<br/><br/>"
        "Notice the intelligent match badges on user cards. Our matching algorithm computes the Jaccard similarity coefficient across shared interest taxonomies, "
        "weighed against physical geodesic distance. Here we see Priya Sharma: 85% interest match, only 1.2 kilometers away, with badminton and coffee in common!\""
    )
    s3_tech = (
        "• Spatial Queries: PostGIS <code>ST_DWithin(location_point, ST_MakePoint(lon, lat)::geography, radius_meters)</code>.<br/>"
        "• Performance: Spatial GIST index (<code>idx_profiles_location</code>) guarantees sub-30ms execution even under tens of thousands of coordinates."
    )
    story.append(build_segment_table("02:15 – 03:45", "90 Seconds", "Interactive Proximity Discovery & Intelligent Matching", s3_actions, s3_narrative, s3_tech))
    story.append(Spacer(1, 12))

    # Segment 4
    story.append(PageBreak())
    s4_actions = (
        "• In Alex's window (Left), click '+ Create Activity'.<br/>"
        "• Fill form: Title: 'Sunset Badminton at Central Park', Category: 'Sports & Fitness', Max Participants: '4', Start Time: Today 6:00 PM. Click 'Publish Activity'.<br/>"
        "• Switch immediately to Window Right (Priya Sharma, logged in).<br/>"
        "• Priya refreshes or receives notification: Alex's activity appears prominently at the top with a 'New' badge.<br/>"
        "• Priya clicks 'Join Activity'. Button updates immediately to 'Joined' with confirmed status badge."
    )
    s4_narrative = (
        "\"Now, let's create a spontaneous activity. Alex wants to play badminton this evening. He clicks 'Create Activity', "
        "enters 'Sunset Badminton at Central Park', caps participants at 4, sets the location, and publishes.<br/><br/>"
        "Look at the right window — this is Priya Sharma browsing nearby. Within seconds, Alex's activity is rendered directly in Priya's feed. "
        "Priya clicks 'Join Activity'. The backend executes an atomic transaction: it verifies slot availability, registers Priya's participation, "
        "and locks the slot count to avoid race conditions. In just three clicks, an in-person meetup is scheduled!\""
    )
    s4_tech = (
        "• Concurrency & Integrity: Atomic slot decrement and duplicate join prevention via PostgreSQL composite primary keys and row-level validation.<br/>"
        "• State Machine: Participant status progresses through <code>pending -> confirmed -> completed/left</code>."
    )
    story.append(build_segment_table("03:45 – 05:15", "90 Seconds", "Spontaneous Activity Creation & Dual Participation", s4_actions, s4_narrative, s4_tech))
    story.append(Spacer(1, 12))

    # Segment 5
    s5_actions = (
        "• In both windows side-by-side, open the Activity Details page for 'Sunset Badminton'.<br/>"
        "• Alex types in Chat: 'Hey Priya, bring an extra racket if you have one!'. Press Enter.<br/>"
        "• Priya's screen instantly shows Alex's message with avatar and timestamp (<50ms). Priya replies: 'Got it, see you at 6!'.<br/>"
        "• Now showcase community safety: Priya notices an unverified user profile or spam activity. Priya clicks the 'Report' flag icon on the post.<br/>"
        "• Report Modal pops up with 7 categories. Priya selects 'Suspicious Activity or Fraud', writes note: 'Promoting external crypto link', clicks Submit. Success toast appears."
    )
    s5_narrative = (
        "\"Coordination happens seamlessly through NearMates real-time messaging. When Alex sends a message asking Priya to bring an extra racket, "
        "Socket.io delivers the payload to the room subscribers with sub-50ms latency, while persisting chat history to PostgreSQL.<br/><br/>"
        "Now let's highlight platform safety — a paramount concern for local community apps. Notice this red 'Report' flag icon. "
        "Whether a user encounters harassment, fake profiles, inappropriate profile pictures, spam, or suspicious activity, "
        "our standardized Report Modal allows them to flag violations in three seconds with detailed context. "
        "Priya files a report on a spam activity. Let's see what happens next on the admin side.\""
    )
    s5_tech = (
        "• WebSockets: Socket.io room multiplexing keyed by <code>activity_id</code> with JWT handshake validation.<br/>"
        "• Moderation Ingestion: Normalized <code>reports</code> schema recording reporter ID, reported entity, violation taxonomy, and audit metadata."
    )
    story.append(build_segment_table("05:15 – 06:45", "90 Seconds", "Real-Time Coordination & Safety Reporting Workflow", s5_actions, s5_narrative, s5_tech))
    story.append(Spacer(1, 12))

    # Segment 6
    s6_actions = (
        "• Open third browser window: log in as <code>admin@nearmates.local</code>. Navigate to <code>/admin</code>.<br/>"
        "• Section A (Overview): Point to live counter cards (Total Users, DAU/WAU/MAU, Activities, Banned Accounts).<br/>"
        "• Section B (User Management): Filter user list, inspect a spam user, click 'Ban Account' with mandatory reason modal. User status immediately flips to 'Banned'.<br/>"
        "• Section C (Activity Management): Filter by category/location, inspect participants, click 'Cancel Fraudulent Activity'.<br/>"
        "• Section D (Reports & Moderation): Priya's newly filed report is right at the top. Click 'Investigate'. Admin reviews evidence, logs moderation decision, and resolves report."
    )
    s6_narrative = (
        "\"Welcome to the NearMates Admin Operations Console. This is an enterprise-grade moderation headquarters designed for full community oversight.<br/><br/>"
        "In Section A, we have the real-time operational overview: registered users, active user velocity across daily, weekly, and monthly intervals, "
        "total activities created, and suspended accounts.<br/><br/>"
        "In Section B, User Management lets admins inspect any account, review warning histories, and permanently ban bad actors with mandatory documented reasons.<br/><br/>"
        "In Section C, Activity Management gives full visibility across all local meetups, enabling administrators to cancel fraudulent or unsafe gatherings instantly.<br/><br/>"
        "And in Section D, Reports & Moderation displays our triage queue. Here is the report Priya just filed. The admin can review evidence, "
        "issue formal warnings, dismiss invalid claims, or ban the account — with every decision immutably recorded in the moderation audit trail!\""
    )
    s6_tech = (
        "• RBAC Security: <code>authenticateToken</code> and <code>requireAdmin</code> middleware protect all <code>/api/admin</code> endpoints.<br/>"
        "• Auditability: Comprehensive audit logging in <code>audit_logs</code> capturing timestamp, admin ID, target entity, and decision notes."
    )
    story.append(build_segment_table("06:45 – 08:15", "90 Seconds", "Comprehensive Admin Console & Moderation Engine", s6_actions, s6_narrative, s6_tech))
    story.append(Spacer(1, 12))

    # Segment 7
    story.append(PageBreak())
    s7_actions = (
        "• Switch screen to VS Code and architecture diagram slide.<br/>"
        "• Show folder structure: Clean Layered Architecture (Routes -> Controllers -> Services -> Repositories -> Database).<br/>"
        "• Show <code>inMemoryRepository.js</code> and <code>supabaseRepository.js</code> side-by-side: explain the dual-storage driver.<br/>"
        "• Open integrated terminal, run <code>npm test --prefix server</code>: all 9 unit tests pass in 1.4 seconds with green checkmarks."
    )
    s7_narrative = (
        "\"Let's pull back the curtain and examine the technical architecture that makes NearMates so reliable and fast. "
        "We engineered NearMates following Clean Layered Architecture principles. HTTP routing, business logic orchestration, "
        "and data persistence are strictly isolated into Routes, Controllers, Services, and Repositories.<br/><br/>"
        "One of our proudest architectural innovations is our Dual-Storage Repository Pattern. NearMates seamlessly binds to Supabase PostgreSQL "
        "with native PostGIS in production, but features an identical In-Memory Geodesic Repository utilizing the Haversine formula for automated test runners, "
        "CI/CD pipelines, and zero-dependency local evaluations. As you can see in the terminal, our entire test suite executes in under two seconds "
        "without needing external database containers!\""
    )
    s7_tech = (
        "• Architecture: Decoupled 4-tier layered architecture with Dependency Inversion.<br/>"
        "• Dual Storage: Dynamic driver selection (<code>supabaseRepository.js</code> vs <code>inMemoryRepository.js</code>) via <code>repositoryFactory.js</code>."
    )
    story.append(build_segment_table("08:15 – 09:15", "60 Seconds", "Technical Architecture, PostGIS & Dual-Engine Fallback", s7_actions, s7_narrative, s7_tech))
    story.append(Spacer(1, 12))

    # Segment 8
    s8_actions = (
        "• Switch screen to Future Roadmap slide featuring Mobile App mockups (React Native), AI Matching Engine, and E2E Encrypted Chat.<br/>"
        "• Switch camera back to fullscreen speaker view.<br/>"
        "• Display GitHub repository URL and contact information."
    )
    s8_narrative = (
        "\"Looking toward the future, our engineering roadmap includes: first, native mobile apps using React Native with background geofencing alerts; "
        "second, integrating AI-driven personality compatibility matching powered by Groq and Gemini LLMs; "
        "and third, implementing end-to-end encrypted messaging via the Signal Protocol for private chats.<br/><br/>"
        "In conclusion, NearMates bridges digital convenience with real-world human connection — built with modern full-stack performance, "
        "PostGIS geospatial intelligence, and rigorous administrative safety. "
        "Thank you so much for your time, and I am now ready to answer any questions!\""
    )
    s8_tech = (
        "• Extensibility: Modular REST & WebSocket contracts allow drop-in mobile client integration.<br/>"
        "• Roadmap: AI LLM synthesis, Signal Protocol E2EE, Geofenced Push Notifications."
    )
    story.append(build_segment_table("09:15 – 10:00", "45 Seconds", "Future Roadmap, Production Readiness & Conclusion", s8_actions, s8_narrative, s8_tech))
    story.append(Spacer(1, 14))

    # =========================================================================
    # ANTICIPATED Q&A DEFENSE SECTION
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("3. Technical Evaluation Q&A Defense (10 High-Yield Answers)", h1_style))
    story.append(Paragraph("Be prepared to answer these exact technical and architectural questions during an evaluation, demo defense, or interview:", body_style))
    story.append(Spacer(1, 6))

    qa_list = [
        (
            "Q1: Why did you implement client-side canvas compression instead of relying on server-side Multer/Sharp?",
            "<b>Answer:</b> Performing image compression on the client (<code>imageUtils.js</code>) using HTML5 Canvas eliminates server CPU bottlenecks and drastically cuts bandwidth costs. High-resolution phone cameras produce 5MB to 12MB photos. Processing dozens of concurrent uploads with Sharp on a Node.js event-loop can cause thread starvation. By resizing to 512x512 with 0.82 JPEG quality in the user's browser, we transmit only ~35KB over the wire (<1% of original size), achieving instantaneous preview and zero server transcoding overhead."
        ),
        (
            "Q2: How does NearMates handle spatial queries efficiently when the user database scales?",
            "<b>Answer:</b> In PostgreSQL, standard B-Tree indexes cannot index two-dimensional coordinates. We leverage PostGIS with a GIST (Generalized Search Tree) spatial index on <code>location_point GEOGRAPHY(Point, 4326)</code>. The <code>ST_DWithin</code> function uses spatial bounding-box pruning to discard points outside the search radius before computing exact geodesic distances on the WGS 84 ellipsoid, maintaining sub-30ms execution even across millions of rows."
        ),
        (
            "Q3: What happens if the Supabase database connection goes down or pool exhaustion occurs?",
            "<b>Answer:</b> We implemented a Repository Factory pattern. The service layer interacts with a generic repository interface. In development or test environments, or when <code>DATABASE_URL</code> is absent, NearMates automatically initializes our In-Memory Geodesic Repository with zero configuration. For production, connection pooling via Supavisor (Port 6543) prevents socket exhaustion under traffic spikes."
        ),
        (
            "Q4: How do you prevent race conditions when two users join the last available activity spot simultaneously?",
            "<b>Answer:</b> We enforce database-level concurrency control. When a user requests to join, the operation runs within an atomic transaction checking <code>COUNT(participants) < max_participants</code> with row-level locks (<code>FOR UPDATE</code>) or conditional updates (<code>UPDATE activities SET participant_count = participant_count + 1 WHERE activity_id = $1 AND participant_count < max_participants</code>), preventing over-subscription."
        ),
        (
            "Q5: How is WebSocket authentication handled to prevent unauthorized eavesdropping?",
            "<b>Answer:</b> During the Socket.io initial HTTP handshake, the client passes its JWT token in the <code>auth</code> payload. A custom socket authentication middleware validates the token signature, decodes the user ID, and rejects unauthorized connections before any event listener or room joining (<code>socket.join(`activity_${id}`)</code>) is permitted."
        ),
        (
            "Q6: How does the Admin Moderation Console prevent moderator abuse?",
            "<b>Answer:</b> Every administrative action (suspension, permanent ban, report rejection, activity removal) requires a documented justification string and writes an immutable record to the <code>audit_logs</code> table. This records the moderator ID, target user ID, action timestamp, and reasoning, ensuring full forensic accountability."
        ),
        (
            "Q7: Why choose React with Vite and Tailwind CSS over Server-Side Rendered Next.js?",
            "<b>Answer:</b> NearMates is an interactive single-page application requiring highly dynamic client-side state: continuous geolocation watching, live canvas image transformation, and persistent WebSocket streams. Vite provides sub-second HMR and a lightweight client bundle, while Tailwind CSS enables zero-runtime utility styling without CSS-in-JS hydration overhead."
        ),
        (
            "Q8: How does NearMates protect user privacy regarding exact location coordinates?",
            "<b>Answer:</b> In public feeds and profile views, NearMates never exposes raw GPS coordinates (latitude/longitude) to other clients. The backend computes relative geodesic distances (e.g., '1.4 km away') and returns generalized location neighborhood names (e.g., 'Central Park South') rather than precise residential coordinates."
        ),
        (
            "Q9: How are expired activities and stale user sessions cleaned up?",
            "<b>Answer:</b> The backend incorporates scheduled lifecycle maintenance routines that transition activities whose <code>end_time < NOW()</code> from 'open' to 'completed'. Furthermore, user profiles track <code>last_active_at</code>, allowing the discovery algorithm to deprioritize inactive users who have not logged in for over 30 days."
        ),
        (
            "Q10: What is your deployment architecture for production scaling?",
            "<b>Answer:</b> The stateless Express backend is packaged into Docker containers deployed across autoscaling cloud containers (e.g. AWS ECS, Render, or Railway) behind an NGINX load balancer. Persistent data and spatial indexing reside in managed Supabase PostgreSQL with read-replicas, and static frontend assets are globally edge-cached via Vercel CDN."
        )
    ]

    for q, a in qa_list:
        qa_data = [
            [Paragraph(f"<b>{q}</b>", ParagraphStyle('QTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5, leading=12, textColor=PRIMARY))],
            [Paragraph(a, ParagraphStyle('AnsText', parent=styles['Normal'], fontName='Helvetica', fontSize=8, leading=11.5, textColor=TEXT_DARK))]
        ]
        t_qa = Table(qa_data, colWidths=[504])
        t_qa.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), BG_CARD),
            ('BACKGROUND', (0,1), (-1,-1), colors.white),
            ('BOX', (0,0), (-1,-1), 1, BORDER_LIGHT),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        story.append(t_qa)
        story.append(Spacer(1, 5))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[OK] Successfully generated {output_filename}")

if __name__ == "__main__":
    output_pdf = "NearMates_10Min_Video_Demonstration_Script.pdf"
    create_video_script_pdf(output_pdf)

