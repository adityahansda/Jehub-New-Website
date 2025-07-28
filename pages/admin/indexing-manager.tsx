import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface PageSetting {
  $id?: string;
  path: string;
  category: string;
  isIndexed: boolean;
  priority: number;
  changefreq: string;
  lastmod?: string;
  metaTitle?: string;
  metaDescription?: string;
  defaultPriority?: number;
  defaultChangefreq?: string;
  shouldIndex?: boolean;
}

interface AppwritePageSetting {
  $id: string;
  pagePath: string;
  isIndexed: boolean;
  priority: number;
  changefreq: string;
  lastmod?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

interface ScannedPage {
  path: string;
  category: string;
  defaultPriority: number;
  defaultChangefreq: string;
  shouldIndex: boolean;
}

const IndexingManager = () => {
  const router = useRouter();
  const [pages, setPages] = useState<PageSetting[]>([]);
  const [existingSettings, setExistingSettings] = useState<PageSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvanced, setShowAdvanced] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch all pages and existing settings
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch scanned pages
      const pagesResponse = await fetch('/api/admin/scan-pages');
      const pagesData = await pagesResponse.json();
      
      // Fetch existing settings
      const settingsResponse = await fetch('/api/admin/page-indexing');
      const settingsData = await settingsResponse.json();
      
