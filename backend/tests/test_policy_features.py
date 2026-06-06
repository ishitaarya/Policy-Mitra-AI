import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.services.llm_service import generate_structured_response
from app.services.scenario_service import generate_scenario

evidence = """
Students with attendance below 75%
may receive warning notices.

Continued shortage may result in
parent notification and exam debarment.
"""

question = "Attendance short ho gayi toh?"

risk = generate_structured_response(
    evidence=evidence,
    question=question,
)

scenario = generate_scenario(
    evidence=evidence,
    question=question,
)

print("\nRISK RESULT")
print(risk)

print("\nSCENARIO RESULT")
print(scenario)