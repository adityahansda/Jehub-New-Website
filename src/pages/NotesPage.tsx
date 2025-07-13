import React from 'react';
import NoteBadge from '../components/NoteBadge';

const NotesPage = () => {
  const notes = [
    {
      title: 'Advanced Algorithms',
      degree: 'B.Tech',
      semester: '7th',
      subject: 'Computer Science',
      points: 150
    },
    {
      title: 'Physics Basics',
      degree: 'Diploma',
      semester: '5th',
      subject: 'Physics',
      points: 100
    }
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Notes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notes.map((note, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">{note.title}</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <NoteBadge type="degree" value={note.degree} />
                <NoteBadge type="semester" value={note.semester} />
                <NoteBadge type="subject" value={note.subject} />
                <NoteBadge type="points" value={note.points} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesPage;
