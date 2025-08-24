import { Task } from '../types/task'

export const tasks: Task[] = [
  {
    id: 'tsk-101',
    subject: 'Mining Engineering',
    topic: 'Drilling Techniques & Equipment',
    requestedBy: 'Ravi Kumar',
    date: '2025-08-21',
    status: 'pending',
    semester: '3rd Sem',
    priority: 'High',
    pdfUrl: '',
  },
  {
    id: 'tsk-102',
    subject: 'Mechanical Engineering',
    topic: 'Thermodynamics – Laws & Applications',
    requestedBy: 'Sneha Patel',
    date: '2025-08-20',
    status: 'in-progress',
    semester: '2nd Sem',
    priority: 'Medium',
    pdfUrl: 'https://example.com/thermodynamics.pdf',
  },
  {
    id: 'tsk-103',
    subject: 'Diploma Civil',
    topic: 'Surveying Methods & Instruments',
    requestedBy: 'Amit Singh',
    date: '2025-08-19',
    status: 'fulfilled',
    semester: '1st Sem',
    priority: 'Low',
    pdfUrl: '',
  },
  // Add more as needed
]