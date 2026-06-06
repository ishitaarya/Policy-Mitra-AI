import type { ChatMessage, Conversation, Document } from '@/types'
import { responseBundles } from '@/data/policyImpact'

export const documents: Document[] = [
  { id: '1', name: 'Academic Regulations 2024.pdf', pages: 48, uploadedAt: '2 days ago', active: true },
  { id: '2', name: 'Hostel Rules & Guidelines.pdf', pages: 24, uploadedAt: '1 week ago' },
  { id: '3', name: 'Scholarship Policy.pdf', pages: 16, uploadedAt: '2 weeks ago' },
]

export const conversations: Conversation[] = [
  { id: '1', title: 'Attendance short ka scene?', timestamp: '2 min ago' },
  { id: '2', title: 'Hostel late entry fine?', timestamp: '1 hour ago' },
  { id: '3', title: 'Scholarship eligibility?', timestamp: 'Yesterday' },
  { id: '4', title: 'Leave application process', timestamp: '2 days ago' },
]

export const suggestedPrompts = [
  'Attendance short ka scene?',
  'Hostel late entry fine?',
  'Scholarship eligibility?',
  'Leave application kaise kare?',
]

const attendanceBundle = responseBundles['Attendance short ka scene?']

export const initialMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'user',
    content: 'Attendance short ka scene? Mere 68% hai abhi.',
    timestamp: '10:32 AM',
  },
  {
    id: '2',
    role: 'assistant',
    content: attendanceBundle.content,
    timestamp: '10:32 AM',
    requirement: attendanceBundle.requirement,
    riskLevel: attendanceBundle.riskLevel,
    riskScore: attendanceBundle.riskScore,
    policyCategory: attendanceBundle.policyCategory,
    impact: attendanceBundle.impact,
    actions: attendanceBundle.actions,
    source: attendanceBundle.source,
    sources: attendanceBundle.sources,
  },
]

export const complaintTemplate = {
  category: 'Academic Attendance',
  priority: 'High',
  department: 'Academic Affairs Office',
  complaint: `Subject: Request for Attendance Condonation Due to Medical Reasons

Dear Sir/Madam,

I am writing to formally request attendance condonation for the current semester. My attendance currently stands at 68%, which is below the mandated 75% threshold as per Section 4.2 of the Academic Regulations 2024.

Due to a prolonged medical condition (documented via attached medical certificate), I was unable to attend classes regularly during the period of [dates]. I have since recovered and am committed to maintaining full attendance for the remainder of the semester.

I humbly request your consideration for attendance condonation and guidance on the necessary formalities.

Thank you for your time and understanding.

Sincerely,
[Your Name]
[Enrollment Number]`,
}
