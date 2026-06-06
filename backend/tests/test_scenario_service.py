from app.services.scenario_service import generate_scenario

evidence = """
Students with attendance below 75%
may receive warning notices.

Continued shortage may result in
parent notification and exam debarment.
"""

question = "Attendance short ho gayi toh?"

result = generate_scenario(
    evidence=evidence,
    question=question,
)

print(result)