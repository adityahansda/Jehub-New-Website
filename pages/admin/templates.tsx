import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Settings,
  Save,
  RefreshCw,
  MessageSquare,
  ChevronLeft,
  Edit3,
  Plus,
  Trash2,
  Check,
  X,
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  isActive: boolean;
  isDefault: boolean;
}

const TemplateManagement = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState<Template | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/templates');
      const data = await response.json();

      if (response.ok) {
        setTemplates(data.templates || []);
      } else {
        setError(data.error || 'Failed to load templates');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async (template: Template) => {
    try {
      setError('');
      const method = template.id ? 'PUT' : 'POST';
      const response = await fetch('/api/admin/templates', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });

      if (response.ok) {
        setSuccess(`Template "${template.name}" saved successfully!`);
        fetchTemplates();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      setError('Failed to save template');
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      setError('');
      const response = await fetch('/api/admin/templates', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setSuccess('Template deleted successfully!');
        fetchTemplates();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      setError('Failed to delete template');
    }
  };

  const activateTemplate = async (id: string) => {
    try {
      setError('');
      const response = await fetch('/api/admin/templates', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setSuccess('Template activated successfully!');
        fetchTemplates();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to activate template');
      }
    } catch (error) {
      console.error('Error activating template:', error);
      setError('Failed to activate template');
    }
  };

  const handleEditTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setEditingTemplateId(templateId);
      setNewTemplate({ ...template });
    }
  };

  const handleNewTemplate = () => {
    setNewTemplate({
      id: '',
      name: '',
      description: '',
      content: '',
      isActive: false,
      isDefault: false,
    });
    setEditingTemplateId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading templates...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Admin Panel
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Template Management</h1>
          </div>
          <p className="text-gray-600">
            Manage multiple sharing message templates for different contexts.
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Template List */}
        <div className="space-y-6">
          <button
            onClick={handleNewTemplate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add New Template
          </button>

          {templates.map((template) => (
            <div
              key={template.id}
              className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6
                ${template.isActive ? 'border-blue-500' : ''}
              `}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    {template.name}
                    {template.isActive && (
                      <span className="text-sm text-white bg-blue-600 rounded-full px-2 py-0.5 ml-2">
                        Active
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-600">{template.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditTemplate(template.id)}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Edit3 className="h-5 w-5" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                    Delete
                  </button>
                  <button
                    onClick={() => activateTemplate(template.id)}
                    disabled={template.isActive}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      template.isActive 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
                    }`}
                  >
                    <Check className="h-5 w-5" />
                    Activate
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm whitespace-pre-wrap">
                {template.content}
              </div>
            </div>
          ))}
        </div>

        {newTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xl mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingTemplateId ? 'Edit Template' : 'New Template'}
                </h3>
                <button
                  onClick={() => setNewTemplate(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newTemplate) return;
                  saveTemplate(newTemplate);
                  setNewTemplate(null);
                }}
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, name: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Template name"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newTemplate.description}
                    onChange={(e) =>
                      setNewTemplate({
                        ...newTemplate,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Short description (optional)"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Content
                  </label>
                  <textarea
                    value={newTemplate.content}
                    onChange={(e) =>
                      setNewTemplate({
                        ...newTemplate,
                        content: e.target.value,
                      })
                    }
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="Enter your template..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use placeholders: {'{title}'}, {'{subject}'}, {'{branch}'}, {'{semester}'}, {'{uploader}'}, {'{url}'}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setNewTemplate(null)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateManagement;

