import { useState } from 'react'
import TaskCard from '../components/TaskCard'
import { tasks } from '../notesData/tasks'
import { Semester } from '../types/task'

export default function NotesRequested() {
  const [search, setSearch] = useState('')
  const [semesterFilter, setSemesterFilter] = useState<Semester | 'All'>('All')

  const filteredTasks = tasks.filter(task =>
    (semesterFilter === 'All' || task.semester === semesterFilter) &&
    (task.subject.toLowerCase().includes(search.toLowerCase()) ||
     task.topic.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6 mt-10">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">📚 Notes Requested</h1>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="🔍 Search by subject or topic"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 rounded border w-full md:w-1/2"
        />
        <select
          value={semesterFilter}
          onChange={e => setSemesterFilter(e.target.value as Semester | 'All')}
          className="px-4 py-2 rounded border"
        >
          <option value="All">All Semesters</option>
          <option value="1st Sem">1st Sem</option>
          <option value="2nd Sem">2nd Sem</option>
          <option value="3rd Sem">3rd Sem</option>
          <option value="4th Sem">4th Sem</option>
          <option value="5th Sem">5th Sem</option>
          <option value="6th Sem">6th Sem</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}