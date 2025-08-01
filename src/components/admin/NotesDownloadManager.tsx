import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { databases } from '../../lib/appwrite';
import { Query } from 'appwrite';
import { DATABASE_ID, NOTES_COLLECTION_ID } from '../../appwrite/config';

interface Note {
  $id: string;
  title: string;
  content: string;
  uploadedBy: string;
  authorDetails?: {
    name: string;
    email: string;
  };
}

const NotesDownloadManager: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchNotes() {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          NOTES_COLLECTION_ID,
          [Query.orderAsc('$createdAt')]
        );
        setNotes(response.documents as unknown as Note[]);
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchNotes();
  }, []);

  const handleEdit = (noteId: string) => {
    console.log('Edit note:', noteId);
  };

  const handleDelete = async (noteId: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, NOTES_COLLECTION_ID, noteId);
      setNotes((prev) => prev.filter(note => note.$id !== noteId));
      alert('Note deleted successfully!');
    } catch (error) {
      console.error('Failed to delete note:', error);
      alert('Failed to delete note.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Manage Notes Download</h2>
      {loading ? (
        <p>Loading notes...</p>
      ) : (
        <ul className="space-y-4">
          {notes.map(note => (
            <li key={note.$id} className="border p-4 rounded">
              <h3 className="font-semibold">{note.title}</h3>
              <p>{note.content}</p>
              <p><strong>Uploaded by:</strong> {note.authorDetails?.name || 'Unknown'} ({note.authorDetails?.email || 'N/A'})</p>
              <div className="mt-2 space-x-4">
                <button onClick={() => handleEdit(note.$id)} className="text-blue-600 hover:underline">Edit</button>
                <button onClick={() => handleDelete(note.$id)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotesDownloadManager;

