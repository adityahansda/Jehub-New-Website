export type TaskStatus = 'pending' | 'fulfilled' | 'in-progress'
export type Semester = '1st Sem' | '2nd Sem' | '3rd Sem' | '4th Sem' | '5th Sem' | '6th Sem'
export type Priority = 'High' | 'Medium' | 'Low'

export interface Task {
  id: string
  subject: string
  topic: string
  requestedBy: string
  date: string
  status: TaskStatus
  semester: Semester
  priority: Priority
  pdfUrl?: string // optional link to notes
}