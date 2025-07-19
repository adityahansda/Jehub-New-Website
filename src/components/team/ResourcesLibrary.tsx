import React, { useState } from 'react';
import { FolderOpen, FileText, Download, Image as ImageIcon, Wrench, Search, Filter } from 'lucide-react';

const ResourcesLibrary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const resources = [
    {
      id: 1,
      name: 'Brand Guidelines 2024',
      type: 'document',
      category: 'branding',
      size: '2.5 MB',
      lastModified: '2024-07-01',
      description: 'Complete brand guidelines including logos, colors, and typography.'
    },
    {
      id: 2,
      name: 'JEHUB Logo Pack',
      type: 'image',
      category: 'branding',
      size: '15.2 MB',
      lastModified: '2024-06-28',
      description: 'High-resolution logos in various formats (PNG, SVG, AI).'
    },
    {
      id: 3,
      name: 'Project Management Tool Access',
      type: 'tool',
      category: 'tools',
      size: 'N/A',
      lastModified: '2024-07-05',
      description: 'Access credentials and guides for our project management platform.'
    },
    {
      id: 4,
      name: 'Content Creation Template',
      type: 'document',
      category: 'templates',
      size: '1.8 MB',
      lastModified: '2024-06-30',
      description: 'Standard template for blog posts and social media content.'
    },
    {
      id: 5,
      name: 'Team Photos Collection',
      type: 'image',
      category: 'media',
      size: '45.7 MB',
      lastModified: '2024-06-25',
      description: 'Official team photos for website and promotional materials.'
    },
    {
      id: 6,
      name: 'API Documentation',
      type: 'document',
      category: 'technical',
      size: '3.2 MB',
      lastModified: '2024-07-03',
      description: 'Complete API documentation for developers.'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'branding', label: 'Branding' },
    { value: 'tools', label: 'Tools' },
    { value: 'templates', label: 'Templates' },
    { value: 'media', label: 'Media' },
    { value: 'technical', label: 'Technical' }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-5 w-5 text-blue-600" />;
      case 'image': return <ImageIcon className="h-5 w-5 text-green-600" />;
      case 'tool': return <Wrench className="h-5 w-5 text-purple-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'document': return 'bg-blue-100 text-blue-800';
      case 'image': return 'bg-green-100 text-green-800';
      case 'tool': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || resource.category === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleDownload = (resourceId: number) => {
    console.log('Downloading resource:', resourceId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Resources Library</h2>
        <p className="text-gray-600">Access shared files, documents, and tools</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <div key={resource.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getTypeIcon(resource.type)}
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{resource.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(resource.type)}`}>
                    {resource.type}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{resource.description}</p>

            <div className="space-y-2 text-xs text-gray-500 mb-4">
              <div className="flex justify-between">
                <span>Size:</span>
                <span className="font-medium">{resource.size}</span>
              </div>
              <div className="flex justify-between">
                <span>Modified:</span>
                <span className="font-medium">{resource.lastModified}</span>
              </div>
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="font-medium capitalize">{resource.category}</span>
              </div>
            </div>

            <button
              onClick={() => handleDownload(resource.id)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              {resource.type === 'tool' ? 'Access' : 'Download'}
            </button>
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-600">Try adjusting your search terms or filters.</p>
        </div>
      )}

      {/* Quick Access */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="#"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Brand Guidelines</h4>
              <p className="text-sm text-gray-600">Latest brand assets</p>
            </div>
          </a>

          <a
            href="#"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Wrench className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Project Tools</h4>
              <p className="text-sm text-gray-600">Access team tools</p>
            </div>
          </a>

          <a
            href="#"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Media Assets</h4>
              <p className="text-sm text-gray-600">Photos and graphics</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResourcesLibrary;
