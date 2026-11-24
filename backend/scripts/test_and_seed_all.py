#!/usr/bin/env python3
"""Comprehensive Endpoint Testing and Database Seeding Script.

Tests 100% of the API endpoints documented in Swagger (http://localhost:8000/docs)
and populates the database with real working images, animated GIFs, MP4 videos,
PDF documents, PPTX slide decks, DOCX word documents, and XLSX spreadsheets.
"""

import io
import json
import math
import os
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path
from typing import Any
import requests

from PIL import Image, ImageDraw, ImageFont
import openpyxl
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
import pptx
from pptx.util import Inches as PptInches, Pt as PptPt
from pptx.dml.color import RGBColor as PptRGBColor
from pptx.enum.text import PP_ALIGN
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import (
    HRFlowable,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

BASE_URL = "http://localhost:8000"
TEMP_DIR = Path("/tmp/tm_seed_assets")
FFMPEG_BIN = "/home/anuroop-tm/.local/bin/ffmpeg"


# ==============================================================================
# 1. MEDIA GENERATORS
# ==============================================================================


def ensure_font(size: int = 24):
    """Try to load a nice TTF font or fallback to default."""
    font_paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
    ]
    for path in font_paths:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    return ImageFont.load_default()


def create_banner_image(
    filepath: Path,
    title: str,
    subtitle: str,
    tag: str,
    c1: tuple[int, int, int] = (15, 23, 42),
    c2: tuple[int, int, int] = (30, 41, 59),
    accent: tuple[int, int, int] = (6, 182, 212),
    width: int = 1200,
    height: int = 675,
) -> Path:
    """Generate high-resolution branded banner/thumbnail image with gradients and accents."""
    img = Image.new("RGB", (width, height), c1)
    draw = ImageDraw.Draw(img)

    # Gradient background
    for y in range(height):
        factor = y / height
        r = int(c1[0] * (1 - factor) + c2[0] * factor)
        g = int(c1[1] * (1 - factor) + c2[1] * factor)
        b = int(c1[2] * (1 - factor) + c2[2] * factor)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Decorative tech grid & circles
    for x in range(0, width, 60):
        draw.line([(x, 0), (x, height)], fill=(255, 255, 255, 10), width=1)
    for y in range(0, height, 60):
        draw.line([(0, y), (width, y)], fill=(255, 255, 255, 10), width=1)

    # Accent glow circles
    draw.ellipse([width - 250, -50, width + 150, 350], outline=accent, width=2)
    draw.ellipse(
        [width - 320, -120, width + 220, 420],
        outline=(accent[0], accent[1], accent[2], 50),
        width=1,
    )
    draw.ellipse(
        [width - 150, height - 200, width + 100, height + 50], outline=accent, width=2
    )

    # Pill tag
    tag_font = ensure_font(18)
    draw.rounded_rectangle(
        [70, 70, 70 + len(tag) * 12 + 30, 110],
        radius=8,
        fill=(accent[0], accent[1], accent[2]),
    )
    draw.text((85, 80), tag.upper(), fill=(15, 23, 42), font=tag_font)

    # Title & subtitle
    title_font = ensure_font(44)
    subtitle_font = ensure_font(22)
    draw.text((70, 160), title, fill=(255, 255, 255), font=title_font)
    draw.text((70, 240), subtitle, fill=(148, 163, 184), font=subtitle_font)

    # Bottom bar
    draw.rectangle([70, height - 70, width - 70, height - 66], fill=accent)
    footer_font = ensure_font(16)
    draw.text(
        (70, height - 50),
        "CONFORGE SOLUTIONS HUB // PRODUCTION CERTIFIED",
        fill=(100, 116, 139),
        font=footer_font,
    )
    draw.text(
        (width - 320, height - 50),
        "STATUS: ACTIVE PRODUCTION",
        fill=(52, 211, 153),
        font=footer_font,
    )

    filepath.parent.mkdir(parents=True, exist_ok=True)
    img.save(filepath, format="PNG", optimize=True)
    return filepath


def create_animated_gif(
    filepath: Path,
    title: str,
    tag: str,
    accent: tuple[int, int, int] = (6, 182, 212),
    frames_count: int = 16,
    width: int = 600,
    height: int = 340,
) -> Path:
    """Generate animated multi-frame GIF showing interactive pulse and progress telemetry."""
    frames = []
    title_font = ensure_font(22)
    status_font = ensure_font(14)
    code_font = ensure_font(13)

    for i in range(frames_count):
        img = Image.new("RGB", (width, height), (15, 23, 42))
        draw = ImageDraw.Draw(img)

        # Tech grid
        for x in range(0, width, 30):
            draw.line([(x, 0), (x, height)], fill=(30, 41, 59), width=1)
        for y in range(0, height, 30):
            draw.line([(0, y), (width, y)], fill=(30, 41, 59), width=1)

        # Header pill
        draw.rounded_rectangle([30, 20, 180, 45], radius=6, fill=accent)
        draw.text((40, 25), tag.upper(), fill=(15, 23, 42), font=status_font)

        # Title
        draw.text((30, 60), title, fill=(255, 255, 255), font=title_font)

        # Pulsing radar/circle
        pulse_r = 30 + int(25 * math.sin(i * 2 * math.pi / frames_count))
        draw.ellipse(
            [width - 120 - pulse_r, 80 - pulse_r, width - 120 + pulse_r, 80 + pulse_r],
            outline=accent,
            width=2,
        )
        draw.ellipse(
            [width - 120 - 6, 80 - 6, width - 120 + 6, 80 + 6], fill=(52, 211, 153)
        )

        # Animated progress bar
        progress = ((i + 1) / frames_count) * (width - 60)
        draw.rounded_rectangle([30, 115, width - 30, 125], radius=5, fill=(30, 41, 59))
        draw.rounded_rectangle(
            [30, 115, 30 + int(progress), 125], radius=5, fill=accent
        )

        # Simulated live logs / metrics
        pct = int(((i + 1) / frames_count) * 100)
        draw.text(
            (30, 140),
            f"> Telemetry pipeline stream: ACTIVE ({pct}% sync)",
            fill=(52, 211, 153),
            font=code_font,
        )
        draw.text(
            (30, 165),
            f"> Latency P99: {12.4 + (i % 5) * 0.8:.1f}ms | Throughput: {1850 + i * 40} req/s",
            fill=(148, 163, 184),
            font=code_font,
        )
        draw.text(
            (30, 190),
            f"> Vector Nodes Healthy: 12/12 (Cluster State: OPTIMAL)",
            fill=(148, 163, 184),
            font=code_font,
        )
        draw.text(
            (30, 215),
            f"> Neural Reranking: reciprocal_rank_fusion (k=60)",
            fill=(148, 163, 184),
            font=code_font,
        )

        # Moving scan line
        scan_y = int((i / frames_count) * height)
        draw.line(
            [(0, scan_y), (width, scan_y)],
            fill=(accent[0], accent[1], accent[2]),
            width=2,
        )

        # Bottom status
        draw.text(
            (30, height - 35),
            "CONFORGE LIVE PREVIEW // HOVER TELEMETRY",
            fill=(100, 116, 139),
            font=status_font,
        )

        frames.append(img)

    filepath.parent.mkdir(parents=True, exist_ok=True)
    frames[0].save(
        filepath,
        format="GIF",
        save_all=True,
        append_images=frames[1:],
        duration=150,
        loop=0,
        optimize=True,
    )
    return filepath


