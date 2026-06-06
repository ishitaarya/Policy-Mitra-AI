import type { ElementType } from 'react'
import {
  GraduationCap,
  HeartPulse,
  Wifi,
  ClipboardList,
} from 'lucide-react'
import { responseBundles } from '@/data/policyImpact'
import type { ChatMessage, RiskLevel } from '@/types'

export type DemoScenarioId =
  | 'attendance-shortage'
  | 'hostel-wifi-complaint'
  | 'medical-leave'
  | 'scholarship-eligibility'

export interface DemoScenario {
  id: DemoScenarioId
  title: string
  description: string
  query: string
  icon: ElementType
  accent: string
  glow: string
  riskLevel: RiskLevel
  tag: string
  messages: ChatMessage[]
}

function buildMessages(
  userContent: string,
  assistant: Omit<ChatMessage, 'id' | 'role' | 'timestamp'>
): ChatMessage[] {
  return [
    {
      id: 'demo-user',
      role: 'user',
      content: userContent,
      timestamp: 'Just now',
    },
    {
      id: 'demo-assistant',
      role: 'assistant',
      timestamp: 'Just now',
      ...assistant,
    },
  ]
}

export const demoScenarios: DemoScenario[] = [
  {
    id: 'attendance-shortage',
    title: 'Attendance Shortage',
    description: '68% attendance — below the 75% minimum. See detention risk & medical certificate steps.',
    query: 'Attendance short ka scene? Mere 68% hai abhi.',
    icon: ClipboardList,
    accent: 'from-red-500/20 to-orange-500/10',
    glow: 'hover:shadow-red-500/15',
    riskLevel: 'HIGH',
    tag: 'Academic',
    messages: buildMessages('Attendance short ka scene? Mere 68% hai abhi.', {
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
      actions: [
        { id: 'a1', text: 'Submit medical certificate to Academic Office', completed: false },
        { id: 'a2', text: 'Meet HOD before Friday deadline', completed: false },
        { id: 'a3', text: 'Apply for attendance condonation online', completed: false },
      ],
      source: {
        page: 12,
        section: 'Section 4.2 — Minimum Attendance',
        excerpt:
          'Students must maintain a minimum of 75% attendance in each subject. Failure to meet this requirement may result in detention from end-semester examinations.',
      },
      sources: responseBundles['Attendance short ka scene?'].sources,
    }),
  },
  {
    id: 'hostel-wifi-complaint',
    title: 'Hostel WiFi Complaint',
    description: 'No internet for 5 days in Block C. Learn complaint process & IT escalation policy.',
    query: 'Hostel mein WiFi 5 din se nahi chal raha, complaint kaise karun?',
    icon: Wifi,
    accent: 'from-yellow-500/20 to-amber-500/10',
    glow: 'hover:shadow-yellow-500/15',
    riskLevel: 'MEDIUM',
    tag: 'Hostel',
    messages: buildMessages(
      'Hostel mein WiFi 5 din se nahi chal raha, complaint kaise karun?',
      {
        content:
          'Hostel IT policy ke hisaab se, WiFi outage 48 hours se zyada ho toh formal complaint lodge karni mandatory hai. Pehle Block Warden ko inform karo, phir Hostel IT Helpdesk pe ticket raise karo. Agar 72 hours mein resolve na ho toh escalate to Chief Warden + written complaint mandatory hai.',
        requirement: 'Resolution SLA: 48 Hours',
        riskLevel: 'MEDIUM',
        riskScore: 48,
        policyCategory: 'Hostel IT Services',
        impact: {
          riskLevel: 'MEDIUM',
          requiredAction: 'File IT Complaint Ticket',
          deadline: '48 Hours',
          consequence: 'Service Credit Denied',
          department: 'Hostel IT Helpdesk',
        },
        actions: [
          { id: 'w1', text: 'Inform Block Warden in writing', completed: false },
          { id: 'w2', text: 'Raise ticket on Hostel IT portal', completed: false },
          { id: 'w3', text: 'Escalate to Chief Warden if unresolved', completed: false },
        ],
        source: {
          page: 9,
          section: 'Section 5.4 — IT Infrastructure Complaints',
          excerpt:
            'Residents must report connectivity issues within 24 hours. Hostel IT is obligated to resolve outages within 48 hours or provide formal escalation pathway.',
        },
        sources: [
          {
            id: 'wifi-1',
            documentName: 'Hostel Rules & Guidelines.pdf',
            page: 9,
            section: 'Section 5.4 — IT Infrastructure Complaints',
            confidenceScore: 92,
            excerpt:
              'Residents must report connectivity issues within 24 hours. Hostel IT is obligated to resolve outages within 48 hours or provide formal escalation pathway.',
            fullContext: `Section 5.4 — IT Infrastructure Complaints

All hostel residents experiencing WiFi or network connectivity issues must report the problem to the Block Warden within 24 hours of occurrence. A formal complaint ticket must be raised on the Hostel IT Helpdesk portal.

Hostel IT Services is obligated to resolve reported outages within 48 hours. If resolution is not achieved within 72 hours, residents may escalate the complaint to the Chief Warden with a written statement and ticket reference number.`,
          },
          {
            id: 'wifi-2',
            documentName: 'Hostel Rules & Guidelines.pdf',
            page: 10,
            section: 'Section 5.5 — Escalation Procedure',
            confidenceScore: 84,
            excerpt:
              'Unresolved complaints beyond 72 hours must be escalated to the Chief Warden in writing with ticket reference.',
            fullContext: `Section 5.5 — Complaint Escalation Procedure

If a hostel IT complaint remains unresolved after 72 hours from the initial ticket submission, the resident must submit a written escalation to the Chief Warden's office. The escalation must include: ticket number, dates of outage, prior communication records, and impact statement.

Failure to follow the escalation procedure may result in denial of service credit claims.`,
          },
        ],
      }
    ),
  },
  {
    id: 'medical-leave',
    title: 'Medical Leave',
    description: 'Hospitalized for 10 days — understand leave approval, certificate & attendance impact.',
    query: 'Main 10 din hospital mein tha, medical leave kaise apply karun?',
    icon: HeartPulse,
    accent: 'from-cyan-500/20 to-blue-500/10',
    glow: 'hover:shadow-cyan-500/15',
    riskLevel: 'MEDIUM',
    tag: 'Leave',
    messages: buildMessages('Main 10 din hospital mein tha, medical leave kaise apply karun?', {
      content:
        '10 din ki medical leave ke liye Dean approval mandatory hai since it exceeds 3 days. Hospital discharge summary + doctor certificate attach karo student portal pe within 48 hours of return. Attendance condonation alag se apply karna padega agar classes miss hui hain.',
      requirement: 'Medical Leave: Dean Approval Required',
      riskLevel: 'MEDIUM',
      riskScore: 52,
      policyCategory: 'Medical Leave Policy',
      impact: {
        riskLevel: 'MEDIUM',
        requiredAction: 'Submit Hospital Certificate',
        deadline: '48 Hours',
        consequence: 'Unauthorized Absence + Attendance Penalty',
        department: 'Dean of Students',
      },
      actions: [
        { id: 'm1', text: 'Upload discharge summary on portal', completed: false },
        { id: 'm2', text: 'Apply for medical leave (Dean approval)', completed: false },
        { id: 'm3', text: 'File attendance condonation separately', completed: false },
      ],
      source: {
        page: 20,
        section: 'Section 6.4 — Extended Medical Leave',
        excerpt:
          'Medical leave exceeding 3 consecutive days requires Dean approval. Certified hospital documentation must be submitted within 48 hours of the student\'s return to campus.',
      },
      sources: responseBundles['Leave application kaise kare?'].sources,
    }),
  },
  {
    id: 'scholarship-eligibility',
    title: 'Scholarship Eligibility',
    description: 'Check merit criteria, income limits & application deadline for financial aid.',
    query: 'Scholarship eligibility? Mere 87% hain aur family income 5 lakh hai.',
    icon: GraduationCap,
    accent: 'from-green-500/20 to-emerald-500/10',
    glow: 'hover:shadow-green-500/15',
    riskLevel: 'LOW',
    tag: 'Financial Aid',
    messages: buildMessages('Scholarship eligibility? Mere 87% hain aur family income 5 lakh hai.', {
      content:
        'Good news — tum eligible ho! 87% aggregate 85% minimum se upar hai aur ₹5 lakh income ₹6 lakh limit ke andar hai. Income certificate + marksheet upload karo scholarship portal pe before 15th September. Late applications accept nahi hote.',
      requirement: 'Merit Scholarship: 85% Min. Aggregate',
      riskLevel: 'LOW',
      riskScore: 12,
      policyCategory: 'Scholarship & Financial Aid',
      impact: {
        riskLevel: 'LOW',
        requiredAction: 'Submit Income Certificate',
        deadline: '15 September',
        consequence: 'Scholarship Application Rejected',
        department: 'Scholarship Cell',
      },
      actions: [
        { id: 's1', text: 'Upload verified income certificate', completed: false },
        { id: 's2', text: 'Submit marksheet on scholarship portal', completed: false },
        { id: 's3', text: 'Track application status online', completed: false },
      ],
      source: {
        page: 4,
        section: 'Section 2.3 — Merit Scholarship Criteria',
        excerpt:
          'Applicants must maintain a minimum aggregate of 85% and submit verified family income certificate not exceeding ₹6,00,000 per annum.',
      },
      sources: responseBundles['Scholarship eligibility?'].sources,
    }),
  },
]

export function getDemoScenario(id: DemoScenarioId): DemoScenario | undefined {
  return demoScenarios.find((s) => s.id === id)
}
