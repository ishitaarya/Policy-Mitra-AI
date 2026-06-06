from __future__ import annotations

from typing import Dict


def _detect_category_and_department(issue: str) -> tuple[str, str]:
    text = issue.lower()
    if any(word in text for word in ("hostel", "room", "mess", "accommodation")):
        return "Accommodation", "Hostel Office"
    if any(word in text for word in ("attendance", "exam", "marks", "debar")):
        return "Academic", "Academic Affairs"
    if any(word in text for word in ("fee", "payment", "tuition", "scholarship")):
        return "Finance", "Accounts Department"
    if any(word in text for word in ("health", "medical", "hospital")):
        return "Health", "Medical Cell"
    if any(word in text for word in ("harass", "bully", "assault", "misconduct")):
        return "Disciplinary", "Student Discipline"
    return "General", "Student Services"


def _detect_priority(issue: str) -> str:
    text = issue.lower()
    if any(word in text for word in ("emergency", "injury", "immediately", "urgent", "danger")):
        return "HIGH"
    if any(word in text for word in ("important", "priority", "asap", "soon", "please")):
        return "MEDIUM"
    return "LOW"


def _compose_formal_complaint(issue: str, department: str) -> str:
    # Simple template-based formalization
    return (
        f"To: {department}\n\n"
        f"Subject: Formal complaint regarding the following issue\n\n"
        f"Dear {department},\n\n"
        f"I am writing to formally raise the following issue: {issue.strip()}\n\n"
        "I request that this matter be investigated and appropriate action be taken.\n\n"
        "Sincerely,\nStudent"
    )


def generate_complaint(issue: str) -> Dict[str, str]:
    """Generate a structured complaint from a freeform issue description.

    This is a deterministic, rule-based implementation that does not call
    external services. It returns a JSON-serializable dict with keys:
    `category`, `priority`, `department`, `complaint`.
    """
    category, department = _detect_category_and_department(issue)
    priority = _detect_priority(issue)
    complaint = _compose_formal_complaint(issue, department)

    return {
        "category": category,
        "priority": priority,
        "department": department,
        "complaint": complaint,
    }
