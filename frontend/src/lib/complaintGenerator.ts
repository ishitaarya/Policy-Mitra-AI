import type { ComplaintGenerationContext, ComplaintPriority, GeneratedComplaint } from '@/types'

const COMPLAINT_SIGNALS = [
  'complaint',
  'grievance',
  'wifi',
  'wi-fi',
  'internet',
  'hostel',
  'maintenance',
  'broken',
  'not working',
  'nahi chal',
  'issue',
  'problem',
  'fine',
  'transport',
  'bus',
  'canteen',
  'water',
  'electricity',
  'late entry',
  'harassment',
  'administration',
  'attendance short',
  'detained',
  'scholarship reject',
  'repair',
  'leak',
  'noise',
  'security',
  'ragging',
  'fee',
  'refund',
]

interface ComplaintTemplate {
  category: string
  priority: ComplaintPriority
  department: string
  match: (query: string) => boolean
  buildSummary: (query: string, ctx?: ComplaintGenerationContext) => string
  buildDraft: (query: string, ctx?: ComplaintGenerationContext, variant?: number) => string
}

function createReferenceId() {
  const date = new Date()
  const stamp = date.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `PM-GRV-${stamp}-${random}`
}

function formatDate() {
  return new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const templates: ComplaintTemplate[] = [
  {
    category: 'Hostel IT & Connectivity',
    priority: 'High',
    department: 'Hostel IT Helpdesk',
    match: (q) => /wifi|wi-fi|internet|network|connectivity|nahi chal/i.test(q),
    buildSummary: (query) =>
      `Formal grievance regarding prolonged hostel internet/WiFi outage as described by the student: "${truncate(query, 120)}". Requesting immediate resolution per hostel IT SLA.`,
    buildDraft: (query, _ctx, variant = 0) => {
      const openings = [
        'I am writing to formally register a complaint regarding persistent internet connectivity failure in the hostel premises.',
        'This is a formal grievance concerning the ongoing WiFi/internet service disruption affecting hostel residents.',
      ]
      return `OFFICIAL STUDENT GRIEVANCE — HOSTEL IT SERVICES
Reference: [Auto-Generated]
Date: ${formatDate()}

To,
The Hostel IT Helpdesk
[College Name]

Subject: Formal Complaint — Hostel WiFi / Internet Connectivity Failure

Respected Sir/Madam,

${openings[variant % openings.length]}

Issue Reported:
${query}

As per the Hostel Rules & Guidelines (Section 5.4 — IT Infrastructure Complaints), connectivity issues must be resolved within 48 hours. Despite the duration of this outage, no satisfactory resolution has been provided to date.

Requested Action:
1. Immediate restoration of internet services in the affected block/room.
2. Formal ticket reference number for tracking this complaint.
3. Escalation to the Chief Warden if SLA is not met within 48 hours.

I request that this matter be treated with high priority as it directly affects academic work, online submissions, and daily hostel operations.

Enclosures: [Screenshots / Ticket Logs if available]

Thanking you,

Yours faithfully,
[Student Name]
[Enrollment Number]
[Hostel Block & Room Number]
[Contact Number]`
    },
  },
  {
    category: 'Hostel Maintenance',
    priority: 'High',
    department: 'Hostel Administration',
    match: (q) => /hostel|warden|late entry|gate pass|room|maintenance|water|electricity|leak/i.test(q),
    buildSummary: (query) =>
      `Hostel-related grievance concerning facilities, entry rules, or maintenance as reported: "${truncate(query, 120)}". Routed to Hostel Administration for review.`,
    buildDraft: (query, ctx, variant = 0) => {
      const tone =
        variant % 2 === 0
          ? 'I wish to bring to your urgent attention a hostel-related concern that requires administrative intervention.'
          : 'I am submitting this formal grievance under hostel regulations for your immediate review and corrective action.'
      return `OFFICIAL STUDENT GRIEVANCE — HOSTEL ADMINISTRATION
Reference: [Auto-Generated]
Date: ${formatDate()}

To,
The Hostel Administration Office
[College Name]

Subject: Formal Complaint — Hostel Maintenance / Regulation Concern

Respected Sir/Madam,

${tone}

Details of Grievance:
${query}

${ctx?.assistantSummary ? `Policy Context:\n${ctx.assistantSummary}\n` : ''}
This matter falls under the purview of hostel administration. I request a written acknowledgment of this complaint and a clear timeline for resolution.

Requested Action:
1. Inspection and remedial action for the reported issue.
2. Written response within 3 working days.
3. Guidance on any formal documentation or gate pass requirements, if applicable.

Thanking you,

Yours faithfully,
[Student Name]
[Enrollment Number]
[Hostel Block & Room Number]
[Contact Number]`
    },
  },
  {
    category: 'Academic Attendance',
    priority: 'High',
    department: 'Academic Affairs Office',
    match: (q) => /attendance|detained|condonation|short|absent|medical leave/i.test(q),
    buildSummary: (query, ctx) =>
      `Academic grievance related to attendance, leave, or examination eligibility. Student concern: "${truncate(query, 120)}". ${ctx?.riskLevel === 'HIGH' ? 'Flagged as high-priority due to examination risk.' : ''}`,
    buildDraft: (query, ctx, variant = 0) => {
      const request =
        variant % 2 === 0
          ? 'I respectfully request attendance condonation / academic guidance in accordance with institutional policy.'
          : 'I seek formal review of my attendance status and approval for condonation where policy permits.'
      return `OFFICIAL STUDENT GRIEVANCE — ACADEMIC AFFAIRS
Reference: [Auto-Generated]
Date: ${formatDate()}

To,
The Academic Affairs Office
[College Name]

Subject: Formal Request — Attendance / Academic Eligibility Concern

Respected Sir/Madam,

I am a registered student writing to formally address an academic attendance concern.

Student Statement:
${query}

${ctx?.assistantSummary ? `Policy Advisory Summary:\n${ctx.assistantSummary}\n` : ''}
${request}

Requested Action:
1. Review of my attendance record for the current semester.
2. Guidance on condonation procedure and required supporting documents.
3. Appointment with HOD / Academic Coordinator if necessary.

Enclosures: [Medical Certificate / Supporting Documents — if applicable]

Thanking you,

Yours faithfully,
[Student Name]
[Enrollment Number]
[Programme & Semester]
[Contact Number]`
    },
  },
  {
    category: 'Campus Transport',
    priority: 'Medium',
    department: 'Transport & Logistics Office',
    match: (q) => /transport|bus|shuttle|route|driver/i.test(q),
    buildSummary: (query) =>
      `Transport-related grievance: "${truncate(query, 120)}". Forwarded to Transport & Logistics for scheduling and service review.`,
    buildDraft: (query) => `OFFICIAL STUDENT GRIEVANCE — CAMPUS TRANSPORT
Reference: [Auto-Generated]
Date: ${formatDate()}

To,
The Transport & Logistics Office
[College Name]

Subject: Formal Complaint — Campus Transport Service

Respected Sir/Madam,

I wish to register a formal complaint regarding campus transport services.

Issue Reported:
${query}

Requested Action:
1. Investigation of the reported transport irregularity.
2. Corrective measures to ensure timely and safe service.
3. Written response regarding remedial steps taken.

Thanking you,

Yours faithfully,
[Student Name]
[Enrollment Number]
[Contact Number]`,
  },
  {
    category: 'Scholarship & Financial Aid',
    priority: 'Medium',
    department: 'Scholarship Cell',
    match: (q) => /scholarship|financial aid|fee refund|stipend|income certificate/i.test(q),
    buildSummary: (query) =>
      `Financial aid grievance concerning scholarship or fee matters: "${truncate(query, 120)}". Assigned to Scholarship Cell.`,
    buildDraft: (query, ctx) => `OFFICIAL STUDENT GRIEVANCE — SCHOLARSHIP & FINANCIAL AID
Reference: [Auto-Generated]
Date: ${formatDate()}

To,
The Scholarship Cell
[College Name]

Subject: Formal Complaint / Clarification — Scholarship & Financial Aid

Respected Sir/Madam,

I am writing to formally raise a concern regarding scholarship or financial aid processing.

Student Statement:
${query}

${ctx?.assistantSummary ? `Relevant Policy Information:\n${ctx.assistantSummary}\n` : ''}
Requested Action:
1. Review of my scholarship application / eligibility status.
2. Clarification on outstanding documentation requirements.
3. Written confirmation of next steps and deadlines.

Thanking you,

Yours faithfully,
[Student Name]
[Enrollment Number]
[Contact Number]`,
  },
  {
    category: 'General Administration',
    priority: 'Medium',
    department: 'Student Affairs Office',
    match: () => true,
    buildSummary: (query) =>
      `Administrative grievance submitted by student regarding: "${truncate(query, 120)}". Routed to Student Affairs for classification and forwarding.`,
    buildDraft: (query, ctx, variant = 0) => {
      const dept = ctx?.department ?? 'the appropriate departmental authority'
      return `OFFICIAL STUDENT GRIEVANCE — ADMINISTRATIVE REQUEST
Reference: [Auto-Generated]
Date: ${formatDate()}

To,
The Student Affairs Office
[College Name]

Subject: Formal Complaint — Administrative Concern

Respected Sir/Madam,

${variant % 2 === 0 ? 'I respectfully submit the following grievance for your review and necessary action.' : 'Please accept this formal administrative complaint for registration and resolution under student grievance procedures.'}

Complaint Details:
${query}

${ctx?.assistantSummary ? `Supporting Context:\n${ctx.assistantSummary}\n` : ''}
Suggested Routing: ${dept}

Requested Action:
1. Official registration of this grievance with a tracking reference.
2. Forwarding to the concerned department within 2 working days.
3. Written intimation of resolution timeline.

Thanking you,

Yours faithfully,
[Student Name]
[Enrollment Number]
[Contact Number]`
    },
  },
]

function truncate(text: string, max: number) {
  if (text.length <= max) return text
  return `${text.slice(0, max).trim()}…`
}

function resolveTemplate(query: string, ctx?: ComplaintGenerationContext) {
  if (ctx?.policyCategory) {
    const byCategory = templates.find((t) =>
      ctx.policyCategory?.toLowerCase().includes(t.category.split(' ')[0].toLowerCase())
    )
    if (byCategory) return byCategory
  }

  return templates.find((t) => t.match(query)) ?? templates[templates.length - 1]
}

export function isComplaintIssue(text: string): boolean {
  const lower = text.toLowerCase()
  return COMPLAINT_SIGNALS.some((signal) => lower.includes(signal))
}

export function generateComplaint(
  userQuery: string,
  context?: ComplaintGenerationContext,
  variant = 0
): GeneratedComplaint {
  const template = resolveTemplate(userQuery, context)
  const priority =
    context?.riskLevel === 'HIGH'
      ? 'High'
      : context?.riskLevel === 'MEDIUM'
        ? 'Medium'
        : template.priority

  const referenceId = createReferenceId()
  const formalDraft = template
    .buildDraft(userQuery, context, variant)
    .replace('[Auto-Generated]', referenceId)

  return {
    referenceId,
    category: context?.policyCategory ?? template.category,
    priority,
    department: context?.department ?? template.department,
    summary: template.buildSummary(userQuery, context),
    formalDraft,
    generatedAt: new Date().toISOString(),
  }
}

export function getComplaintExportText(complaint: GeneratedComplaint) {
  return `POLICYMITRA AI — FORMAL COMPLAINT EXPORT
Reference ID: ${complaint.referenceId}
Generated: ${new Date(complaint.generatedAt).toLocaleString('en-IN')}

Category: ${complaint.category}
Priority: ${complaint.priority}
Department: ${complaint.department}

--- COMPLAINT SUMMARY ---
${complaint.summary}

--- FORMAL COMPLAINT DRAFT ---
${complaint.formalDraft}
`
}
