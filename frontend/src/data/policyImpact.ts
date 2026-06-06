import type { PolicyImpact, RiskLevel, SourceEvidence } from '@/types'

interface ResponseBundle {
  content: string
  requirement?: string
  riskLevel: RiskLevel
  riskScore: number
  policyCategory: string
  impact: PolicyImpact
  source: { page: number; section: string; excerpt: string }
  sources: SourceEvidence[]
  actions: { id: string; text: string; completed: boolean }[]
}

export const responseBundles: Record<string, ResponseBundle> = {
  'Attendance short ka scene?': {
    content:
      'Bhai, tumhari attendance 68% hai jo ki minimum 75% requirement se kaafi kam hai. Policy ke hisaab se, agar attendance 75% se neeche rahi toh tumhe semester mein detained mark ho sakta hai. Medical reasons ke liye certificate submit karna padega within 7 days.',
    requirement: 'Attendance Requirement: 75%',
    riskLevel: 'HIGH',
    riskScore: 82,
    policyCategory: 'Academic Attendance',
    impact: {
      riskLevel: 'HIGH',
      requiredAction: 'Submit Medical Certificate',
      deadline: '3 Days',
      consequence: 'Possible Exam Restriction',
      department: 'Academic Office',
    },
    source: {
      page: 12,
      section: 'Section 4.2 — Minimum Attendance',
      excerpt:
        'Students must maintain a minimum of 75% attendance in each subject. Failure to meet this requirement may result in detention from end-semester examinations.',
    },
    sources: [
      {
        id: 'att-1',
        documentName: 'Academic Regulations 2024.pdf',
        page: 12,
        section: 'Section 4.2 — Minimum Attendance',
        confidenceScore: 94,
        excerpt:
          'Students must maintain a minimum of 75% attendance in each subject. Failure to meet this requirement may result in detention from end-semester examinations.',
        fullContext: `Section 4.2 — Minimum Attendance Requirements

All registered students must maintain a minimum of 75% attendance in each subject throughout the semester. Attendance shall be computed on the basis of lectures, tutorials, and practical sessions as applicable.

Students failing to meet the 75% threshold shall be placed in the "short attendance" category and may be detained from appearing in the end-semester examinations unless condonation is granted by the competent authority upon submission of valid supporting documents.`,
      },
      {
        id: 'att-2',
        documentName: 'Academic Regulations 2024.pdf',
        page: 14,
        section: 'Section 4.5 — Medical Condonation',
        confidenceScore: 81,
        excerpt:
          'Medical certificates must be submitted within 7 working days of resuming classes. Condonation is subject to HOD approval.',
        fullContext: `Section 4.5 — Attendance Condonation on Medical Grounds

Students who are unable to attend classes due to documented medical reasons may apply for attendance condonation. A certified medical certificate from a registered medical practitioner must be submitted to the Academic Office within 7 working days of resuming classes.

The Head of Department (HOD) shall review the application and may recommend condonation to the Dean of Academics. Condonation shall not exceed 10% of the total required attendance without special approval.`,
      },
      {
        id: 'att-3',
        documentName: 'Academic Regulations 2024.pdf',
        page: 15,
        section: 'Section 4.6 — Detention Policy',
        confidenceScore: 76,
        excerpt:
          'Detained students shall not be permitted to sit for end-semester examinations until attendance shortfall is regularized.',
        fullContext: `Section 4.6 — Detention and Examination Eligibility

Students classified under short attendance shall be marked as "detained" in the academic records. Detained students shall not be permitted to appear in end-semester examinations for the affected subject(s) until the attendance shortfall is regularized through condonation or other approved mechanisms.

Re-admission to examinations shall require written clearance from the Academic Coordinator and HOD.`,
      },
    ],
    actions: [
      { id: 'a1', text: 'Submit medical certificate to Academic Office', completed: false },
      { id: 'a2', text: 'Meet HOD before Friday deadline', completed: false },
      { id: 'a3', text: 'Apply for attendance condonation online', completed: false },
    ],
  },
  'Hostel late entry fine?': {
    content:
      'Hostel policy ke hisaab se, 10 PM ke baad entry allowed nahi hai weekdays pe. Agar late entry ho toh ₹500 fine lagta hai first offense pe. Second time pe ₹1000 + parent notification. Gate pass lena mat bhoolna agar event attend kar rahe ho.',
    riskLevel: 'MEDIUM',
    riskScore: 55,
    policyCategory: 'Hostel Regulations',
    impact: {
      riskLevel: 'MEDIUM',
      requiredAction: 'Apply for Gate Pass',
      deadline: '24 Hours',
      consequence: '₹500 Fine + Warning Letter',
      department: 'Hostel Warden Office',
    },
    source: {
      page: 6,
      section: 'Section 3.1 — Entry Timings',
      excerpt:
        'No student shall enter the hostel premises after 10:00 PM on weekdays without prior gate pass approval from the warden.',
    },
    sources: [
      {
        id: 'hostel-1',
        documentName: 'Hostel Rules & Guidelines.pdf',
        page: 6,
        section: 'Section 3.1 — Entry Timings',
        confidenceScore: 91,
        excerpt:
          'No student shall enter the hostel premises after 10:00 PM on weekdays without prior gate pass approval from the warden.',
        fullContext: `Section 3.1 — Hostel Entry and Exit Timings

All hostel residents must return to the hostel premises before 10:00 PM on weekdays (Monday through Saturday). No student shall enter the hostel after 10:00 PM without prior gate pass approval obtained from the Hostel Warden.

On Sundays and public holidays, the curfew time is extended to 11:00 PM. Residents violating entry timings without valid authorization shall be subject to disciplinary action as per Section 3.4.`,
      },
      {
        id: 'hostel-2',
        documentName: 'Hostel Rules & Guidelines.pdf',
        page: 8,
        section: 'Section 3.4 — Penalties for Violations',
        confidenceScore: 87,
        excerpt:
          'First violation: ₹500 fine. Second violation: ₹1000 fine with mandatory parent/guardian notification.',
        fullContext: `Section 3.4 — Penalties for Hostel Rule Violations

Late entry without gate pass:
• First offense: Fine of ₹500 and written warning
• Second offense: Fine of ₹1000 with mandatory notification to parent/guardian
• Third offense: Suspension of hostel privileges for 15 days

Gate pass applications must be submitted at least 24 hours in advance for planned events. Emergency gate passes may be issued at the discretion of the Warden.`,
      },
    ],
    actions: [
      { id: 'h1', text: 'Collect gate pass from warden office', completed: false },
      { id: 'h2', text: 'Pay fine at accounts section if applicable', completed: false },
    ],
  },
  'Scholarship eligibility?': {
    content:
      'Merit scholarship ke liye minimum 85% aggregate chahiye previous year ka. Family income ₹6 lakh se kam honi chahiye (income certificate mandatory). Application deadline 15th September hai — portal pe upload karo.',
    riskLevel: 'LOW',
    riskScore: 25,
    policyCategory: 'Scholarship & Financial Aid',
    impact: {
      riskLevel: 'LOW',
      requiredAction: 'Submit Income Certificate',
      deadline: '15 September',
      consequence: 'Scholarship Application Rejected',
      department: 'Scholarship Cell',
    },
    source: {
      page: 4,
      section: 'Section 2.3 — Merit Scholarship Criteria',
      excerpt:
        'Applicants must maintain a minimum aggregate of 85% and submit verified family income certificate not exceeding ₹6,00,000 per annum.',
    },
    sources: [
      {
        id: 'sch-1',
        documentName: 'Scholarship Policy.pdf',
        page: 4,
        section: 'Section 2.3 — Merit Scholarship Criteria',
        confidenceScore: 96,
        excerpt:
          'Applicants must maintain a minimum aggregate of 85% and submit verified family income certificate not exceeding ₹6,00,000 per annum.',
        fullContext: `Section 2.3 — Merit Scholarship Eligibility Criteria

To be eligible for the Merit Scholarship, applicants must satisfy all of the following conditions:

1. Minimum aggregate marks of 85% in the previous academic year
2. Family annual income not exceeding ₹6,00,000 (verified income certificate mandatory)
3. No disciplinary proceedings pending against the student
4. Full-time enrollment in an approved program

Applications failing to meet any criterion shall be rejected without exception.`,
      },
      {
        id: 'sch-2',
        documentName: 'Scholarship Policy.pdf',
        page: 6,
        section: 'Section 2.7 — Application Deadline',
        confidenceScore: 89,
        excerpt:
          'All scholarship applications must be submitted through the online portal on or before 15th September. Late applications will not be considered.',
        fullContext: `Section 2.7 — Application Procedure and Deadlines

Students must submit complete scholarship applications through the official student portal. Required documents include: verified income certificate, marksheet/transcript, and bank account details.

The application deadline for the current academic year is 15th September. Applications received after this date shall not be considered under any circumstances. Students are advised to track application status through the portal.`,
      },
    ],
    actions: [
      { id: 's1', text: 'Upload income certificate on portal', completed: false },
      { id: 's2', text: 'Verify aggregate marks transcript', completed: false },
    ],
  },
  'Leave application kaise kare?': {
    content:
      'Leave ke liye student portal pe "Academic Leave" section mein jao. 3 days tak HOD approval sufficient hai. 3+ days ke liye Dean approval chahiye. Medical leave ke liye doctor certificate attach karna mandatory hai within 48 hours.',
    riskLevel: 'LOW',
    riskScore: 18,
    policyCategory: 'Academic Leave',
    impact: {
      riskLevel: 'LOW',
      requiredAction: 'File Leave on Student Portal',
      deadline: '48 Hours',
      consequence: 'Unauthorized Absence Marked',
      department: 'Academic Affairs',
    },
    source: {
      page: 18,
      section: 'Section 6.1 — Leave Application Procedure',
      excerpt:
        'All leave applications must be submitted through the student portal within 48 hours of return. Medical leave requires certified doctor documentation.',
    },
    sources: [
      {
        id: 'leave-1',
        documentName: 'Academic Regulations 2024.pdf',
        page: 18,
        section: 'Section 6.1 — Leave Application Procedure',
        confidenceScore: 93,
        excerpt:
          'All leave applications must be submitted through the student portal within 48 hours of return. Medical leave requires certified doctor documentation.',
        fullContext: `Section 6.1 — Leave Application Procedure

All students seeking academic leave must submit applications through the student portal under the "Academic Leave" section. Applications must be filed within 48 hours of the student's return to campus.

For leave up to 3 consecutive days: HOD approval is sufficient.
For leave exceeding 3 days: Dean of Academics approval is mandatory.
Medical leave applications must include a certified doctor's certificate as supporting documentation.`,
      },
      {
        id: 'leave-2',
        documentName: 'Academic Regulations 2024.pdf',
        page: 20,
        section: 'Section 6.4 — Extended Medical Leave',
        confidenceScore: 78,
        excerpt:
          'Medical leave exceeding 3 consecutive days requires Dean approval. Hospital documentation must be submitted within 48 hours of return.',
        fullContext: `Section 6.4 — Extended Medical Leave

Medical leave exceeding 3 consecutive days requires prior or retrospective approval from the Dean of Students. Certified hospital discharge summary and doctor's certificate must be uploaded on the student portal within 48 hours of return to campus.

Failure to submit documentation within the stipulated period may result in the absence being marked as unauthorized, affecting attendance records.`,
      },
    ],
    actions: [
      { id: 'l1', text: 'Submit leave form on student portal', completed: false },
      { id: 'l2', text: 'Attach medical certificate if applicable', completed: false },
    ],
  },
}

