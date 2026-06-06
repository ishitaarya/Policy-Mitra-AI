import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.services.llm_service import generate_structured_response

evidence = """
Students with attendance below 75%
may receive warning notices.

Continued shortage may result in
parent notification and exam debarment.
"""

question = "Attendance short ho gayi toh?"

result = generate_structured_response(
    evidence=evidence,
    question=question,
)

print(result)