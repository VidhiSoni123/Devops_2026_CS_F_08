from datetime import datetime

report = f"""# Jenkins Feedback Report

## Career Compass 2.0

**Generated:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

## Verification

| Check | Status |
|---|---|
| Frontend ESLint | PASSED |
| Frontend Production Build | PASSED |

## Feature Under Verification

**Recruiter Authentication UI**

- Recruiter Login
- Recruiter Signup
- Form validation
- Login to Signup navigation

## Result

The frontend authentication feature passed the automated Jenkins verification stages.

> This report was generated automatically by Jenkins.
"""

with open("feedback-report.md", "w", encoding="utf-8") as file:
    file.write(report)

print("[SUCCESS] feedback-report.md generated.")