export const defaultResponseBundle: ResponseBundle = {
  content:
    'Main tumhare college policy document se answer dhundh raha hoon. Thoda specific batao — kaunsa department, kya deadline, ya kya penalty concern hai?',
  riskLevel: 'LOW',
  riskScore: 15,
  policyCategory: 'General Policy',
  impact: {
    riskLevel: 'LOW',
    requiredAction: 'Provide More Details',
    deadline: 'No Immediate Deadline',
    consequence: 'Delayed Resolution',
    department: 'Student Helpdesk',
  },
  source: {
    page: 1,
    section: 'General Provisions',
    excerpt: 'Refer to the official policy document for complete details on your query.',
  },
  sources: [
    {
      id: 'default-1',
      documentName: 'Academic Regulations 2024.pdf',
      page: 1,
      section: 'General Provisions',
      confidenceScore: 62,
      excerpt: 'Refer to the official policy document for complete details on your query.',
      fullContext: `General Provisions

This document contains the official academic regulations governing student conduct, attendance, examinations, leave policies, and disciplinary procedures. Students are advised to consult the relevant sections for specific queries.

For queries not covered in uploaded documents, please contact the Student Helpdesk or Academic Affairs Office.`,
    },
  ],
  actions: [{ id: 'g1', text: 'Review full policy document', completed: false }],
}

export function getResponseBundle(query: string): ResponseBundle {
  return responseBundles[query] ?? defaultResponseBundle
}