      if (pagesData.success && settingsData.success) {
        const scannedPages: ScannedPage[] = pagesData.data;
        const appwriteSettings: AppwritePageSetting[] = settingsData.data;
        
        // Merge scanned pages with existing settings
        const mergedPages: PageSetting[] = scannedPages.map(page => {
          const existingSetting = appwriteSettings.find(setting => setting.pagePath === page.path);
          
          return {
            $id: existingSetting?.$id,
            path: page.path,
            category: page.category,
            isIndexed: existingSetting?.isIndexed ?? page.shouldIndex,
            priority: existingSetting?.priority ?? page.defaultPriority,
            changefreq: existingSetting?.changefreq ?? page.defaultChangefreq,
            lastmod: existingSetting?.lastmod,
            metaTitle: existingSetting?.metaTitle || '',
            metaDescription: existingSetting?.metaDescription || '',
            defaultPriority: page.defaultPriority,
            defaultChangefreq: page.defaultChangefreq,
            shouldIndex: page.shouldIndex
          };
        });
        
        setPages(mergedPages);
        // Convert Appwrite settings to PageSetting format for state
        const convertedSettings: PageSetting[] = appwriteSettings.map(setting => ({
          $id: setting.$id,
          path: setting.pagePath,
          category: 'Unknown', // This will be determined by scanned pages
          isIndexed: setting.isIndexed,
          priority: setting.priority,
          changefreq: setting.changefreq,
          lastmod: setting.lastmod,
          metaTitle: setting.metaTitle,
          metaDescription: setting.metaDescription
        }));
        setExistingSettings(convertedSettings);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ type: 'error', text: 'Failed to load page data' });
    } finally {
      setLoading(false);
    }
  };

  const updatePageSetting = (path: string, updates: Partial<PageSetting>) => {
    setPages(prev => prev.map(page => 
      page.path === path ? { ...page, ...updates } : page
    ));
  };

  const savePage = async (page: PageSetting) => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/admin/page-indexing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pagePath: page.path,
          isIndexed: page.isIndexed,
          priority: page.priority,
          changefreq: page.changefreq,
          lastmod: new Date().toISOString(),
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        fetchData(); // Refresh data
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      console.error('Error saving page:', error);
      setMessage({ type: 'error', text: 'Failed to save page setting' });
    } finally {
      setSaving(false);
    }
  };

  const saveAllPages = async () => {
    try {
      setSaving(true);
      const promises = pages.map(page => 
        fetch('/api/admin/page-indexing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pagePath: page.path,
            isIndexed: page.isIndexed,
            priority: page.priority,
            changefreq: page.changefreq,
            lastmod: new Date().toISOString(),
            metaTitle: page.metaTitle,
            metaDescription: page.metaDescription
          })
        })
      );
      
      await Promise.all(promises);
      setMessage({ type: 'success', text: 'All pages saved successfully!' });
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save all pages' });
    } finally {
      setSaving(false);
    }
  };

  const toggleAllInCategory = (category: string, isIndexed: boolean) => {
    setPages(prev => prev.map(page =>
      page.category === category ? { ...page, isIndexed } : page
    ));
  };

  // Filter pages
  const filteredPages = pages.filter(page => {
    const matchesCategory = selectedCategory === 'All' || page.category === selectedCategory;
    const matchesSearch = page.path.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['All', ...Array.from(new Set(pages.map(page => page.category)))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pages...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Google Indexing Manager - Admin</title>
        <meta name="description" content="Manage which pages are indexed by Google" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Google Indexing Manager</h1>
                  <p className="text-gray-600">Control which pages are indexed by Google search</p>
                </div>
                <button
                  onClick={() => router.back()}
                  className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-700"
                >
                  ← Back
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Controls */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <input
                  type="text"
                  placeholder="Search pages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 min-w-[200px]"
                />
              </div>
              
              <button
                onClick={saveAllPages}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium"
              >
                {saving ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900">Total Pages</h3>
              <p className="text-3xl font-bold text-blue-600">{pages.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900">Indexed</h3>
              <p className="text-3xl font-bold text-green-600">
                {pages.filter(p => p.isIndexed).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900">Not Indexed</h3>
              <p className="text-3xl font-bold text-red-600">
                {pages.filter(p => !p.isIndexed).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
              <p className="text-3xl font-bold text-purple-600">{categories.length - 1}</p>
            </div>
          </div>

          {/* Pages List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Page Path
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Indexed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Change Freq
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPages.map((page, index) => (
                    <React.Fragment key={page.path}>
                      <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{page.path}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {page.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={page.isIndexed}
                              onChange={(e) => updatePageSetting(page.path, { isIndexed: e.target.checked })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className={`ml-2 text-sm ${page.isIndexed ? 'text-green-600' : 'text-red-600'}`}>
                              {page.isIndexed ? 'Yes' : 'No'}
                            </span>
                          </label>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max="1"
                            step="0.1"
                            value={page.priority}
                            onChange={(e) => updatePageSetting(page.path, { priority: parseFloat(e.target.value) })}
                            className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={page.changefreq}
                            onChange={(e) => updatePageSetting(page.path, { changefreq: e.target.value })}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          >
                            <option value="always">Always</option>
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                            <option value="never">Never</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => savePage(page)}
                            disabled={saving}
                            className="text-blue-600 hover:text-blue-900 disabled:text-blue-400"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setShowAdvanced(showAdvanced === page.path ? null : page.path)}
                            className="text-green-600 hover:text-green-900"
                          >
                            {showAdvanced === page.path ? 'Hide' : 'Advanced'}
                          </button>
                        </td>
                      </tr>
                      
                      {showAdvanced === page.path && (
                        <tr className="bg-gray-100">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Meta Title
                                </label>
                                <input
                                  type="text"
                                  value={page.metaTitle || ''}
                                  onChange={(e) => updatePageSetting(page.path, { metaTitle: e.target.value })}
                                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                  placeholder="Custom meta title for this page"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Meta Description
                                </label>
                                <textarea
                                  value={page.metaDescription || ''}
                                  onChange={(e) => updatePageSetting(page.path, { metaDescription: e.target.value })}
                                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                  placeholder="Custom meta description for this page"
                                  rows={3}
                                />
                              </div>
                              <div className="text-xs text-gray-500">
                                Last modified: {page.lastmod ? new Date(page.lastmod).toLocaleString() : 'Never'}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Actions */}
          {selectedCategory !== 'All' && (
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Bulk Actions for {selectedCategory}
              </h3>
              <div className="flex gap-4">
                <button
                  onClick={() => toggleAllInCategory(selectedCategory, true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  Index All in {selectedCategory}
                </button>
                <button
                  onClick={() => toggleAllInCategory(selectedCategory, false)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  Remove All from Index
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default IndexingManager;
