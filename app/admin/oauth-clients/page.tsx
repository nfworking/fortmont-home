'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { withBearerToken } from '@/lib/fetch-auth';

function ensureOfflineAccessScope(scopes: string) {
  const normalizedScopes = scopes
    .split(/\s+/)
    .map((scope) => scope.trim())
    .filter(Boolean);

  if (!normalizedScopes.includes('offline_access')) {
    normalizedScopes.push('offline_access');
  }

  return Array.from(new Set(normalizedScopes)).join(' ');
}

type OAuthClient = {
  id: string;
  clientId: string;
  name: string;
  redirectUris: string[];
  scopes: string[];
  createdAt: string;
};

export default function OAuthClientsAdmin() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const [clients, setClients] = useState<OAuthClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRedirect, setNewRedirect] = useState('');
  const [newScopes, setNewScopes] = useState('openid profile email offline_access');

  const fetchClients = useCallback(async () => {
    const res = await fetch(
      `${process.env.API_HOST}/api/admin/oauth-client`,
      withBearerToken(undefined, accessToken),
    );
    const data = await res.json();
    setClients(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [accessToken]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchClients();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchClients]);

  const handleCreate = async () => {
    const payload = {
      name: newName,
      redirectUris: newRedirect.split(',').map((s) => s.trim()),
      scopes: ensureOfflineAccessScope(newScopes).split(' '),
    };
    const res = await fetch(`${process.env.API_HOST}/api/admin/oauth-client`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      ...withBearerToken(undefined, session?.accessToken),
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const created = await res.json();
      alert(
        `Client created!\nClient ID: ${created.clientId}\nClient Secret: ${created.clientSecret}\nSave the secret now; it will not be shown again.`,
      );
      setShowCreate(false);
      setNewName('');
      setNewRedirect('');
      setNewScopes('openid profile email offline_access');
      fetchClients();
    } else {
      const err = await res.text();
      alert('Failed: ' + err);
    }
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm('Delete client?')) return;
    const res = await fetch(`${process.env.API_HOST}/api/admin/oauth-client`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      ...withBearerToken(undefined, session?.accessToken),
      body: JSON.stringify({ clientId }),
    });
    if (res.ok) fetchClients();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">OAuth Clients (Admin)</h1>
      <Button onClick={() => setShowCreate(true)} className="mb-4">
        Create New Client
      </Button>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full table-auto border">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Client ID</th>
              <th className="px-4 py-2">Redirect URIs</th>
              <th className="px-4 py-2">Scopes</th>
              <th className="px-4 py-2">Created</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-2">{c.name}</td>
                <td className="px-4 py-2 font-mono text-sm">{c.clientId}</td>
                <td className="px-4 py-2 text-xs">{c.redirectUris.join(', ')}</td>
                <td className="px-4 py-2 text-xs">{c.scopes.join(' ')}</td>
                <td className="px-4 py-2 text-xs">{new Date(c.createdAt).toLocaleString()}</td>
                <td className="px-4 py-2">
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(c.clientId)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create OAuth Client</DialogTitle>
            <DialogDescription>
              Enter a name, one or more redirect URIs (comma-separated) and scopes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input placeholder="Client name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Input
              placeholder="Redirect URIs (comma separated)"
              value={newRedirect}
              onChange={(e) => setNewRedirect(e.target.value)}
            />
            <Input placeholder="Scopes (space separated)" value={newScopes} onChange={(e) => setNewScopes(e.target.value)} />
          </div>
          <DialogFooter>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
