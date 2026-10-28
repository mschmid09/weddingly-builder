import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import BuilderForm from './BuilderForm';
import RSVPList from './RSVPList';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import type { WeddingSite } from '../lib/validations';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'builder' | 'rsvps'>(
    'builder',
  );
  const [weddingSite, setWeddingSite] = useState<WeddingSite | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState<WeddingSite[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetchWeddingSite();
  }, []);

  const fetchWeddingSite = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const response = await fetch('/api/wedding/site');
      if (!response.ok) throw new Error('Unable to load saved wedding versions.');
      const data = await response.json();
      setWeddingSite(data.weddingSite);
      setVersions(data.versions || []);
    } catch (error) {
      console.error('Failed to fetch wedding site:', error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Logged out successfully');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  const handleSave = (updatedSite: WeddingSite, updatedVersions: WeddingSite[]) => {
    setWeddingSite(updatedSite);
    setVersions(updatedVersions);
    setHasUnsavedChanges(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Wedding Admin
              </h1>
              {weddingSite?.slug && (
                <p className="text-sm text-gray-500">
                  <a href="/" target="_blank" rel="noopener noreferrer">
                    View wedding invitation
                  </a>
                </p>
              )}
            </div>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('builder')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'builder'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Builder
            </button>
            <button
              onClick={() => setActiveTab('rsvps')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rsvps'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              RSVP List
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loadError ? (
          <div role="alert" className="space-y-4">
            <p>Unable to load your saved wedding. Your existing versions have not been changed.</p>
            <Button onClick={fetchWeddingSite}>Try again</Button>
          </div>
        ) : activeTab === 'builder' ? (
          <>
          {versions.length > 0 && (
            <div className="mb-6 space-y-2">
              <label htmlFor="wedding-version" className="block text-sm font-medium">Saved version</label>
              <select
                id="wedding-version"
                className="w-full max-w-xl rounded-md border bg-white px-3 py-2 text-sm"
                value={weddingSite?.versionId || ''}
                onChange={event => {
                  const selected = versions.find(version => version.versionId === event.target.value);
                  if (!selected || selected.versionId === weddingSite?.versionId) return;
                  if (hasUnsavedChanges && !window.confirm('Switch versions and discard your unsaved edits?')) return;
                  setWeddingSite(selected);
                  setHasUnsavedChanges(false);
                }}
              >
                {versions.map(version => (
                  <option key={version.versionId} value={version.versionId}>
                    Version {version.versionNumber} - {new Date(version.updatedAt).toLocaleString()} {version.isPublished ? '(Live)' : '(Draft)'}
                  </option>
                ))}
              </select>
            </div>
          )}
          <BuilderForm
            key={weddingSite?.versionId || weddingSite?.id || 'new'}
            initialData={weddingSite ?? undefined}
            onSave={handleSave}
            onDirtyChange={setHasUnsavedChanges}
          />
          </>
        ) : (
          <RSVPList siteId={weddingSite?.id} />
        )}
      </main>
    </div>
  );
}
