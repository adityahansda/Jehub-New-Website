import { Task } from '../types/task'

interface Props {
  task: Task
}

const statusColor: Record<Task['status'], string> = {
  pending: 'from-yellow-400 to-orange-500',
  fulfilled: 'from-green-400 to-teal-500',
  'in-progress': 'from-blue-400 to-indigo-500',
}

export default function TaskCard({ task }: Props) {
  return (
    <div className={`bg-gradient-to-br ${statusColor[task.status]} text-white rounded-xl shadow-lg p-6 hover:scale-105 transition-transform duration-300`}>
      <h2 className="text-xl font-semibold mb-2">{task.subject}</h2>
      <p className="text-sm mb-1"><span className="font-bold">Topic:</span> {task.topic}</p>
      <p className="text-sm mb-1"><span className="font-bold">Semester:</span> {task.semester}</p>
      <p className="text-sm mb-1"><span className="font-bold">Priority:</span> {task.priority}</p>
      <p className="text-sm mb-1"><span className="font-bold">Requested By:</span> {task.requestedBy}</p>
      <p className="text-sm mb-1"><span className="font-bold">Date:</span> {task.date}</p>
      <p className="text-sm mb-3"><span className="font-bold">Status:</span> {task.status}</p>
      {task.pdfUrl ? (
        <a href={task.pdfUrl} target="_blank" rel="noopener noreferrer" className="bg-black text-white px-3 py-1 rounded hover:bg-gray-200 transition">
          📄 View Notes
        </a>
      ) : (
        <button className="bg-black text-white px-3 py-1 rounded hover:bg-gray-200 transition">
          ⬆️ Upload Notes
        </button>
      )}
    </div>
  )
}