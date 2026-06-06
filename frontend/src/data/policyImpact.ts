import type { PolicyImpact, RiskLevel } from '@/types'

interface ResponseBundle {
  content: string
  requirement?: string
  riskLevel: RiskLevel
  riskScore: number
  policyCategory: string
  impact: PolicyImpact
  source: { page: number; section: string; excerpt: string }
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
  actions: [{ id: 'g1', text: 'Review full policy document', completed: false }],
}

export function getResponseBundle(query: string): ResponseBundle {
  return responseBundles[query] ?? defaultResponseBundle
}