def create_demo_video(
    filepath: Path,
    title: str,
    subtitle: str,
    accent: tuple[int, int, int] = (6, 182, 212),
    duration_secs: int = 5,
    fps: int = 15,
) -> Path:
    """Generate real playable MP4 video with animations and visual telemetry."""
    frame_dir = filepath.parent / f"frames_{filepath.stem}"
    frame_dir.mkdir(parents=True, exist_ok=True)

    total_frames = duration_secs * fps
    title_font = ensure_font(34)
    sub_font = ensure_font(20)
    meta_font = ensure_font(16)

    width, height = 1280, 720

    for f_idx in range(total_frames):
        img = Image.new("RGB", (width, height), (15, 23, 42))
        draw = ImageDraw.Draw(img)

        # Background grid
        for x in range(0, width, 40):
            draw.line([(x, 0), (x, height)], fill=(24, 33, 47), width=1)
        for y in range(0, height, 40):
            draw.line([(0, y), (width, y)], fill=(24, 33, 47), width=1)

        # Top banner
        draw.rectangle([0, 0, width, 70], fill=(11, 17, 32))
        draw.text(
            (50, 22),
            "CONFORGE SOLUTION ARCHITECTURE // LIVE DEMO",
            fill=accent,
            font=meta_font,
        )

        time_str = f"00:0{f_idx // fps}:{f_idx % fps * (100 // fps):02d} / 00:0{duration_secs}:00"
        draw.text((width - 240, 22), time_str, fill=(148, 163, 184), font=meta_font)

        # Title and description
        draw.text((80, 140), title, fill=(255, 255, 255), font=title_font)
        draw.text((80, 195), subtitle, fill=(148, 163, 184), font=sub_font)

        # Animated graphic: Rotating radar circles & nodes
        cx, cy = 950, 400
        angle = (f_idx / total_frames) * 2 * math.pi * 2
        for r in [60, 120, 180]:
            draw.ellipse(
                [cx - r, cy - r, cx + r, cy + r], outline=(30, 41, 59), width=2
            )
        # Radar beam
        bx = cx + int(180 * math.cos(angle))
        by = cy + int(180 * math.sin(angle))
        draw.line([(cx, cy), (bx, by)], fill=accent, width=3)
        draw.ellipse([bx - 8, by - 8, bx + 8, by + 8], fill=(52, 211, 153))

        # Live metric cards
        cards = [
            ("Model Accuracy / F1", f"{98.4 + (f_idx % 7) * 0.2:.1f}%"),
            ("P99 Inference Latency", f"{18.2 + math.sin(f_idx) * 2.1:.1f}ms"),
            ("Active Microservices", f"{14 + (f_idx // 15)} / 16 Healthy"),
            ("Requests Handled", f"{128450 + f_idx * 135:,}"),
        ]

        card_y = 280
        for label, val in cards:
            draw.rounded_rectangle(
                [80, card_y, 540, card_y + 60], radius=8, fill=(30, 41, 59)
            )
            draw.text((100, card_y + 12), label, fill=(148, 163, 184), font=meta_font)
            draw.text((100, card_y + 32), val, fill=(52, 211, 153), font=sub_font)
            card_y += 75

        # Progress scrubber bar
        prog_w = int((f_idx / total_frames) * (width - 160))
        draw.rounded_rectangle(
            [80, height - 70, width - 80, height - 60], radius=5, fill=(30, 41, 59)
        )
        draw.rounded_rectangle(
            [80, height - 70, 80 + prog_w, height - 60], radius=5, fill=accent
        )

        frame_file = frame_dir / f"f_{f_idx:04d}.png"
        img.save(frame_file)

    # Encode with ffmpeg
    cmd = [
        FFMPEG_BIN,
        "-y",
        "-framerate",
        str(fps),
        "-i",
        str(frame_dir / "f_%04d.png"),
        "-f",
        "lavfi",
        "-i",
        "anullsrc=channel_layout=stereo:sample_rate=44100",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-t",
        str(duration_secs),
        "-movflags",
        "+faststart",
        str(filepath),
    ]
    subprocess.run(
        cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True
    )
    shutil.rmtree(frame_dir, ignore_errors=True)
    return filepath


def create_pdf_document(
    filepath: Path,
    title: str,
    subtitle: str,
    abstract: str,
    sections: list[tuple[str, str]],
    table_headers: list[str],
    table_rows: list[list[str]],
) -> Path:
    """Generate high-quality multi-page PDF document with styling, tables, and headers."""
    doc = SimpleDocTemplate(
        str(filepath),
        pagesize=letter,
        rightMargin=54,
        leftMargin=54,
        topMargin=54,
        bottomMargin=54,
    )
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=10,
    )
    sub_style = ParagraphStyle(
        "CustomSub",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#06B6D4"),
        spaceAfter=15,
    )
    h2_style = ParagraphStyle(
        "CustomH2",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=14,
        spaceAfter=8,
    )
    body_style = ParagraphStyle(
        "CustomBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#334155"),
        spaceAfter=10,
    )

    story = []

    # Title & Metadata
    story.append(Paragraph(title, title_style))
    story.append(Paragraph(subtitle, sub_style))
    story.append(
        HRFlowable(
            width="100%", thickness=1.5, color=colors.HexColor("#06B6D4"), spaceAfter=15
        )
    )

    # Abstract Box
    story.append(Paragraph("<b>Executive Summary:</b> " + abstract, body_style))
    story.append(Spacer(1, 10))

    # Sections
    for heading, content in sections:
        story.append(Paragraph(heading, h2_style))
        story.append(Paragraph(content, body_style))
        story.append(Spacer(1, 5))

    # Architecture Table
    story.append(Paragraph("Technical Specifications & Benchmarks", h2_style))
    table_data = [[Paragraph(f"<b>{h}</b>", body_style) for h in table_headers]]
    for row in table_rows:
        table_data.append([Paragraph(cell, body_style) for cell in row])

    t = Table(table_data, colWidths=[120, 130, 130, 120])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                (
                    "ROWBACKGROUNDS",
                    (0, 1),
                    (-1, -1),
                    [colors.white, colors.HexColor("#F8FAFC")],
                ),
            ]
        )
    )
    story.append(t)
    story.append(Spacer(1, 20))
    story.append(
        HRFlowable(
            width="100%",
            thickness=0.5,
            color=colors.HexColor("#94A3B8"),
            spaceBefore=15,
            spaceAfter=8,
        )
    )
    story.append(
        Paragraph(
            "<i>Conforge Solution Hub Architecture Documentation © ThoughtMinds AI</i>",
            body_style,
        )
    )

    filepath.parent.mkdir(parents=True, exist_ok=True)
    doc.build(story)
    return filepath


