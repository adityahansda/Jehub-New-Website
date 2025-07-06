import React, { useState } from 'react';
import { CheckSquare, Clock, AlertCircle, Plus, Upload, Calendar } from 'lucide-react';

interface TaskManagementProps {
  isOverview?: boolean;
}

const TaskManagement: React.FC<TaskManagementProps> = ({ isOverview = false }) => {
  const [tasks] = useState([
    {
      id: 1,
      title: 'Design social media graphics',
      description: 'Create Instagram posts for this week',
      dueDate: '2024-07-08',
      priority: 'high',
      status: 'pending',
      deliverables: null
    },
    {
      id: 2,
      title: 'Write blog content',
      description: 'Article about study tips',
      dueDate: '2024-07-10',
      priority: 'medium',
      status: 'in-progress',
      deliverables: null
    },
    {
      id: 3,
      title: 'Update website content',
      description: 'Refresh homepage copy',
      dueDate: '2024-07-06',
      priority: 'low',
      status: 'completed',
      deliverables: 'website-update.zip'
    }
  ]);

  const handleSubmitDeliverable = (taskId: number) => {
    console.log('Submit deliverable for task:', taskId);
  };

  const handleMarkDone = (taskId: number) => {
    console.log('Mark task as done:', taskId);
  };

  const handleRequestExtension = (taskId: number) => {
    console.log('Request extension for task:', taskId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const displayTasks = isOverview ? tasks.slice(0, 3) : tasks;

  return (
    <div className="space-y-6">
      {!isOverview && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Task Management</h2>
            <p className="text-gray-600">View and manage your assigned tasks</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        {!isOverview && (
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Your Tasks</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{tasks.filter(t => t.status === 'completed').length} completed</span>
              <span>•</span>
              <span>{tasks.filter(t => t.status === 'pending').length} pending</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {displayTasks.map((task) => (
            <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{task.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>Due: {task.dueDate}</span>
                  </div>
                </div>
              </div>

              {task.status !== 'completed' && !isOverview && (
                <div className="flex items-center space-x-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleSubmitDeliverable(task.id)}
                    className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                  >
                    <Upload className="h-3 w-3" />
                    Submit
                  </button>
                  <button
                    onClick={() => handleMarkDone(task.id)}
                    className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                  >
                    <CheckSquare className="h-3 w-3" />
                    Mark Done
                  </button>
                  <button
                    onClick={() => handleRequestExtension(task.id)}
                    className="flex items-center gap-1 bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700"
                  >
                    <Clock className="h-3 w-3" />
                    Extension
                  </button>
                </div>
              )}

              {task.deliverables && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-600">
                    <span>Deliverable: </span>
                    <a href="#" className="text-blue-600 hover:underline ml-1">{task.deliverables}</a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {isOverview && (
          <div className="mt-4 text-center">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All Tasks
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManagement;
