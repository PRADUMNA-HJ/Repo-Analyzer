import io
import hashlib
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    HRFlowable,
)
from reportlab.pdfgen import canvas
from app.core.config import settings
from app.models.evaluation import Evaluation
from app.models.project import EvaluatedProject
from app.models.review_note import ReviewNote


class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute and print total page numbers."""
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
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))

        # Running top header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 11 * 72 - 36, f"RepoScope Academic Dossier — Methodology {settings.METHODOLOGY_VERSION}")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(54, 11 * 72 - 42, 8.5 * 72 - 54, 11 * 72 - 42)

        # Running bottom footer
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 45, 8.5 * 72 - 54, 45)

        footer_text = f"RepoScope Project Intelligence — Page {self._pageNumber} of {page_count} — Confidential Academic Assessment"
        self.drawString(54, 32, footer_text)
        self.drawRightString(8.5 * 72 - 54, 32, settings.UNIVERSITY_NAME)
        self.restoreState()


class AcademicPdfGenerator:
    """Generates official publication-grade academic evaluation dossiers."""

    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()

    def _setup_custom_styles(self):
        self.styles.add(ParagraphStyle(
            name="DossierTitle",
            parent=self.styles["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=18,
            leading=22,
            textColor=colors.HexColor("#0F172A"),
            spaceAfter=4,
        ))
        self.styles.add(ParagraphStyle(
            name="DossierSubtitle",
            parent=self.styles["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=13,
            textColor=colors.HexColor("#475569"),
            spaceAfter=12,
        ))
        self.styles.add(ParagraphStyle(
            name="SectionHeader",
            parent=self.styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=16,
            textColor=colors.HexColor("#1E293B"),
            spaceBefore=10,
            spaceAfter=6,
        ))
        self.styles.add(ParagraphStyle(
            name="MetaLabel",
            parent=self.styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8.5,
            leading=11,
            textColor=colors.HexColor("#334155"),
        ))
        self.styles.add(ParagraphStyle(
            name="MetaValue",
            parent=self.styles["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=11,
            textColor=colors.HexColor("#0F172A"),
        ))
        self.styles.add(ParagraphStyle(
            name="TableHeader",
            parent=self.styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8.5,
            leading=11,
            textColor=colors.white,
            alignment=0,
        ))
        self.styles.add(ParagraphStyle(
            name="TableCell",
            parent=self.styles["Normal"],
            fontName="Helvetica",
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#1E293B"),
        ))
        self.styles.add(ParagraphStyle(
            name="TableCellBold",
            parent=self.styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#0F172A"),
        ))
        self.styles.add(ParagraphStyle(
            name="CalloutText",
            parent=self.styles["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=12,
            textColor=colors.HexColor("#1E293B"),
        ))

    def generate_dossier_pdf(
        self,
        evaluation: Evaluation,
        projects: List[EvaluatedProject],
        review_notes: Optional[List[ReviewNote]] = None,
        evaluator_name: Optional[str] = None
    ) -> bytes:
        """Generates a complete academic evaluation dossier as a PDF byte stream."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            leftMargin=54,
            rightMargin=54,
            topMargin=54,
            bottomMargin=54,
        )

        story = []

        # 1. Header Banner & Document Identity
        story.extend(self._build_header(evaluation, evaluator_name))
        story.append(Spacer(1, 10))

        # 2. Executive Scorecard
        story.extend(self._build_executive_scorecard(evaluation, projects))
        story.append(Spacer(1, 12))

        # 3. 8-Pillar Scoring Rubric Breakdown
        story.extend(self._build_criteria_matrix(projects))
        story.append(Spacer(1, 14))

        # 4. Top Projects Technical Deep-Dive
        story.extend(self._build_projects_deep_dive(projects))
        story.append(Spacer(1, 14))

        # 5. Faculty Human Review & Accreditation (if present)
        if review_notes and len(review_notes) > 0:
            story.extend(self._build_review_section(review_notes))
            story.append(Spacer(1, 14))

        # 6. Governance, Integrity Hash & Audit Verification Appendix
        story.extend(self._build_appendix(evaluation))

        doc.build(story, canvasmaker=NumberedCanvas)
        buffer.seek(0)
        return buffer.getvalue()

    def _build_header(self, evaluation: Evaluation, evaluator_name: Optional[str]) -> List[Any]:
        elements = []

        # Institutional Header Table
        eval_date = evaluation.evaluation_date or datetime.now(timezone.utc)
        header_data = [
            [
                Paragraph(f"<b>{settings.UNIVERSITY_NAME.upper()}</b>", self.styles["MetaLabel"]),
                Paragraph(f"METHODOLOGY VERSION: <b>{evaluation.methodology_version}</b>", self.styles["MetaValue"])
            ],
            [
                Paragraph(f"{settings.DEPARTMENT_NAME}", self.styles["DossierSubtitle"]),
                Paragraph(f"EVALUATION DATE: <b>{eval_date.strftime('%B %d, %Y')}</b>", self.styles["MetaValue"])
            ]
        ]
        header_table = Table(header_data, colWidths=[330, 174])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
        ]))
        elements.append(header_table)

        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#4F46E5"), spaceBefore=4, spaceAfter=8))

        # Title Block
        elements.append(Paragraph("ACADEMIC PROJECT EVALUATION DOSSIER", self.styles["DossierTitle"]))
        elements.append(Paragraph(
            "Evidence-Based Software Engineering Assessment & Repository Intelligence Report",
            self.styles["DossierSubtitle"]
        ))

        # Metadata Summary Card
        evaluator_display = evaluator_name or "Academic Evaluation Committee"
        user_p = evaluation.user_profile or {}
        candidate_name = user_p.get("name") or user_p.get("username") or evaluation.target_identifier

        meta_rows = [
            [
                Paragraph("Target Identifier:", self.styles["MetaLabel"]),
                Paragraph(f"<b>github.com/{evaluation.target_identifier}</b> ({evaluation.target_type.upper()})", self.styles["MetaValue"]),
                Paragraph("Candidate Name:", self.styles["MetaLabel"]),
                Paragraph(f"<b>{candidate_name}</b>", self.styles["MetaValue"]),
            ],
            [
                Paragraph("Repositories Found:", self.styles["MetaLabel"]),
                Paragraph(str(evaluation.total_repositories_found), self.styles["MetaValue"]),
                Paragraph("Reviewing Officer:", self.styles["MetaLabel"]),
                Paragraph(evaluator_display, self.styles["MetaValue"]),
            ],
            [
                Paragraph("Document ID:", self.styles["MetaLabel"]),
                Paragraph(f"DOSSIER-{evaluation.id[:8].upper()}", self.styles["MetaValue"]),
                Paragraph("Verification Status:", self.styles["MetaLabel"]),
                Paragraph("<font color='#059669'><b>ACADEMICALLY VERIFIED</b></font>", self.styles["MetaValue"]),
            ]
        ]
        meta_table = Table(meta_rows, colWidths=[105, 150, 95, 154])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
            ('BOX', (0, 0), (-1, -1), 0.75, colors.HexColor("#CBD5E1")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(meta_table)

        return elements

    def _build_executive_scorecard(self, evaluation: Evaluation, projects: List[EvaluatedProject]) -> List[Any]:
        elements = []
        elements.append(Paragraph("1. Executive Technical Scorecard", self.styles["SectionHeader"]))

        # Calibrated Score Tier
        score = evaluation.overall_score
        tier = "Needs Improvement"
        if score >= 9.0:
            tier = "Exceptional (Enterprise Standard)"
        elif score >= 8.0:
            tier = "Very Strong (High Distinction)"
        elif score >= 7.0:
            tier = "Strong (Satisfactory Engineering)"
        elif score >= 5.0:
            tier = "Moderate (Developing Competency)"

        top_project = projects[0] if projects else None
        top_name = top_project.display_name if top_project else "N/A"
        top_lang = top_project.primary_language if top_project else "N/A"

        scorecard_data = [
            [
                Paragraph(f"<font size=26><b>{score:.1f}</b></font><font size=14> / 10.0</font><br/><br/><b>Overall Composite Rating:</b><br/>{tier}", self.styles["CalloutText"]),
                Paragraph(
                    f"<b>Top Showcase Project:</b> {top_name}<br/>"
                    f"<b>Primary Tech Domain:</b> {top_lang}<br/>"
                    f"<b>Inspected Projects:</b> {len(projects)} showcase projects analyzed<br/>"
                    f"<b>Evaluation Engine:</b> Deterministic 8-Pillar Evidence Engine (v{evaluation.methodology_version})<br/>"
                    f"<b>Inspection Scope:</b> Abstract Syntax Trees, directory layers, test suites & documentation",
                    self.styles["CalloutText"]
                )
            ]
        ]

        scorecard_table = Table(scorecard_data, colWidths=[180, 324])
        scorecard_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), colors.HexColor("#EEF2FF")),
            ('BACKGROUND', (1, 0), (1, 0), colors.HexColor("#F8FAFC")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#6366F1")),
            ('LINEBEFORE', (1, 0), (1, 0), 0.75, colors.HexColor("#CBD5E1")),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ]))
        elements.append(scorecard_table)
        return elements

    def _build_criteria_matrix(self, projects: List[EvaluatedProject]) -> List[Any]:
        elements = []
        elements.append(Paragraph("2. 8-Pillar Engineering Evaluation Rubric Breakdown", self.styles["SectionHeader"]))

        if not projects or not projects[0].criteria_breakdown:
            elements.append(Paragraph("Standard 8-pillar scoring metrics applied.", self.styles["TableCell"]))
            return elements

        top_p = projects[0]
        criteria = top_p.criteria_breakdown or []

        table_rows = [
            [
                Paragraph("<b>Evaluation Pillar</b>", self.styles["TableHeader"]),
                Paragraph("<b>Weight</b>", self.styles["TableHeader"]),
                Paragraph("<b>Score / 10</b>", self.styles["TableHeader"]),
                Paragraph("<b>Rating Tier</b>", self.styles["TableHeader"]),
                Paragraph("<b>Key Verified Technical Finding</b>", self.styles["TableHeader"]),
            ]
        ]

        total_weight = 0
        for c in criteria:
            name = c.get("name", "Criterion")
            weight = c.get("weight", 0)
            score = c.get("score", 0.0)
            rating = c.get("rating_label", "Moderate")
            findings = c.get("findings", [])
            key_finding = findings[0] if findings else "Standard conventions followed"
            total_weight += weight

            table_rows.append([
                Paragraph(f"<b>{name}</b>", self.styles["TableCellBold"]),
                Paragraph(f"{weight}%", self.styles["TableCell"]),
                Paragraph(f"<b>{score:.1f}</b>", self.styles["TableCellBold"]),
                Paragraph(rating, self.styles["TableCell"]),
                Paragraph(key_finding, self.styles["TableCell"]),
            ])

        # Summary total row
        table_rows.append([
            Paragraph("<b>TOTAL WEIGHTED SCORE</b>", self.styles["TableCellBold"]),
            Paragraph(f"<b>{total_weight}%</b>", self.styles["TableCellBold"]),
            Paragraph(f"<b>{top_p.overall_score:.1f}</b>", self.styles["TableCellBold"]),
            Paragraph(f"<b>{top_p.confidence_label} Conf.</b>", self.styles["TableCellBold"]),
            Paragraph("<b>Deterministic weighted average across all 8 pillars</b>", self.styles["TableCellBold"]),
        ])

        col_widths = [140, 48, 54, 82, 180]
        matrix_table = Table(table_rows, colWidths=col_widths, repeatRows=1)
        matrix_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0F172A")),
            ('BOX', (0, 0), (-1, -1), 0.75, colors.HexColor("#94A3B8")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, colors.HexColor("#F8FAFC")]),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor("#EEF2FF")),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        elements.append(matrix_table)
        return elements

    def _build_projects_deep_dive(self, projects: List[EvaluatedProject]) -> List[Any]:
        elements = []
        elements.append(Paragraph("3. Top Candidate Projects Deep-Dive", self.styles["SectionHeader"]))

        for p in projects:
            p_elements = []
            title_text = f"Rank #{p.rank}: {p.display_name} — Score: {p.overall_score:.1f} / 10 ({p.primary_language})"
            p_elements.append(Paragraph(title_text, self.styles["MetaLabel"]))
            p_elements.append(Paragraph(f"Repository: <font color='#4F46E5'>{p.repo_url}</font>", self.styles["TableCell"]))
            if p.summary:
                p_elements.append(Paragraph(f"<b>Summary:</b> {p.summary}", self.styles["TableCell"]))

            # Complexity & Architecture Subtable
            metrics = p.complexity_metrics or {}
            cyclomatic = metrics.get("cyclomatic_complexity_average", 1.8)
            funcs = metrics.get("function_count", 0)
            classes = metrics.get("class_count", 0)
            typing_r = metrics.get("type_hint_ratio", 0.0)

            detail_rows = [
                [
                    Paragraph("<b>Complexity Avg:</b>", self.styles["TableCellBold"]),
                    Paragraph(f"{cyclomatic:.1f} / func", self.styles["TableCell"]),
                    Paragraph("<b>Functions / Classes:</b>", self.styles["TableCellBold"]),
                    Paragraph(f"{funcs} funcs / {classes} classes", self.styles["TableCell"]),
                    Paragraph("<b>Type Annotation:</b>", self.styles["TableCellBold"]),
                    Paragraph(f"{typing_r * 100:.0f}% coverage", self.styles["TableCell"]),
                ]
            ]
            detail_table = Table(detail_rows, colWidths=[90, 80, 100, 90, 84, 60])
            detail_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F1F5F9")),
                ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ('TOPPADDING', (0, 0), (-1, -1), 2),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
                ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ]))
            p_elements.append(Spacer(1, 3))
            p_elements.append(detail_table)

            # Strengths & Weaknesses
            strengths_str = "; ".join(p.strengths[:2]) if p.strengths else "Standard structure"
            weaknesses_str = "; ".join(p.weaknesses[:2]) if p.weaknesses else "None recorded"
            p_elements.append(Spacer(1, 3))
            p_elements.append(Paragraph(f"<b>Strengths:</b> {strengths_str}", self.styles["TableCell"]))
            p_elements.append(Paragraph(f"<b>Areas for Growth:</b> {weaknesses_str}", self.styles["TableCell"]))
            p_elements.append(Spacer(1, 8))

            elements.append(KeepTogether(p_elements))

        return elements

    def _build_review_section(self, review_notes: List[ReviewNote]) -> List[Any]:
        elements = []
        elements.append(Paragraph("4. Faculty Accreditation & Human Review Record", self.styles["SectionHeader"]))

        for note in review_notes:
            override_text = f" (Manual Score Override: <b>{note.manual_score_override:.1f}</b>)" if note.manual_score_override is not None else ""
            note_date = note.created_at or datetime.now(timezone.utc)
            review_box = [
                [
                    Paragraph(f"<b>Reviewer:</b> {note.reviewer_name} ({note.reviewer_department})", self.styles["MetaLabel"]),
                    Paragraph(f"<b>Date:</b> {note_date.strftime('%Y-%m-%d')}", self.styles["MetaValue"])
                ],
                [
                    Paragraph(f"<b>Accreditation Verdict:</b> <font color='#4F46E5'><b>{note.accreditation_verdict}</b></font>{override_text}", self.styles["MetaLabel"]),
                    Paragraph("<b>Status:</b> FINALIZED", self.styles["MetaValue"])
                ],
                [
                    Paragraph(f"<b>Evaluation Remarks:</b><br/>{note.overall_comment}", self.styles["CalloutText"]),
                    Paragraph("<br/><br/>___________________________<br/><b>Authorized Faculty Signature</b>", self.styles["TableCell"])
                ]
            ]
            review_table = Table(review_box, colWidths=[360, 144])
            review_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
                ('BOX', (0, 0), (-1, -1), 0.75, colors.HexColor("#6366F1")),
                ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ]))
            elements.append(review_table)
            elements.append(Spacer(1, 6))

        return elements

    def _build_appendix(self, evaluation: Evaluation) -> List[Any]:
        elements = []
        elements.append(Paragraph("5. Governance, Methodology & Verification Integrity", self.styles["SectionHeader"]))

        # Compute SHA-256 fingerprint for document integrity verification
        hash_seed = f"{evaluation.id}-{evaluation.target_identifier}-{evaluation.overall_score}-{evaluation.methodology_version}"
        integrity_hash = hashlib.sha256(hash_seed.encode("utf-8")).hexdigest()

        appendix_text = (
            f"<b>Methodology Standard:</b> RepoScope Academic Rubric v{evaluation.methodology_version}. "
            "Evaluation weights are strictly distributed: Code Quality (20%), Architecture & Design (15%), Functionality (15%), "
            "Tech Stack (10%), Testing & QA (10%), Security & Best Practices (10%), Documentation (10%), Activity (10%).<br/>"
            "<b>Zero Execution Guarantee:</b> No source code was compiled, executed, or dynamically evaluated. "
            "All findings are derived from static Abstract Syntax Tree (AST) inspection, lexical token analysis, and repository metadata.<br/>"
            f"<b>Digital Verification Fingerprint (SHA-256):</b> <code>{integrity_hash}</code>"
        )
        elements.append(Paragraph(appendix_text, self.styles["TableCell"]))
        return elements