def create_docx_document(
    filepath: Path,
    title: str,
    subtitle: str,
    sections: list[tuple[str, str]],
    table_headers: list[str],
    table_rows: list[list[str]],
) -> Path:
    """Generate professional Microsoft Word (.docx) document."""
    doc = docx.Document()

    # Title
    p_title = doc.add_paragraph()
    run_title = p_title.add_run(title)
    run_title.bold = True
    run_title.font.size = Pt(22)
    run_title.font.color.rgb = RGBColor(15, 23, 42)

    # Subtitle
    p_sub = doc.add_paragraph()
    run_sub = p_sub.add_run(subtitle)
    run_sub.font.size = Pt(12)
    run_sub.font.color.rgb = RGBColor(6, 182, 212)
    p_sub.paragraph_format.space_after = Pt(18)

    # Sections
    for heading, text in sections:
        h = doc.add_heading(heading, level=2)
        h.paragraph_format.space_before = Pt(12)
        h.paragraph_format.space_after = Pt(6)
        p = doc.add_paragraph(text)
        p.paragraph_format.space_after = Pt(8)

    # Table
    doc.add_heading("Architecture Reference Table", level=2)
    table = doc.add_table(rows=1, cols=len(table_headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = (
        "Light Shading Accent 1"
        if "Light Shading Accent 1" in [s.name for s in doc.styles]
        else "Table Grid"
    )

    hdr_cells = table.rows[0].cells
    for i, header_text in enumerate(table_headers):
        hdr_cells[i].text = header_text

    for row_data in table_rows:
        row_cells = table.add_row().cells
        for i, val in enumerate(row_data):
            row_cells[i].text = val

    filepath.parent.mkdir(parents=True, exist_ok=True)
    doc.save(filepath)
    return filepath


def create_pptx_deck(
    filepath: Path,
    title: str,
    subtitle: str,
    slides_info: list[dict[str, Any]],
) -> Path:
    """Generate high-impact Microsoft PowerPoint (.pptx) presentation deck."""
    prs = pptx.Presentation()
    prs.slide_width = PptInches(13.333)
    prs.slide_height = PptInches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Slide 1: Dark Title Slide
    s1 = prs.slides.add_slide(blank_layout)
    bg1 = s1.shapes.add_shape(
        pptx.enum.shapes.MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height
    )
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = PptRGBColor(15, 23, 42)
    bg1.line.color.rgb = PptRGBColor(15, 23, 42)

    # Title box
    tx_box = s1.shapes.add_textbox(
        PptInches(1.2), PptInches(2.2), PptInches(11), PptInches(2.5)
    )
    tf = tx_box.text_frame
    tf.word_wrap = True
    p1 = tf.paragraphs[0]
    p1.text = title
    p1.font.bold = True
    p1.font.size = PptPt(40)
    p1.font.color.rgb = PptRGBColor(255, 255, 255)

    p2 = tf.add_paragraph()
    p2.text = subtitle
    p2.font.size = PptPt(22)
    p2.font.color.rgb = PptRGBColor(6, 182, 212)
    p2.space_before = PptPt(14)

    p3 = tf.add_paragraph()
    p3.text = "Conforge Solutions Hub // Enterprise Technical Architecture"
    p3.font.size = PptPt(14)
    p3.font.color.rgb = PptRGBColor(148, 163, 184)
    p3.space_before = PptPt(24)

    # Subsequent Content Slides
    for slide_data in slides_info:
        s = prs.slides.add_slide(blank_layout)
        # Background
        bg = s.shapes.add_shape(
            pptx.enum.shapes.MSO_SHAPE.RECTANGLE,
            0,
            0,
            prs.slide_width,
            prs.slide_height,
        )
        bg.fill.solid()
        bg.fill.fore_color.rgb = PptRGBColor(248, 250, 252)
        bg.line.color.rgb = PptRGBColor(248, 250, 252)

        # Header bar
        hbar = s.shapes.add_shape(
            pptx.enum.shapes.MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, PptInches(1.2)
        )
        hbar.fill.solid()
        hbar.fill.fore_color.rgb = PptRGBColor(15, 23, 42)
        hbar.line.color.rgb = PptRGBColor(15, 23, 42)

        htf = hbar.text_frame
        hp = htf.paragraphs[0]
        hp.text = slide_data.get("title", "Overview")
        hp.font.bold = True
        hp.font.size = PptPt(26)
        hp.font.color.rgb = PptRGBColor(255, 255, 255)

        # Bullets / Content
        bullets = slide_data.get("bullets", [])
        if bullets:
            cbox = s.shapes.add_textbox(
                PptInches(1.0), PptInches(1.6), PptInches(11.3), PptInches(4.5)
            )
            ctf = cbox.text_frame
            ctf.word_wrap = True
            for b_idx, bullet in enumerate(bullets):
                bp = ctf.paragraphs[0] if b_idx == 0 else ctf.add_paragraph()
                bp.text = f"•  {bullet}"
                bp.font.size = PptPt(18)
                bp.font.color.rgb = PptRGBColor(51, 65, 85)
                bp.space_before = PptPt(12)

    filepath.parent.mkdir(parents=True, exist_ok=True)
    prs.save(filepath)
    return filepath


def create_xlsx_sheet(
    filepath: Path,
    title: str,
    sheets: list[dict[str, Any]],
) -> Path:
    """Generate multi-tab formatted Excel (.xlsx) workbook."""
    wb = openpyxl.Workbook()
    # remove default sheet
    wb.remove(wb.active)

    header_fill = PatternFill(
        start_color="0F172A", end_color="0F172A", fill_type="solid"
    )
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    data_font = Font(name="Calibri", size=10, color="000000")
    border_side = Side(style="thin", color="CBD5E1")
    cell_border = Border(
        left=border_side, right=border_side, top=border_side, bottom=border_side
    )
    alt_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")

    for s_info in sheets:
        ws = wb.create_sheet(title=s_info["name"])
        headers = s_info["headers"]
        rows = s_info["rows"]

        # Write header
        for col_idx, h in enumerate(headers, start=1):
            cell = ws.cell(row=1, column=col_idx, value=h)
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal="center", vertical="center")
            cell.border = cell_border

        # Write rows
        for row_idx, r in enumerate(rows, start=2):
            fill = alt_fill if row_idx % 2 == 0 else PatternFill(fill_type=None)
            for col_idx, val in enumerate(r, start=1):
                cell = ws.cell(row=row_idx, column=col_idx, value=val)
                cell.font = data_font
                cell.border = cell_border
                cell.fill = fill
                cell.alignment = Alignment(horizontal="left", vertical="center")

        # Auto-adjust column width
        for col in ws.columns:
            max_len = max(len(str(cell.value or "")) for cell in col)
            col_letter = openpyxl.utils.get_column_letter(col[0].column)
            ws.column_dimensions[col_letter].width = max(max_len + 4, 14)

    filepath.parent.mkdir(parents=True, exist_ok=True)
    wb.save(filepath)
    return filepath


# ==============================================================================
# 2. RUNNER & API CLIENT
# ==============================================================================


class APITester:
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        self.admin_token: str | None = None
        self.admin_refresh_token: str | None = None
        self.test_results: list[dict[str, Any]] = []

    def record(
        self,
        method: str,
        endpoint: str,
        status_code: int,
        success: bool,
        detail: str = "",
    ):
        res = {
            "method": method.upper(),
            "endpoint": endpoint,
            "status_code": status_code,
            "success": success,
            "detail": detail,
        }
        self.test_results.append(res)
        symbol = "✓" if success else "✗"
        print(
            f"[{symbol}] {method.upper():6} {endpoint:45} -> HTTP {status_code} ({detail})"
        )

    def headers(self, auth: bool = True) -> dict[str, str]:
        h = {"Accept": "application/json"}
        if auth and self.admin_token:
            h["Authorization"] = f"Bearer {self.admin_token}"
        return h

    # --- Storage Helpers ---
    def upload_file(self, file_path: Path, folder: str = "general") -> dict[str, Any]:
        url = f"{self.base_url}/api/storage/upload"
        with open(file_path, "rb") as f:
            files = {"file": (file_path.name, f)}
            data = {"folder": folder}
            resp = self.session.post(url, files=files, data=data)

        ok = resp.status_code == 201
        self.record(
            "POST",
            "/api/storage/upload",
            resp.status_code,
            ok,
            f"Uploaded {file_path.name}",
        )
        if not ok:
            raise RuntimeError(f"Storage upload failed: {resp.text}")
        return resp.json()["data"]

    def generate_presigned_url(
        self, filename: str, content_type: str, folder: str = "general"
    ) -> dict[str, Any]:
        url = f"{self.base_url}/api/storage/presigned-url"
        payload = {
            "filename": filename,
            "content_type": content_type,
            "folder": folder,
            "expires_in": 3600,
        }
        resp = self.session.post(url, json=payload)
        ok = resp.status_code == 200
        self.record(
            "POST",
            "/api/storage/presigned-url",
            resp.status_code,
            ok,
            f"Presigned URL for {filename}",
        )
        return resp.json()["data"]

    def delete_storage_file(self, file_key: str):
        url = f"{self.base_url}/api/storage/{file_key}"
        resp = self.session.delete(url)
        ok = resp.status_code == 200
        self.record(
            "DELETE",
            f"/api/storage/{file_key}",
            resp.status_code,
            ok,
            f"Deleted key {file_key}",
        )
        return ok

    # --- Auth Helpers ---
    def login(self, email: str, password: str) -> dict[str, Any]:
        url = f"{self.base_url}/api/auth/login"
        payload = {"email": email, "password": password}
        resp = self.session.post(url, json=payload)
        ok = resp.status_code == 200
        self.record(
            "POST", "/api/auth/login", resp.status_code, ok, f"Logged in {email}"
        )
        data = resp.json()
        self.admin_token = data.get("access_token")
        self.admin_refresh_token = data.get("refresh_token")
        return data

    def get_me(self) -> dict[str, Any]:
        url = f"{self.base_url}/api/auth/me"
        resp = self.session.get(url, headers=self.headers(auth=True))
        ok = resp.status_code == 200
        self.record(
            "GET", "/api/auth/me", resp.status_code, ok, f"Current user profile"
        )
        return resp.json()

    def refresh_auth(self, refresh_token: str) -> dict[str, Any]:
        url = f"{self.base_url}/api/auth/refresh"
        payload = {"refresh_token": refresh_token}
        resp = self.session.post(url, json=payload)
        ok = resp.status_code == 200
        self.record(
            "POST", "/api/auth/refresh", resp.status_code, ok, f"Rotated refresh token"
        )
        return resp.json()

    def logout_auth(self, refresh_token: str):
        url = f"{self.base_url}/api/auth/logout"
        payload = {"refresh_token": refresh_token}
        resp = self.session.post(url, json=payload)
        ok = resp.status_code == 200
        self.record(
            "POST", "/api/auth/logout", resp.status_code, ok, f"Revoked refresh token"
        )
        return ok

    # --- User Helpers ---
    def get_users(self) -> list[dict[str, Any]]:
        url = f"{self.base_url}/api/users/"
        resp = self.session.get(url, headers=self.headers(auth=True))
        ok = resp.status_code == 200
        self.record("GET", "/api/users/", resp.status_code, ok, f"List users")
        return resp.json()["data"]

    def create_user(self, username: str, email: str, password: str) -> dict[str, Any]:
        url = f"{self.base_url}/api/users/create"
        payload = {"username": username, "email": email, "password": password}
        resp = self.session.post(url, json=payload, headers=self.headers(auth=True))
        ok = resp.status_code == 201
        self.record(
            "POST", "/api/users/create", resp.status_code, ok, f"Created {email}"
        )
        return resp.json()["data"]

    def update_user(self, user_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        url = f"{self.base_url}/api/users/{user_id}"
        resp = self.session.put(url, json=payload, headers=self.headers(auth=True))
        ok = resp.status_code == 200
        self.record(
            "PUT",
            f"/api/users/{user_id}",
            resp.status_code,
            ok,
            f"Updated user {user_id}",
        )
        return resp.json()["data"]

    def delete_user(self, user_id: str):
        url = f"{self.base_url}/api/users/{user_id}"
        resp = self.session.delete(url, headers=self.headers(auth=True))
        ok = resp.status_code == 200
        self.record(
            "DELETE",
            f"/api/users/{user_id}",
            resp.status_code,
            ok,
            f"Soft-deleted user {user_id}",
        )
        return ok

    def restore_user(self, user_id: str):
        url = f"{self.base_url}/api/users/{user_id}/restore"
        resp = self.session.patch(url, headers=self.headers(auth=True))
        ok = resp.status_code == 200
        self.record(
            "PATCH",
            f"/api/users/{user_id}/restore",
            resp.status_code,
            ok,
            f"Restored user {user_id}",
        )
        return ok

    def hard_delete_user(self, user_id: str):
        url = f"{self.base_url}/api/users/{user_id}/permanent"
        resp = self.session.delete(url, headers=self.headers(auth=True))
        ok = resp.status_code == 200
        self.record(
            "DELETE",
            f"/api/users/{user_id}/permanent",
            resp.status_code,
            ok,
            f"Hard-deleted user {user_id}",
        )
        return ok

    # --- Category Helpers ---
    def create_category(
        self, name: str, description: str, icon: str, thumbnail_url: str | None = None
    ) -> dict[str, Any]:
        url = f"{self.base_url}/api/categories/"
        payload = {
            "name": name,
            "description": description,
            "icon": icon,
            "thumbnail_url": thumbnail_url,
        }
        resp = self.session.post(url, json=payload)
        ok = resp.status_code == 201
        self.record(
            "POST", "/api/categories/", resp.status_code, ok, f"Created category {name}"
        )
        return resp.json()["data"]

    def get_categories(self) -> list[dict[str, Any]]:
        url = f"{self.base_url}/api/categories/"
        resp = self.session.get(url)
        ok = resp.status_code == 200
        self.record(
            "GET", "/api/categories/", resp.status_code, ok, f"Retrieved categories"
        )
        return resp.json()["data"]

    def get_category(self, category_id: str) -> dict[str, Any]:
        url = f"{self.base_url}/api/categories/{category_id}"
        resp = self.session.get(url)
        ok = resp.status_code == 200
        self.record(
            "GET",
            f"/api/categories/{category_id}",
            resp.status_code,
            ok,
            f"Get category {category_id}",
        )
        return resp.json()["data"]

    def update_category(
        self, category_id: str, payload: dict[str, Any]
    ) -> dict[str, Any]:
        url = f"{self.base_url}/api/categories/{category_id}"
        resp = self.session.put(url, json=payload)
        ok = resp.status_code == 200
        self.record(
            "PUT",
            f"/api/categories/{category_id}",
            resp.status_code,
            ok,
            f"Updated category {category_id}",
        )
        return resp.json()["data"]

    def delete_category(self, category_id: str):
        url = f"{self.base_url}/api/categories/{category_id}"
        resp = self.session.delete(url)
        ok = resp.status_code == 200
        self.record(
            "DELETE",
            f"/api/categories/{category_id}",
            resp.status_code,
            ok,
            f"Deleted category {category_id}",
        )
        return ok

    # --- Solution Helpers ---
    def create_solution(self, payload: dict[str, Any]) -> dict[str, Any]:
        url = f"{self.base_url}/api/solutions/"
        resp = self.session.post(url, json=payload)
        ok = resp.status_code == 201
        self.record(
            "POST",
            "/api/solutions/",
            resp.status_code,
            ok,
            f"Created solution: {payload['title']}",
        )
        if not ok:
            print("Create solution error:", resp.text)
        return resp.json()["data"]

    def get_solutions(self, category_id: str | None = None) -> list[dict[str, Any]]:
        url = f"{self.base_url}/api/solutions/"
        params = {"category_id": category_id} if category_id else {}
        resp = self.session.get(url, params=params)
        ok = resp.status_code == 200
        label = (
            f"List solutions (filter={category_id})"
            if category_id
            else "List solutions"
        )
        self.record("GET", "/api/solutions/", resp.status_code, ok, label)
        return resp.json()

    def get_recent_solutions(self) -> list[dict[str, Any]]:
        url = f"{self.base_url}/api/solutions/recent"
        resp = self.session.get(url)
        ok = resp.status_code == 200
        self.record(
            "GET", "/api/solutions/recent", resp.status_code, ok, "Recent solutions"
        )
        return resp.json()["data"]

    def get_solution(self, solution_id: str) -> dict[str, Any]:
        url = f"{self.base_url}/api/solutions/{solution_id}"
        resp = self.session.get(url)
        ok = resp.status_code == 200
        self.record(
            "GET",
            f"/api/solutions/{solution_id}",
            resp.status_code,
            ok,
            f"Get solution {solution_id}",
        )
        return resp.json()["data"]

    def update_solution(
        self, solution_id: str, payload: dict[str, Any]
    ) -> dict[str, Any]:
        url = f"{self.base_url}/api/solutions/{solution_id}"
        resp = self.session.put(url, json=payload)
        ok = resp.status_code == 200
        self.record(
            "PUT",
            f"/api/solutions/{solution_id}",
            resp.status_code,
            ok,
            f"Updated solution {solution_id}",
        )
        return resp.json()["data"]

    def delete_solution(self, solution_id: str):
        url = f"{self.base_url}/api/solutions/{solution_id}"
        resp = self.session.delete(url)
        ok = resp.status_code == 200
        self.record(
            "DELETE",
            f"/api/solutions/{solution_id}",
            resp.status_code,
            ok,
            f"Deleted solution {solution_id}",
        )
        return ok

    # --- Conversation & Chat Helpers ---
    def create_conversation(self, title: str | None = None) -> dict[str, Any]:
        url = f"{self.base_url}/api/conversations/"
        payload = {"title": title} if title else {}
        resp = self.session.post(url, json=payload, headers=self.headers(auth=True))
        ok = resp.status_code == 201
        self.record(
            "POST",
            "/api/conversations/",
            resp.status_code,
            ok,
            f"Created conversation {title}",
        )
        return resp.json()["data"]

    def list_conversations(self) -> list[dict[str, Any]]:
        url = f"{self.base_url}/api/conversations/"
        resp = self.session.get(url, headers=self.headers(auth=True))
        ok = resp.status_code == 200
        self.record(
            "GET",
            "/api/conversations/",
            resp.status_code,
            ok,
            "List user conversations",
        )
        return resp.json()["data"]

    def get_conversation(self, conv_id: str) -> dict[str, Any]:
        url = f"{self.base_url}/api/conversations/{conv_id}"
        resp = self.session.get(url, headers=self.headers(auth=True))
        ok = resp.status_code == 200
        self.record(
            "GET",
            f"/api/conversations/{conv_id}",
            resp.status_code,
            ok,
            f"Get conversation {conv_id}",
        )
        return resp.json()["data"]

    def update_conversation(self, conv_id: str, title: str) -> dict[str, Any]:
        url = f"{self.base_url}/api/conversations/{conv_id}"
        payload = {"title": title}
        resp = self.session.patch(url, json=payload, headers=self.headers(auth=True))
        ok = resp.status_code == 200
        self.record(
            "PATCH",
            f"/api/conversations/{conv_id}",
            resp.status_code,
            ok,
            f"Updated title: {title}",
        )
        return resp.json()["data"]

    def get_messages(self, conv_id: str) -> list[dict[str, Any]]:
        url = f"{self.base_url}/api/conversations/{conv_id}/messages"
        resp = self.session.get(url, headers=self.headers(auth=True))
        ok = resp.status_code == 200
        self.record(
            "GET",
            f"/api/conversations/{conv_id}/messages",
            resp.status_code,
            ok,
            f"Get messages for {conv_id}",
        )
        return resp.json()["data"]

    def delete_conversation(self, conv_id: str):
        url = f"{self.base_url}/api/conversations/{conv_id}"
        resp = self.session.delete(url, headers=self.headers(auth=True))
        ok = resp.status_code == 200
        self.record(
            "DELETE",
            f"/api/conversations/{conv_id}",
            resp.status_code,
            ok,
            f"Deleted conv {conv_id}",
        )
        return ok

    def stream_chat(self, message: str, conv_id: str | None = None) -> list[str]:
        url = f"{self.base_url}/api/chat/stream"
        payload = {"message": message}
        if conv_id:
            payload["conversation_id"] = conv_id

        events = []
        with self.session.post(
            url, json=payload, headers=self.headers(auth=True), stream=True
        ) as resp:
            ok = resp.status_code == 200
            for line in resp.iter_lines():
                if line:
                    events.append(line.decode("utf-8"))
            self.record(
                "POST",
                "/api/chat/stream",
                resp.status_code,
                ok,
                f"Streamed chat ({len(events)} SSE lines)",
            )
        return events

    # --- Dashboard Helpers ---
    def get_dashboard_stats(self, recent_limit: int = 5) -> dict[str, Any]:
        url = f"{self.base_url}/api/dashboard/stats"
        params = {"recent_limit": recent_limit}
        resp = self.session.get(url, params=params)
        ok = resp.status_code == 200
        self.record(
            "GET", "/api/dashboard/stats", resp.status_code, ok, "Dashboard stats"
        )
        return resp.json()["data"]


# ==============================================================================
# 3. MAIN WORKFLOW: GENERATE ASSETS, TEST ALL ENDPOINTS, SEED DATABASE
# ==============================================================================


def main():
    print("=" * 80)
    print(" CONFORGE SOLUTION HUB: COMPREHENSIVE ENDPOINT TESTING & SEEDING")
    print("=" * 80)

    tester = APITester()
    TEMP_DIR.mkdir(parents=True, exist_ok=True)

    # --------------------------------------------------------------------------
    # STEP 1: AUTHENTICATION ENDPOINTS
    # --------------------------------------------------------------------------
    print("\n>>> Testing Authentication Endpoints...")
    login_data = tester.login("admin@thoughtminds.ai", "admin@12345")
    refresh_tok = login_data["refresh_token"]

    tester.get_me()

    # Test refresh token rotation
    rotated = tester.refresh_auth(refresh_tok)
    new_refresh = rotated["refresh_token"]

    # Test logout (revocation)
    tester.logout_auth(new_refresh)

    # Re-login with admin credentials to keep active access token
    tester.login("admin@thoughtminds.ai", "admin@12345")

    # --------------------------------------------------------------------------
    # STEP 2: USER MANAGEMENT ENDPOINTS
    # --------------------------------------------------------------------------
    print("\n>>> Testing User Management Endpoints...")
    tester.get_users()

    # Create realistic technical leads / architects
    leads_spec = [
        ("Dr. Sarah Chen", "sarah.chen@thoughtminds.ai", "SarahPass@123"),
        ("Marcus Vance", "marcus.vance@thoughtminds.ai", "MarcusPass@123"),
        ("Elena Rostova", "elena.rostova@thoughtminds.ai", "ElenaPass@123"),
        ("David Kim", "david.kim@thoughtminds.ai", "DavidPass@123"),
    ]
    created_leads: dict[str, str] = {}  # name -> user_id

    for name, email, pwd in leads_spec:
        try:
            u = tester.create_user(name, email, pwd)
            created_leads[name] = str(u["id"])
        except Exception:
            # If already exists, fetch from list
            users_list = tester.get_users()
            for u in users_list:
                if u["email"].lower() == email.lower():
                    created_leads[name] = str(u["id"])
                    break

    # Test CRUD operations on a disposable user
    temp_user = tester.create_user(
        "Temporary Engineer", "temp.user.delete@thoughtminds.ai", "Temp@12345"
    )
    temp_user_id = str(temp_user["id"])
    tester.update_user(temp_user_id, {"username": "Temporary Engineer Updated"})
    tester.delete_user(temp_user_id)
    tester.restore_user(temp_user_id)
    tester.hard_delete_user(temp_user_id)

    # --------------------------------------------------------------------------
    # STEP 3: STORAGE ENDPOINTS & ASSET GENERATION
    # --------------------------------------------------------------------------
    print("\n>>> Generating Real Media Assets & Testing Storage Endpoints...")

    # Test presigned URL endpoint
    tester.generate_presigned_url(
        "sample_presigned.pdf", "application/pdf", "test_uploads"
    )

    # Test delete file endpoint
    temp_del_file = TEMP_DIR / "temp_del_test.txt"
    temp_del_file.write_text("Temporary file for delete testing.")
    uploaded_del = tester.upload_file(temp_del_file, folder="temp")
    tester.delete_storage_file(uploaded_del["file_key"])

    # --------------------------------------------------------------------------
    # STEP 4: CATEGORY ENDPOINTS & THUMBNAILS
    # --------------------------------------------------------------------------
    print("\n>>> Creating Categories with Custom Thumbnail Images...")

    categories_spec = [
        {
            "name": "Generative AI & LLMs",
            "description": "Foundation models, enterprise RAG platforms, fine-tuning, and cognitive automation pipelines.",
            "icon": "BrainCircuit",
            "tag": "COGNITIVE AI",
            "c1": (15, 23, 42),
            "c2": (49, 46, 129),
            "accent": (168, 85, 247),
        },
        {
            "name": "Cloud Infrastructure & DevOps",
            "description": "Kubernetes orchestration, multi-cloud cost governance, GitOps, and platform engineering.",
            "icon": "Cloud",
            "tag": "CLOUD NATIVE",
            "c1": (15, 23, 42),
            "c2": (12, 74, 110),
            "accent": (14, 165, 233),
        },
        {
            "name": "Enterprise Search & Knowledge Graph",
            "description": "Hybrid semantic search, vector databases, ontology graphs, and reciprocal rank fusion.",
            "icon": "Search",
            "tag": "SEMANTIC RETRIEVAL",
            "c1": (15, 23, 42),
            "c2": (19, 78, 74),
            "accent": (20, 184, 166),
        },
        {
            "name": "Data Engineering & Analytics",
            "description": "Real-time streaming lakehouses, Iceberg transactional tables, Spark pipelines, and federated Trino queries.",
            "icon": "Database",
            "tag": "LAKEHOUSE",
            "c1": (15, 23, 42),
            "c2": (67, 56, 202),
            "accent": (99, 102, 241),
        },
        {
            "name": "Cybersecurity & Identity Governance",
            "description": "Zero-trust architecture, continuous behavioral authentication, eBPF kernel threat defense, and compliance.",
            "icon": "ShieldCheck",
            "tag": "ZERO TRUST",
            "c1": (15, 23, 42),
            "c2": (136, 19, 55),
            "accent": (244, 63, 94),
        },
        {
            "name": "Autonomous Agents & Robotics",
            "description": "Multi-agent swarms, computer vision defect inspection, edge inference, and self-healing systems.",
            "icon": "Bot",
            "tag": "AUTONOMOUS SWARMS",
            "c1": (15, 23, 42),
            "c2": (120, 53, 15),
            "accent": (245, 158, 11),
        },
    ]

    created_categories: dict[str, str] = {}  # name -> category_id

    for c_spec in categories_spec:
        cat_thumb_path = (
            TEMP_DIR
            / f"cat_{c_spec['name'].lower().replace(' ', '_').replace('&', 'and')}.png"
        )
        create_banner_image(
            filepath=cat_thumb_path,
            title=c_spec["name"],
            subtitle=c_spec["description"],
            tag=c_spec["tag"],
            c1=c_spec["c1"],
            c2=c_spec["c2"],
            accent=c_spec["accent"],
            width=800,
            height=500,
        )
        cat_upload = tester.upload_file(cat_thumb_path, folder="categories")

        try:
            cat = tester.create_category(
                name=c_spec["name"],
                description=c_spec["description"],
                icon=c_spec["icon"],
                thumbnail_url=cat_upload["url"],
            )
            created_categories[c_spec["name"]] = str(cat["id"])
        except Exception:
            for cat in tester.get_categories():
                if cat["name"] == c_spec["name"]:
                    created_categories[c_spec["name"]] = str(cat["id"])
                    break

    # Test Category CRUD (get, update, delete)
    temp_cat_thumb = TEMP_DIR / "temp_cat_thumb.png"
    create_banner_image(
        temp_cat_thumb, "Temp Category", "To be deleted", "TEMP", width=600, height=400
    )
    temp_cat_upload = tester.upload_file(temp_cat_thumb, folder="categories")
    temp_cat = tester.create_category(
        "Temporary Category",
        "Testing category endpoints",
        "Folder",
        temp_cat_upload["url"],
    )
    temp_cat_id = str(temp_cat["id"])
    tester.get_category(temp_cat_id)
    tester.update_category(
        temp_cat_id, {"description": "Updated description for deletion"}
    )
    tester.delete_category(temp_cat_id)

    # --------------------------------------------------------------------------
    # STEP 5: SOLUTION SPECIFICATIONS & RICH ASSETS GENERATION
    # --------------------------------------------------------------------------
    print(
        "\n>>> Generating Solutions with Real PDFs, PPTXs, DOCXs, XLSXs, MP4s, GIFs & PNGs..."
    )

    solutions_spec = [
        {
            "title": "Enterprise Neural Search & Knowledge Retrieval (RAG Platform)",
            "description": "Production-grade multi-modal Retrieval-Augmented Generation (RAG) platform indexing PDF, Office documents, and tabular data with sub-second vector search, reciprocal rank fusion, and automated hallucination guardrails.",
            "lead_name": "Dr. Sarah Chen",
            "category_names": [
                "Generative AI & LLMs",
                "Enterprise Search & Knowledge Graph",
            ],
            "repository_url": "https://github.com/thoughtminds/enterprise-rag-platform",
            "tech_stack": [
                "Python",
                "FastAPI",
                "LangChain",
                "Qdrant",
                "PostgreSQL",
                "React",
                "Docker",
                "HuggingFace",
            ],
            "key_capabilities": [
                {
                    "title": "Multi-Modal Document Parsing",
                    "description": "High-fidelity OCR and semantic chunking for PDF, Word, PowerPoint, and spreadsheet data.",
                },
                {
                    "title": "Hybrid Dense-Sparse Retrieval",
                    "description": "Combines Qdrant dense vector embeddings with BM25 sparse search and reciprocal rank fusion.",
                },
                {
                    "title": "Enterprise RBAC & ACL Filtering",
                    "description": "Enforces document-level permissions matching Active Directory security groups.",
                },
                {
                    "title": "Hallucination Guardrails",
                    "description": "Real-time citation evaluation, ground truth alignment, and toxicity scoring.",
                },
            ],
            "accent": (168, 85, 247),
            "doc_specs": [
                (
                    "System Architecture Whitepaper",
                    "Comprehensive architectural guide covering ingestion pipelines, vector indices, and citation guardrails.",
                    "PDF",
                ),
                (
                    "Enterprise Deployment Manual",
                    "Step-by-step setup guide for Kubernetes, Helm charts, and environment configuration.",
                    "DOCX",
                ),
                (
                    "Executive Presentation Deck",
                    "Boardroom pitch deck outlining business value, cost savings, and knowledge discovery ROI.",
                    "PPTX",
                ),
                (
                    "Benchmark & Latency Telemetry",
                    "Empirical P50, P90, P99 retrieval latency benchmarks across 1M+ chunk indices.",
                    "XLSX",
                ),
            ],
            "video_spec": (
                "Platform Walkthrough & Live Demo",
                "Live demonstration of document parsing, conversational querying, and citation drill-down.",
                5,
            ),
            "service_urls": [
                {
                    "service_name": "Web Application",
                    "service_type": "Frontend",
                    "environment": "Production",
                    "target_url": "https://rag.thoughtminds.ai",
                },
                {
                    "service_name": "Swagger OpenAPI",
                    "service_type": "Swagger/API",
                    "environment": "Production",
                    "target_url": "http://localhost:8000/docs",
                },
                {
                    "service_name": "Vector Admin Console",
                    "service_type": "Admin Dashboard",
                    "environment": "Staging",
                    "target_url": "https://staging-qdrant.thoughtminds.ai",
                },
            ],
        },
        {
            "title": "Agentic FinOps & Multi-Cloud Cost Governance",
            "description": "Autonomous AI platform continuously monitoring cloud compute, storage, and networking across AWS, Azure, and GCP. Automatically rebalances spot instances, rightsizes Kubernetes workloads, and isolates rogue resources.",
            "lead_name": "Marcus Vance",
            "category_names": [
                "Cloud Infrastructure & DevOps",
                "Autonomous Agents & Robotics",
            ],
            "repository_url": "https://github.com/thoughtminds/finops-cloud-governance",
            "tech_stack": [
                "Go",
                "Python",
                "Kubernetes",
                "Terraform",
                "Prometheus",
                "Grafana",
                "AWS SDK",
                "Azure SDK",
            ],
            "key_capabilities": [
                {
                    "title": "Autonomous Spot Fleet Rebalancing",
                    "description": "Zero-downtime container migration from on-demand to spot instances saving up to 65%.",
                },
                {
                    "title": "Predictive Billing Anomaly Detection",
                    "description": "ML anomaly detection identifying cloud cost spikes within 15 minutes of occurrence.",
                },
                {
                    "title": "Kubernetes Resource Right-Sizing",
                    "description": "Automatic CPU/memory request tuning based on historical P99 container metrics.",
                },
                {
                    "title": "Automated Tagging & Isolation",
                    "description": "Detects untagged resources and quarantines non-compliant development instances.",
                },
            ],
            "accent": (14, 165, 233),
            "doc_specs": [
                (
                    "FinOps Architecture Whitepaper",
                    "Technical specification of autonomous agents, telemetry collectors, and API gateways.",
                    "PDF",
                ),
                (
                    "Cloud Integration & Security Guide",
                    "IAM permission boundary setup, cross-account assume-role policies, and audit trails.",
                    "DOCX",
                ),
                (
                    "CFO & FinOps Strategy Pitch Deck",
                    "Financial presentation on cloud unit economics, waste reduction, and margin expansion.",
                    "PPTX",
                ),
                (
                    "ROI & Cloud Savings Financial Model",
                    "Interactive financial worksheet modeling multi-year cloud savings across 500+ microservices.",
                    "XLSX",
                ),
            ],
            "video_spec": (
                "Autonomous Cost Optimizer in Action",
                "Real-time demonstration of automated spot migration and instantaneous cost reclamation.",
                5,
            ),
            "service_urls": [
                {
                    "service_name": "FinOps Cloud Console",
                    "service_type": "Frontend",
                    "environment": "Production",
                    "target_url": "https://finops.thoughtminds.ai",
                },
                {
                    "service_name": "Prometheus Metrics Engine",
                    "service_type": "Telemetry API",
                    "environment": "Production",
                    "target_url": "https://metrics.thoughtminds.ai",
                },
                {
                    "service_name": "Staging Cluster Controller",
                    "service_type": "Controller",
                    "environment": "Staging",
                    "target_url": "https://staging-controller.thoughtminds.ai",
                },
            ],
        },
        {
            "title": "Autonomous Customer Service Agent Swarm",
            "description": "Orchestrated swarm of specialized autonomous cognitive agents handling tier-1 customer inquiries, warranty verification, order fulfillment, and seamless handoff to human support specialists.",
            "lead_name": "Elena Rostova",
            "category_names": ["Autonomous Agents & Robotics", "Generative AI & LLMs"],
            "repository_url": "https://github.com/thoughtminds/customer-service-agent-swarm",
            "tech_stack": [
                "Python",
                "FastAPI",
                "LangGraph",
                "Redis",
                "Kafka",
                "Next.js",
                "TailwindCSS",
            ],
            "key_capabilities": [
                {
                    "title": "Multi-Agent Triage & Specialization",
                    "description": "Domain-specific agents for billing, technical troubleshooting, refunds, and warranties.",
                },
                {
                    "title": "Human-in-the-Loop Escalation",
                    "description": "Contextual handoff with summarized dialogue, sentiment trajectory, and recommended actions.",
                },
                {
                    "title": "Empathetic Tone Modulation",
                    "description": "Dynamic response tone adaptation based on real-time sentiment telemetry.",
                },
                {
                    "title": "Omnichannel State Synchronization",
                    "description": "Preserves unified customer session state across WhatsApp, Webchat, Zendesk, and SMS.",
                },
            ],
            "accent": (245, 158, 11),
            "doc_specs": [
                (
                    "Cognitive Agent Swarm Specification",
                    "Multi-agent coordination protocol, state machines, and consensus algorithms.",
                    "PDF",
                ),
                (
                    "Omnichannel SDK Integration Guide",
                    "Client-side library integration for web widgets, mobile iOS/Android, and webhooks.",
                    "DOCX",
                ),
                (
                    "Customer Experience Leadership Presentation",
                    "Executive deck demonstrating CSAT improvement from 78% to 94% and 70% triage automation.",
                    "PPTX",
                ),
                (
                    "Agent CSAT & SLA Performance Matrix",
                    "Comprehensive metrics spreadsheet tracking first-contact resolution and deflection rates.",
                    "XLSX",
                ),
            ],
            "video_spec": (
                "Live Swarm Triage & Customer Handoff",
                "Interactive session showing multi-agent handoff, CRM record updates, and instant escalation.",
                5,
            ),
            "service_urls": [
                {
                    "service_name": "Omnichannel Agent Portal",
                    "service_type": "Frontend",
                    "environment": "Production",
                    "target_url": "https://agent-swarm.thoughtminds.ai",
                },
                {
                    "service_name": "Real-time WebSocket Gateway",
                    "service_type": "Streaming API",
                    "environment": "Production",
                    "target_url": "wss://stream.thoughtminds.ai/cx",
                },
                {
                    "service_name": "Staging Sandbox UI",
                    "service_type": "Test Bed",
                    "environment": "Staging",
                    "target_url": "https://staging-cx.thoughtminds.ai",
                },
            ],
        },
        {
            "title": "Zero-Trust Identity Governance & Threat Defense",
            "description": "Continuous behavioral authentication, dynamic risk scoring, and eBPF kernel-level syscall inspection that detects lateral movement and automatically revokes compromised credentials.",
            "lead_name": "David Kim",
            "category_names": ["Cybersecurity & Identity Governance"],
            "repository_url": "https://github.com/thoughtminds/zero-trust-threat-defense",
            "tech_stack": [
                "Rust",
                "Python",
                "OpenID Connect",
                "eBPF",
                "PostgreSQL",
                "React",
                "Vault",
            ],
            "key_capabilities": [
                {
                    "title": "Continuous Risk Scoring",
                    "description": "Evaluates user velocity, device fingerprint, and behavioral keystroke dynamics in real time.",
                },
                {
                    "title": "Just-In-Time Privilege Elevation",
                    "description": "Issues 15-minute cryptographically verifiable ephemeral credentials for sensitive commands.",
                },
                {
                    "title": "eBPF Kernel Threat Inspection",
                    "description": "Real-time process, socket, and memory inspection detecting zero-day exploits and privilege escalation.",
                },
                {
                    "title": "Automated Compliance Audit Trail",
                    "description": "Immutable cryptographic event logs matching SOC2 Type II, ISO27001, and HIPAA mandates.",
                },
            ],
            "accent": (244, 63, 94),
            "doc_specs": [
                (
                    "Zero-Trust Architecture Blueprint",
                    "In-depth technical breakdown of identity proxies, policy engines, and eBPF probes.",
                    "PDF",
                ),
                (
                    "Security Hardening & Incident Runbook",
                    "Security operations guide with SOPs for automated isolation, key rotation, and triage.",
                    "DOCX",
                ),
                (
                    "CISO Executive Security Briefing",
                    "Cybersecurity risk matrix presentation for board-level risk committees and auditors.",
                    "PPTX",
                ),
                (
                    "Threat Matrix & Audit Log Analysis",
                    "Excel matrix categorizing 500+ threat vectors, severity ratings, and automated remediation rules.",
                    "XLSX",
                ),
            ],
            "video_spec": (
                "eBPF Kernel Threat Interception Demo",
                "Live simulation of lateral privilege escalation intercepted and neutralized in under 4ms.",
                5,
            ),
            "service_urls": [
                {
                    "service_name": "Security Operations Command",
                    "service_type": "Frontend",
                    "environment": "Production",
                    "target_url": "https://security.thoughtminds.ai",
                },
                {
                    "service_name": "HashiCorp Vault Telemetry",
                    "service_type": "Secret Management",
                    "environment": "Production",
                    "target_url": "https://vault.thoughtminds.ai",
                },
                {
                    "service_name": "Audit Log Collector",
                    "service_type": "SIEM Gateway",
                    "environment": "Staging",
                    "target_url": "https://staging-siem.thoughtminds.ai",
                },
            ],
        },
        {
            "title": "Streaming Lakehouse & Real-Time Analytics Pipeline",
            "description": "High-throughput sub-second streaming data pipeline built on Apache Iceberg, Kafka, and DuckDB. Delivers 500,000 events/second with ACID transaction guarantees and zero-copy query federation via Trino.",
            "lead_name": "Dr. Sarah Chen",
            "category_names": [
                "Data Engineering & Analytics",
                "Cloud Infrastructure & DevOps",
            ],
            "repository_url": "https://github.com/thoughtminds/streaming-lakehouse-pipeline",
            "tech_stack": [
                "Apache Spark",
                "Apache Kafka",
                "Apache Iceberg",
                "DuckDB",
                "Python",
                "Trino",
                "dbt",
            ],
            "key_capabilities": [
                {
                    "title": "Sub-Second Streaming Ingestion",
                    "description": "Ingests 500k+ events/sec into partitioned Iceberg tables with millisecond commit intervals.",
                },
                {
                    "title": "Unified Batch & Streaming Modeling",
                    "description": "Single declarative dbt transformation model governing both real-time streams and historical backfills.",
                },
                {
                    "title": "Automated Data Quality Gates",
                    "description": "In-flight schema validation, null checks, and automated quarantine of malformed JSON records.",
                },
                {
                    "title": "Zero-Copy Query Federation",
                    "description": "Trino query execution directly over Iceberg, S3/MinIO, and Postgres without ETL staging.",
                },
            ],
            "accent": (99, 102, 241),
            "doc_specs": [
                (
                    "Lakehouse Architecture Specification",
                    "Technical blueprint of stream partition algorithms, Iceberg metadata catalogs, and compactions.",
                    "PDF",
                ),
                (
                    "Streaming Pipeline Operator Manual",
                    "Cluster sizing, Kafka consumer group management, checkpoint tuning, and disaster recovery.",
                    "DOCX",
                ),
                (
                    "Enterprise Big Data Strategy Deck",
                    "Leadership presentation highlighting legacy data warehouse migration to modern open lakehouse.",
                    "PPTX",
                ),
                (
                    "Throughput & Query Latency Benchmarks",
                    "Detailed spreadsheet analyzing query P99s, compression ratios, and I/O IOPS throughput.",
                    "XLSX",
                ),
            ],
            "video_spec": (
                "Real-Time Streaming Pipeline in Action",
                "Visual demonstration of Kafka ingestion, dynamic Iceberg compaction, and Trino interactive queries.",
                5,
            ),
            "service_urls": [
                {
                    "service_name": "Lakehouse Query Explorer",
                    "service_type": "Frontend",
                    "environment": "Production",
                    "target_url": "https://lakehouse.thoughtminds.ai",
                },
                {
                    "service_name": "Trino SQL Distributed Engine",
                    "service_type": "SQL Gateway",
                    "environment": "Production",
                    "target_url": "https://trino.thoughtminds.ai",
                },
                {
                    "service_name": "Kafka Schema Registry",
                    "service_type": "Schema Registry",
                    "environment": "Staging",
                    "target_url": "https://staging-schema.thoughtminds.ai",
                },
            ],
        },
        {
            "title": "Edge Computer Vision Defect Inspection System",
            "description": "Ultra-low-latency computer vision model running on industrial edge devices. Classifies microscopic assembly line defects at 120 FPS with 99.8% precision, powered by TensorRT and few-shot anomaly detection.",
            "lead_name": "Marcus Vance",
            "category_names": ["Autonomous Agents & Robotics", "Generative AI & LLMs"],
            "repository_url": "https://github.com/thoughtminds/edge-vision-defect-inspection",
            "tech_stack": [
                "PyTorch",
                "ONNX Runtime",
                "CUDA",
                "FastAPI",
                "React",
                "OpenCV",
                "TensorRT",
            ],
            "key_capabilities": [
                {
                    "title": "Sub-Millimeter Defect Classification",
                    "description": "High-accuracy defect localization running on 120 FPS high-speed industrial conveyor cameras.",
                },
                {
                    "title": "Edge-Optimized TensorRT Inference",
                    "description": "Quantized FP16/INT8 inference running locally on NVIDIA Jetson and x86 IPCs with <8ms latency.",
                },
                {
                    "title": "Few-Shot Anomaly Learning",
                    "description": "Adapts to brand new manufacturing SKU parts with as few as 10 baseline reference photos.",
                },
                {
                    "title": "Factory Floor Operator HUD",
                    "description": "Real-time bounding box overlay, thermal heatmaps, and audio buzzer alerts for floor supervisors.",
                },
            ],
            "accent": (20, 184, 166),
            "doc_specs": [
                (
                    "Edge Vision Architecture Whitepaper",
                    "Hardware acceleration specs, camera optics calibration, and real-time bounding box pipelines.",
                    "PDF",
                ),
                (
                    "Industrial Camera & PLC Wiring Guide",
                    "Industrial automation wiring diagram, GPIO trigger integration, and strobe synchronization.",
                    "DOCX",
                ),
                (
                    "Factory Automation Pitch Deck",
                    "Business pitch demonstrating 84% reduction in manual inspection labor and scrap reduction.",
                    "PPTX",
                ),
                (
                    "Yield Improvement & Defect Rate Analysis",
                    "Manufacturing analytics spreadsheet showing defect yield trends across 6 assembly shifts.",
                    "XLSX",
                ),
            ],
            "video_spec": (
                "120 FPS High-Speed Defect Inspection Demo",
                "High-speed video capture showing micro-crack detection on industrial PCBs with bounding box highlights.",
                5,
            ),
            "service_urls": [
                {
                    "service_name": "Factory Floor HUD Dashboard",
                    "service_type": "Frontend",
                    "environment": "Production",
                    "target_url": "https://vision.thoughtminds.ai",
                },
                {
                    "service_name": "Edge Camera Stream API",
                    "service_type": "Inference API",
                    "environment": "Production",
                    "target_url": "https://edge-vision.thoughtminds.ai/api",
                },
                {
                    "service_name": "Model Retraining Lab",
                    "service_type": "Training Lab",
                    "environment": "Staging",
                    "target_url": "https://staging-vision-lab.thoughtminds.ai",
                },
            ],
        },
    ]

    created_solutions: list[dict[str, Any]] = []

    for s_idx, spec in enumerate(solutions_spec, start=1):
        slug = f"sol_{s_idx}_{spec['title'][:20].lower().replace(' ', '_').replace('&', 'and')}"
        print(f"\nProcessing Solution {s_idx}/{len(solutions_spec)}: {spec['title']}")

        # 1. Main Thumbnail Image
        thumb_path = TEMP_DIR / f"{slug}_thumb.png"
        create_banner_image(
            filepath=thumb_path,
            title=spec["title"],
            subtitle=spec["description"][:100] + "...",
            tag="SOLUTION ARCHITECTURE",
            c1=(15, 23, 42),
            c2=(30, 41, 59),
            accent=spec["accent"],
            width=1200,
            height=675,
        )
        thumb_upload = tester.upload_file(thumb_path, folder="solutions/thumbnails")

        # 2. Hover Preview Animated GIF
        preview_path = TEMP_DIR / f"{slug}_preview.gif"
        create_animated_gif(
            filepath=preview_path,
            title=spec["title"][:35],
            tag="INTERACTIVE PREVIEW",
            accent=spec["accent"],
            frames_count=14,
            width=640,
            height=360,
        )
        preview_upload = tester.upload_file(preview_path, folder="solutions/previews")

        # 3. Documents (PDF, DOCX, PPTX, XLSX)
        uploaded_documents = []
        for doc_name, doc_desc, doc_fmt in spec["doc_specs"]:
            table_headers = ["Component", "Specification", "Target SLA", "Status"]
            table_rows = [
                ["API Gateway", "FastAPI / Envoy Proxy", "< 15ms P99", "OPERATIONAL"],
                [
                    "Compute Engine",
                    "Kubernetes / Jetson Edge",
                    "99.99% Uptime",
                    "OPERATIONAL",
                ],
                [
                    "Data Store",
                    "PostgreSQL / Iceberg / Qdrant",
                    "ACID Compliant",
                    "SYNCHRONIZED",
                ],
                [
                    "Telemetry",
                    "Prometheus / OpenTelemetry",
                    "Real-time Metrics",
                    "HEALTHY",
                ],
            ]
            sections = [
                (
                    "1. Architecture Overview",
                    f"The {spec['title']} provides high-availability enterprise services designed to satisfy strict performance and governance mandates.",
                ),
                (
                    "2. High Availability & Resilience",
                    "Featuring distributed redundancy, automated failover mechanisms, and self-healing worker pools to eliminate single points of failure.",
                ),
                (
                    "3. Security & Access Governance",
                    "Strict least-privilege RBAC, cryptographic token verification, and automated compliance auditing across all endpoints.",
                ),
            ]

            if doc_fmt == "PDF":
                doc_path = TEMP_DIR / f"{slug}_whitepaper.pdf"
                create_pdf_document(
                    filepath=doc_path,
                    title=doc_name,
                    subtitle=spec["title"],
                    abstract=spec["description"],
                    sections=sections,
                    table_headers=table_headers,
                    table_rows=table_rows,
                )
            elif doc_fmt == "DOCX":
                doc_path = TEMP_DIR / f"{slug}_deployment_guide.docx"
                create_docx_document(
                    filepath=doc_path,
                    title=doc_name,
                    subtitle=spec["title"],
                    sections=sections,
                    table_headers=table_headers,
                    table_rows=table_rows,
                )
            elif doc_fmt == "PPTX":
                doc_path = TEMP_DIR / f"{slug}_executive_deck.pptx"
                slides_info = [
                    {
                        "title": "Executive Summary & Differentiators",
                        "bullets": [
                            f"State-of-the-art implementation: {spec['title']}",
                            "Drastic reduction in operational overhead and manual intervention.",
                            "Fully integrated with Conforge Solutions Hub management plane.",
                            "Compliant with SOC2 Type II, ISO27001, and enterprise security policies.",
                        ],
                    },
                    {
                        "title": "Technical Architecture & Tech Stack",
                        "bullets": [
                            f"Core technology foundation: {', '.join(spec['tech_stack'])}"
                        ],
                    },
                    {
                        "title": "Production Deployment & Next Milestones",
                        "bullets": [
                            "Phase 1: Pilot sandbox validation and load tests completed successfully.",
                            "Phase 2: Production cluster roll-out with multi-region replication.",
                            "Phase 3: Continuous automated optimization and self-healing telemetry.",
                        ],
                    },
                ]
                create_pptx_deck(
                    filepath=doc_path,
                    title=doc_name,
                    subtitle=spec["title"],
                    slides_info=slides_info,
                )
            elif doc_fmt == "XLSX":
                doc_path = TEMP_DIR / f"{slug}_benchmarks.xlsx"
                sheets_data = [
                    {
                        "name": "Performance Latency",
                        "headers": [
                            "Request Type",
                            "Payload Size",
                            "Concurrency",
                            "P50 Latency (ms)",
                            "P99 Latency (ms)",
                            "Success Rate",
                        ],
                        "rows": [
                            [
                                "Read Query",
                                "256 KB",
                                "1,000 req/s",
                                "4.2",
                                "12.8",
                                "99.99%",
                            ],
                            [
                                "Vector Search",
                                "1.5 MB",
                                "500 req/s",
                                "8.6",
                                "18.4",
                                "99.98%",
                            ],
                            [
                                "Batch Ingest",
                                "50 MB",
                                "50 streams",
                                "45.0",
                                "98.2",
                                "100.00%",
                            ],
                            [
                                "Full Audit Scan",
                                "500 MB",
                                "10 workers",
                                "120.5",
                                "250.0",
                                "99.95%",
                            ],
                        ],
                    },
                    {
                        "name": "Cost & TCO Analysis",
                        "headers": [
                            "Expense Category",
                            "Baseline Cost ($/mo)",
                            "Optimized Cost ($/mo)",
                            "Net Monthly Savings ($)",
                            "Reduction (%)",
                        ],
                        "rows": [
                            ["EC2 Compute", "$18,500", "$6,800", "$11,700", "63.2%"],
                            ["EBS & S3 Storage", "$6,200", "$3,100", "$3,100", "50.0%"],
                            ["Data Transfer", "$4,100", "$2,050", "$2,050", "50.0%"],
                            [
                                "Total Infrastructure",
                                "$28,800",
                                "$11,950",
                                "$16,850",
                                "58.5%",
                            ],
                        ],
                    },
                ]
                create_xlsx_sheet(
                    filepath=doc_path,
                    title=doc_name,
                    sheets=sheets_data,
                )

            uploaded_file = tester.upload_file(doc_path, folder="solutions/documents")
            uploaded_documents.append(
                {
                    "name": doc_name,
                    "description": doc_desc,
                    "format": doc_fmt,
                    "file_size_bytes": uploaded_file["file_size_bytes"],
                    "file_url": uploaded_file["url"],
                }
            )

        # 4. Videos (MP4) & Video Thumbnails
        vid_title, vid_desc, vid_dur = spec["video_spec"]
        vid_thumb_path = TEMP_DIR / f"{slug}_video_thumb.png"
        create_banner_image(
            filepath=vid_thumb_path,
            title=vid_title,
            subtitle="HD 1080p // Live Architecture Video",
            tag="DEMO VIDEO",
            c1=(15, 23, 42),
            c2=(30, 41, 59),
            accent=spec["accent"],
            width=1280,
            height=720,
        )
        vid_thumb_upload = tester.upload_file(
            vid_thumb_path, folder="solutions/video_thumbnails"
        )

        vid_path = TEMP_DIR / f"{slug}_demo.mp4"
        create_demo_video(
            filepath=vid_path,
            title=spec["title"][:40],
            subtitle=vid_title,
            accent=spec["accent"],
            duration_secs=vid_dur,
        )
        vid_upload = tester.upload_file(vid_path, folder="solutions/videos")

        uploaded_videos = [
            {
                "title": vid_title,
                "description": vid_desc,
                "thumbnail_url": vid_thumb_upload["url"],
                "video_url": vid_upload["url"],
                "duration_seconds": vid_dur,
            }
        ]

        # 5. Service URLs
        service_urls = spec["service_urls"]

        # 6. Map category IDs and Lead ID
        cat_ids = [
            created_categories[cname]
            for cname in spec["category_names"]
            if cname in created_categories
        ]
        lead_id = created_leads.get(spec["lead_name"])

        # 7. Create Solution via API
        payload = {
            "title": spec["title"],
            "description": spec["description"],
            "thumbnail_url": thumb_upload["url"],
            "preview_url": preview_upload["url"],
            "repository_url": spec["repository_url"],
            "tech_stack": spec["tech_stack"],
            "key_capabilities": spec["key_capabilities"],
            "lead_id": lead_id,
            "category_ids": cat_ids,
            "documents": uploaded_documents,
            "videos": uploaded_videos,
            "service_urls": service_urls,
        }

        sol_resp = tester.create_solution(payload)
        created_solutions.append(sol_resp)

    # --------------------------------------------------------------------------
    # STEP 6: TEST SOLUTIONS GET, FILTER, RECENT, DETAIL, UPDATE, DELETE
    # --------------------------------------------------------------------------
    print("\n>>> Testing Solution Query & CRUD Endpoints...")
    all_sols = tester.get_solutions()
    recent_sols = tester.get_recent_solutions()

    # Filter solutions by first category
    first_cat_id = list(created_categories.values())[0]
    filtered_sols = tester.get_solutions(category_id=first_cat_id)

    # Detailed solution query for the first solution
    first_sol_id = str(created_solutions[0]["id"])
    sol_detail = tester.get_solution(first_sol_id)

    # Create temporary solution to test PUT and DELETE
    temp_sol_thumb = TEMP_DIR / "temp_sol_thumb.png"
    create_banner_image(
        temp_sol_thumb,
        "Temp Solution",
        "For deletion test",
        "TEMP",
        width=600,
        height=400,
    )
    temp_sol_thumb_upload = tester.upload_file(temp_sol_thumb, folder="temp")
    temp_sol = tester.create_solution(
        {
            "title": "Temporary Disposable Solution",
            "description": "Created exclusively to test update and deletion endpoints.",
            "thumbnail_url": temp_sol_thumb_upload["url"],
            "tech_stack": ["Python", "Docker"],
        }
    )
    temp_sol_id = str(temp_sol["id"])
    tester.update_solution(
        temp_sol_id, {"title": "Temporary Disposable Solution (Updated Title)"}
    )
    tester.delete_solution(temp_sol_id)

    # --------------------------------------------------------------------------
    # STEP 7: CONVERSATION & CHAT STREAM ENDPOINTS
    # --------------------------------------------------------------------------
    print("\n>>> Testing Conversation & Streaming Chat Endpoints...")
    conv = tester.create_conversation("AI Architecture Exploration")
    conv_id = str(conv["id"])

    tester.list_conversations()
    tester.get_conversation(conv_id)
    tester.update_conversation(conv_id, "Enterprise Architecture Consultation")

    # Test Chat Stream (orchestrated AI chat invoking tools)
    print("Testing chat stream endpoint (running LangGraph agent)...")
    chat_events = tester.stream_chat(
        message="What enterprise solutions are available in Conforge Solutions Hub, and what is the tech stack of the Enterprise Neural Search platform?",
        conv_id=conv_id,
    )
    print(f"Chat stream completed with {len(chat_events)} response lines.")

    # Retrieve stored messages
    tester.get_messages(conv_id)

    # Test deletion of a disposable conversation
    temp_conv = tester.create_conversation("Disposable Conversation")
    tester.delete_conversation(str(temp_conv["id"]))

    # --------------------------------------------------------------------------
    # STEP 8: DASHBOARD AGGREGATED METRICS
    # --------------------------------------------------------------------------
    print("\n>>> Testing Dashboard Stats Endpoint...")
    stats = tester.get_dashboard_stats(recent_limit=6)
    print("Dashboard Totals:", json.dumps(stats.get("totals"), indent=2))
    print(
        "Categories Distribution:",
        json.dumps(stats.get("categories_distribution"), indent=2),
    )

    # --------------------------------------------------------------------------
    # SUMMARY OF RESULTS
    # --------------------------------------------------------------------------
    print("\n" + "=" * 80)
    print(" ENDPOINT VERIFICATION SUMMARY")
    print("=" * 80)
    total_calls = len(tester.test_results)
    success_calls = sum(1 for r in tester.test_results if r["success"])
    print(f"Total API Calls Executed : {total_calls}")
    print(f"Successful Calls         : {success_calls}")
    print(f"Failed Calls             : {total_calls - success_calls}")
    print(f"Overall Success Rate     : {(success_calls / total_calls) * 100:.1f}%\n")

    endpoints_covered = sorted(
        list(set(f"{r['method']} {r['endpoint']}" for r in tester.test_results))
    )
    print(
        f"Endpoints Thoroughly Tested ({len(endpoints_covered)} distinct signatures):"
    )
    for ep in endpoints_covered:
        print(f"  • {ep}")

    print(
        "\nDatabase is populated with real working images, GIFs, MP4 videos, PDFs, PPTXs, DOCXs, and XLSXs!"
    )


if __name__ == "__main__":
    main()
