"""Seed mock solutions for TM Solution Hub."""

from pathlib import Path
import sys
from typing import Any, cast

# Ensure project root is in sys.path when script is executed directly
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.database import SessionLocal
from app.models.category import Category
from app.models.solution import (
    Solution,
    SolutionDocument,
    SolutionServiceUrl,
    SolutionVideo,
)
from app.models.solution_category_association import SolutionCategoryAssociation
from app.models.user import User


def seed_mock_solutions() -> None:
    with SessionLocal() as db:
        # Fetch lead admin user
        admin_user = (
            db.query(User).filter(User.email == "admin@thoughtminds.ai").first()
        )
        if not admin_user:
            admin_user = db.query(User).first()

        # Fetch category map
        all_categories: dict[str, Category] = {
            c.name: c for c in db.query(Category).all()
        }

        # Update category icons and thumbnails
        category_metadata: dict[str, dict[str, str]] = {
            "Artificial Intelligence": {
                "icon": "Brain",
                "thumbnail_url": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80",
            },
            "Cloud Infrastructure": {
                "icon": "Cloud",
                "thumbnail_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
            },
            "Cybersecurity": {
                "icon": "ShieldCheck",
                "thumbnail_url": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80",
            },
            "Finance and Accounting": {
                "icon": "Landmark",
                "thumbnail_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
            },
            "Customer Experience": {
                "icon": "Users",
                "thumbnail_url": "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80",
            },
            "Data Analytics": {
                "icon": "BarChart3",
                "thumbnail_url": "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&auto=format&fit=crop&q=80",
            },
            "DevOps and Automation": {
                "icon": "Workflow",
                "thumbnail_url": "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop&q=80",
            },
        }
        for cat_name, meta in category_metadata.items():
            if cat_name in all_categories:
                cat = all_categories[cat_name]
                cat.icon = meta["icon"]
                cat.thumbnail_url = meta["thumbnail_url"]

        mock_solutions: list[dict[str, Any]] = [
            {
                "title": "Agentic Document Intelligence Platform",
                "description": (
                    "An enterprise-grade document processing suite built for banking and insurance. "
                    "It utilizes OCR, layout parsing, and autonomous agent verification to extract and "
                    "structure complex PDFs and scanned forms into downstream ERP and core banking systems."
                ),
                "thumbnail_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
                "preview_url": "https://www.w3schools.com/html/mov_bbb.mp4",
                "repository_url": "https://github.com/thoughtminds/agentic-doc-intel",
                "tech_stack": [
                    "Python",
                    "FastAPI",
                    "PostgreSQL",
                    "Docker",
                    "PyTorch",
                    "Redis",
                ],
                "key_capabilities": [
                    {
                        "name": "Multi-Modal OCR",
                        "description": "High-accuracy text and tabular extraction from low-resolution scans.",
                    },
                    {
                        "name": "Autonomous Verification",
                        "description": "Secondary AI agent audit to cross-check extracted numbers with confidence scores.",
                    },
                    {
                        "name": "Webhook Alerts",
                        "description": "Real-time dispatch of parsed payloads to core banking APIs.",
                    },
                ],
                "categories": ["Artificial Intelligence", "Finance and Accounting"],
                "documents": [
                    {
                        "name": "Architecture Specification v2",
                        "description": "High-level component diagrams, security boundary, and data flow.",
                        "format": "PDF",
                        "file_size_bytes": 4500000,
                        "file_url": "https://s3.amazonaws.com/tm-assets/docs/PRJ-TM-2026-01-arch.pdf",
                    },
                    {
                        "name": "Security and Compliance Audit",
                        "description": "SOC2 and GDPR compliance certification and penetration testing report.",
                        "format": "PDF",
                        "file_size_bytes": 2100000,
                        "file_url": "https://s3.amazonaws.com/tm-assets/docs/PRJ-TM-2026-01-security.pdf",
                    },
                ],
                "videos": [
                    {
                        "title": "End-to-End Extraction Walkthrough",
                        "description": "Demonstrates uploading a noisy scanned invoice and viewing structured JSON output in under 3 seconds.",
                        "thumbnail_url": "https://s3.amazonaws.com/tm-assets/thumbs/doc-intel-demo.jpg",
                        "video_url": "https://vimeo.com/tm-demos/doc-intel",
                        "duration_seconds": 340,
                    }
                ],
                "service_urls": [
                    {
                        "service_name": "API Docs (Swagger)",
                        "service_type": "API",
                        "environment": "Production",
                        "target_url": "https://doc-intel.prod.thoughtminds.ai/docs",
                    },
                    {
                        "service_name": "Admin Console",
                        "service_type": "Frontend",
                        "environment": "Production",
                        "target_url": "https://doc-intel.prod.thoughtminds.ai",
                    },
                ],
            },
            {
                "title": "Cloud Infrastructure FinOps Guardrail",
                "description": (
                    "Monitors AWS, GCP, and Azure resource utilization continuously, forecasting monthly spend "
                    "and automatically terminating orphaned or over-provisioned staging workloads."
                ),
                "thumbnail_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
                "preview_url": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDkxaTJ1NWp5enJleXZobWc5eG56enZ6eWRicnNsdW53bzNjcHB1aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oKIPnAiaMCws8nOsE/giphy.gif",
                "repository_url": "https://github.com/thoughtminds/finops-guardrail",
                "tech_stack": [
                    "Go",
                    "FastAPI",
                    "Kubernetes",
                    "Prometheus",
                    "PostgreSQL",
                    "React",
                ],
                "key_capabilities": [
                    {
                        "name": "Multi-Cloud Ingestion",
                        "description": "Pulls billing metrics from AWS CUR and GCP BigQuery billing exports.",
                    },
                    {
                        "name": "Automated Rightsizing",
                        "description": "One-click recommendation engine for Kubernetes pod requests and limits.",
                    },
                ],
                "categories": ["Cloud Infrastructure", "DevOps and Automation"],
                "documents": [
                    {
                        "name": "Deployment Guide",
                        "description": "Terraform modules and Helm chart instructions.",
                        "format": "DOCX",
                        "file_size_bytes": 1200000,
                        "file_url": "https://s3.amazonaws.com/tm-assets/docs/finops-deploy.docx",
                    }
                ],
                "videos": [],
                "service_urls": [
                    {
                        "service_name": "Staging Dashboard",
                        "service_type": "Frontend",
                        "environment": "Staging",
                        "target_url": "https://finops-staging.thoughtminds.ai",
                    }
                ],
            },
            {
                "title": "Real-Time Payment Fraud Shield",
                "description": (
                    "High-throughput transaction scoring microservice with graph neural network support "
                    "for detecting mule account rings, credential stuffing, and unusual card velocity patterns."
                ),
                "thumbnail_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
                "preview_url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
                "repository_url": "https://github.com/thoughtminds/fraud-shield",
                "tech_stack": [
                    "Python",
                    "FastAPI",
                    "Kafka",
                    "Redis",
                    "PostgreSQL",
                    "Docker",
                ],
                "key_capabilities": [
                    {
                        "name": "Sub-20ms Scoring",
                        "description": "Streaming feature store evaluated via lightweight ONNX model runtime.",
                    },
                    {
                        "name": "Graph Ring Detection",
                        "description": "Identifies syndicated mule accounts in real-time.",
                    },
                ],
                "categories": [
                    "Cybersecurity",
                    "Finance and Accounting",
                    "Data Analytics",
                ],
                "documents": [
                    {
                        "name": "Latency Benchmarks",
                        "description": "Performance evaluation across 50,000 transactions per second.",
                        "format": "PDF",
                        "file_size_bytes": 3100000,
                        "file_url": "https://s3.amazonaws.com/tm-assets/docs/fraud-benchmarks.pdf",
                    }
                ],
                "videos": [],
                "service_urls": [
                    {
                        "service_name": "Dev Swagger API",
                        "service_type": "API",
                        "environment": "Development",
                        "target_url": "https://fraud-dev.thoughtminds.ai/docs",
                    }
                ],
            },
            {
                "title": "Autonomous Customer Copilot & Agent Router",
                "description": (
                    "Provides Tier-1 and Tier-2 automated support across Zendesk, Slack, and web chat. "
                    "Leverages vector embeddings over enterprise wikis, semantic cache for low latency, "
                    "and fallback human agent handoff."
                ),
                "thumbnail_url": "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format&fit=crop&q=80",
                "preview_url": "https://upload.wikimedia.org/wikipedia/commons/d/d3/Newtons_cradle_animation_book_2.gif",
                "repository_url": "https://github.com/thoughtminds/agentic-customer-copilot",
                "tech_stack": [
                    "Python",
                    "FastAPI",
                    "LangChain",
                    "Qdrant",
                    "Redis",
                    "OpenAI",
                    "React",
                ],
                "key_capabilities": [
                    {
                        "name": "Semantic Caching",
                        "description": "Sub-15ms response for previously answered enterprise inquiries.",
                    },
                    {
                        "name": "Agentic Tool Use",
                        "description": "Direct integration with CRM and billing databases via OpenAPI schema execution.",
                    },
                    {
                        "name": "Guardrail Filtering",
                        "description": "PII masking and hallucination deterrence checks on all generations.",
                    },
                ],
                "categories": ["Artificial Intelligence", "Customer Experience"],
                "documents": [
                    {
                        "name": "Customer Copilot Whitepaper",
                        "description": "System architecture, hybrid search recall benchmarks, and SLA impact.",
                        "format": "PDF",
                        "file_size_bytes": 3800000,
                        "file_url": "https://s3.amazonaws.com/tm-assets/docs/copilot-whitepaper.pdf",
                    },
                    {
                        "name": "Integration & Webhook Specs",
                        "description": "JSON event schemas and webhook authentication guide.",
                        "format": "DOCX",
                        "file_size_bytes": 1100000,
                        "file_url": "https://s3.amazonaws.com/tm-assets/docs/copilot-integrations.docx",
                    },
                    {
                        "name": "Safety Benchmark Report",
                        "description": "Red-teaming evaluation on prompt injections and jailbreaks.",
                        "format": "PDF",
                        "file_size_bytes": 2400000,
                        "file_url": "https://s3.amazonaws.com/tm-assets/docs/copilot-safety.pdf",
                    },
                ],
                "videos": [
                    {
                        "title": "Live Agent Handoff Demo",
                        "description": "Shows escalation flow from autonomous bot to human agent in Slack.",
                        "thumbnail_url": "https://s3.amazonaws.com/tm-assets/thumbs/copilot-demo.jpg",
                        "video_url": "https://vimeo.com/tm-demos/copilot-handoff",
                        "duration_seconds": 215,
                    },
                    {
                        "title": "Qdrant Vector Tuning Deep Dive",
                        "description": "Explains hybrid dense-sparse vector scoring for technical documentation.",
                        "thumbnail_url": "https://s3.amazonaws.com/tm-assets/thumbs/vector-tuning.jpg",
                        "video_url": "https://vimeo.com/tm-demos/qdrant-tuning",
                        "duration_seconds": 480,
                    },
                ],
                "service_urls": [
                    {
                        "service_name": "Production Webhook Endpoint",
                        "service_type": "API",
                        "environment": "Production",
                        "target_url": "https://copilot-api.thoughtminds.ai/v1/events",
                    },
                    {
                        "service_name": "Playground Sandbox",
                        "service_type": "Frontend",
                        "environment": "Staging",
                        "target_url": "https://copilot-playground.thoughtminds.ai",
                    },
                ],
            },
            {
                "title": "Enterprise Vision QA & Defect Inspection",
                "description": (
                    "Real-time surface defect anomaly detection processing 120 FPS high-resolution camera feeds "
                    "with TensorRT-optimized YOLOv11 and vision transformer backbones."
                ),
                "thumbnail_url": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80",
                "preview_url": None,
                "repository_url": "https://github.com/thoughtminds/vision-defect-inspect",
                "tech_stack": [
                    "Python",
                    "C++",
                    "PyTorch",
                    "TensorRT",
                    "CUDA",
                    "FastAPI",
                    "Docker",
                ],
                "key_capabilities": [
                    {
                        "name": "Sub-8ms Inference",
                        "description": "Optimized FP16 TensorRT engine running directly on edge industrial gateways.",
                    },
                    {
                        "name": "Active Learning Loop",
                        "description": "Auto-annotates ambiguous frames and syncs with cloud retraining queues.",
                    },
                ],
                "categories": ["Artificial Intelligence"],
                "documents": [
                    {
                        "name": "Edge Hardware Compatibility Matrix",
                        "description": "Tested camera sensors, edge GPU specifications, and thermal limits.",
                        "format": "PDF",
                        "file_size_bytes": 890000,
                        "file_url": "https://s3.amazonaws.com/tm-assets/docs/vision-edge-matrix.pdf",
                    }
                ],
                "videos": [
                    {
                        "title": "120 FPS PCB Anomaly Detection",
                        "description": "Microscopic solder bridging identified at full conveyer belt speed.",
                        "thumbnail_url": "https://s3.amazonaws.com/tm-assets/thumbs/pcb-vision.jpg",
                        "video_url": "https://vimeo.com/tm-demos/vision-pcb",
                        "duration_seconds": 120,
                    }
                ],
                "service_urls": [
                    {
                        "service_name": "Edge Telemetry Dashboard",
                        "service_type": "Frontend",
                        "environment": "Staging",
                        "target_url": "https://vision-telemetry.thoughtminds.ai",
                    }
                ],
            },
            {
                "title": "Multimodal Medical Summarizer & Clinical Scribe",
                "description": (
                    "Listens to patient-physician consultations, separates speaker diarization tracks, "
                    "and generates HIPAA-compliant SOAP notes formatted directly for Epic and Cerner EHR APIs."
                ),
                "thumbnail_url": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80",
                "preview_url": "https://www.w3schools.com/tags/movie.mp4",
                "repository_url": "https://github.com/thoughtminds/clinical-scribe-ai",
                "tech_stack": [
                    "Python",
                    "Whisper",
                    "PyTorch",
                    "FastAPI",
                    "PostgreSQL",
                    "Next.js",
                ],
                "key_capabilities": [
                    {
                        "name": "Acoustic Noise Suppression",
                        "description": "Clear clinical voice isolation in noisy emergency room environments.",
                    },
                    {
                        "name": "FHIR Resource Output",
                        "description": "Formats clinical entities into standard HL7 FHIR JSON structures.",
                    },
                ],
                "categories": ["Artificial Intelligence"],
                "documents": [],
                "videos": [],
                "service_urls": [
                    {
                        "service_name": "Physician Review Portal",
                        "service_type": "Frontend",
                        "environment": "Development",
                        "target_url": "https://scribe-dev.thoughtminds.ai",
                    }
                ],
            },
            {
                "title": "Codebase Modernization & AST Synthesizer",
                "description": (
                    "Combines tree-sitter Abstract Syntax Tree (AST) deterministic parsing with frontier LLM code synthesis "
                    "to migrate monolithic enterprise codebases to microservices with 99.4% unit test parity."
                ),
                "repository_url": "https://github.com/thoughtminds/codebase-modernizer",
                "tech_stack": [
                    "Rust",
                    "TypeScript",
                    "Python",
                    "Tree-sitter",
                    "Docker",
                    "Neo4j",
                ],
                "key_capabilities": [
                    {
                        "name": "Deterministic AST Transpilation",
                        "description": "Guarantees semantic equality for arithmetic and data layout routines.",
                    },
                    {
                        "name": "Automated Unit Test Generator",
                        "description": "Synthesizes comprehensive test suites asserting equivalence.",
                    },
                    {
                        "name": "Dependency Graph Visualizer",
                        "description": "Maps legacy circular dependencies into clean layered modules.",
                    },
                ],
                "categories": ["Artificial Intelligence", "DevOps and Automation"],
                "documents": [
                    {
                        "name": "Modernization Architecture Guide",
                        "description": "Pipeline stages, AST validation rules, and CI deployment.",
                        "format": "PDF",
                        "file_size_bytes": 5200000,
                        "file_url": "https://s3.amazonaws.com/tm-assets/docs/modernizer-guide.pdf",
                    }
                ],
                "videos": [],
                "service_urls": [
                    {
                        "service_name": "Synthesizer Web Studio",
                        "service_type": "Frontend",
                        "environment": "Production",
                        "target_url": "https://modernize.prod.thoughtminds.ai",
                    },
                    {
                        "service_name": "AST Analysis Engine",
                        "service_type": "API",
                        "environment": "Production",
                        "target_url": "https://modernize-api.prod.thoughtminds.ai/v1/ast",
                    },
                ],
            },
            {
                "title": "Conversational Financial Research & SEC Filing Agent",
                "description": (
                    "Ingests SEC 10-K, 10-Q, and 8-K filings within 60 seconds of publication, cross-referencing footnotes "
                    "and earnings call audio to identify guidance changes and anomalies."
                ),
                "thumbnail_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
                "preview_url": "https://upload.wikimedia.org/wikipedia/commons/7/71/ChessPawnSpecialMoves.gif",
                "repository_url": "https://github.com/thoughtminds/sec-financial-agent",
                "tech_stack": [
                    "Python",
                    "FastAPI",
                    "ChromaDB",
                    "DuckDB",
                    "Streamlit",
                ],
                "key_capabilities": [
                    {
                        "name": "Tabular Financial Reasoning",
                        "description": "Parses complex balance sheet footnotes and recalculates EBITDA adjustments.",
                    }
                ],
                "categories": [
                    "Artificial Intelligence",
                    "Finance and Accounting",
                    "Data Analytics",
                ],
                "documents": [
                    {
                        "name": "SEC Extraction Accuracy Evaluation",
                        "description": "Benchmark across 500 S&P 500 company filings.",
                        "format": "PDF",
                        "file_size_bytes": 1800000,
                        "file_url": "https://s3.amazonaws.com/tm-assets/docs/sec-accuracy.pdf",
                    },
                    {
                        "name": "Earnings Call Audio Benchmark",
                        "description": "Speaker attribution accuracy across earnings calls.",
                        "format": "PDF",
                        "file_size_bytes": 950000,
                        "file_url": "https://s3.amazonaws.com/tm-assets/docs/earnings-benchmark.pdf",
                    },
                ],
                "videos": [
                    {
                        "title": "Earnings Transcript Real-Time Analysis",
                        "description": "Live ingestion of Q4 earnings audio with instant summary.",
                        "thumbnail_url": "https://s3.amazonaws.com/tm-assets/thumbs/earnings-demo.jpg",
                        "video_url": "https://vimeo.com/tm-demos/earnings-analysis",
                        "duration_seconds": 180,
                    }
                ],
                "service_urls": [],
            },
            {
                "title": "Generative UI & Adaptive Schema Engine",
                "description": (
                    "Renders adaptive interfaces tailored to ad-hoc user query outputs without manual frontend development."
                ),
                "repository_url": "https://github.com/thoughtminds/gen-ui-engine",
                "tech_stack": [
                    "TypeScript",
                    "React",
                    "Tailwind CSS",
                    "Zod",
                    "WebSockets",
                ],
                "key_capabilities": [],
                "categories": ["Artificial Intelligence"],
                "documents": [],
                "videos": [],
                "service_urls": [
                    {
                        "service_name": "GenUI Preview Studio",
                        "service_type": "Frontend",
                        "environment": "Development",
                        "target_url": "https://genui-dev.thoughtminds.ai",
                    }
                ],
            },
        ]

        seeded_count = 0
        for item in mock_solutions:
            sol_title = str(item["title"])
            existing = db.query(Solution).filter(Solution.title == sol_title).first()
            if existing:
                existing.thumbnail_url = item.get("thumbnail_url")
                existing.preview_url = item.get("preview_url")
                print(f"Updated media for existing solution: {sol_title}")
                continue

            category_names = cast(list[str], item.pop("categories", []))
            documents_data = cast(list[dict[str, Any]], item.pop("documents", []))
            videos_data = cast(list[dict[str, Any]], item.pop("videos", []))
            service_urls_data = cast(list[dict[str, Any]], item.pop("service_urls", []))

            solution = Solution(
                **item,
                lead_id=admin_user.id if admin_user else None,
            )

            # Associate categories
            for cat_name in category_names:
                cat = all_categories.get(cat_name)
                if cat:
                    solution.category_associations.append(
                        SolutionCategoryAssociation(category=cat)
                    )

            # Documents
            for doc in documents_data:
                solution.documents.append(SolutionDocument(**doc))

            # Videos
            for vid in videos_data:
                solution.videos.append(SolutionVideo(**vid))

            # Service URLs
            for s_url in service_urls_data:
                solution.service_urls.append(SolutionServiceUrl(**s_url))

            db.add(solution)
            seeded_count += 1

        db.commit()
        print(f"Successfully seeded {seeded_count} mock solutions!")


if __name__ == "__main__":
    seed_mock_solutions()
