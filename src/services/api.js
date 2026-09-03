// API Service with seamless LocalStorage fallback

const API_BASE = '/api';
const LOCAL_STORAGE_KEY = 'rem_tree_data_v2';

function getLocalNodes() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalNodes(nodes) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nodes));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

function getAuthHeaders(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // 1. Auth: Google Login
  async googleLogin(credential, mockUser = null) {
    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, mockUser })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Google login failed');
      }
      return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, creating local mock session:', e);
      const user = mockUser || {
        id: 'local_user_' + Date.now(),
        name: 'Demo User',
        email: 'user@example.com',
        loginKey: 'rem_' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)
      };
      return { token: 'mock_jwt_token', user };
    }
  },

  // 2. Auth: Key Login
  async keyLogin(loginKey) {
    try {
      const res = await fetch(`${API_BASE}/auth/key-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginKey })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Key login failed');
      }
      return await res.json();
    } catch (e) {
      if (e.message && e.message.includes('Invalid Device Key')) {
        throw e;
      }
      // Offline fallback: check local user key
      const localUserRaw = localStorage.getItem('rem_auth_user');
      if (localUserRaw) {
        const localUser = JSON.parse(localUserRaw);
        if (localUser.loginKey === loginKey.trim()) {
          return { token: localStorage.getItem('rem_auth_token') || 'local_token', user: localUser };
        }
      }
      throw new Error(e.message || 'Key login failed');
    }
  },

  // 3. Auth: Regenerate Key
  async regenerateKey(token) {
    try {
      const res = await fetch(`${API_BASE}/auth/regenerate-key`, {
        method: 'POST',
        headers: getAuthHeaders(token)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Regenerate key fallback:', e);
    }
    const newKey = 'rem_' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    return { loginKey: newKey };
  },

  // 4. Fetch Nodes
  async fetchNodes(token) {
    try {
      const res = await fetch(`${API_BASE}/nodes`, {
        headers: getAuthHeaders(token)
      });
      if (res.ok) {
        const nodes = await res.json();
        saveLocalNodes(nodes);
        return nodes;
      }
    } catch (e) {
      console.warn('Fetch nodes falling back to local storage:', e);
    }
    return getLocalNodes();
  },

  // 5. Create Node (Folder or Todo)
  async createNode(nodeData, token) {
    try {
      const res = await fetch(`${API_BASE}/nodes`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(nodeData)
      });
      if (res.ok) {
        const created = await res.json();
        const local = getLocalNodes();
        saveLocalNodes([...local, created]);
        return created;
      }
    } catch (e) {
      console.warn('Create node falling back to local storage:', e);
    }

    const localNode = {
      id: `${nodeData.type}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      type: nodeData.type,
      name: nodeData.name || '',
      text: nodeData.text || '',
      parentId: nodeData.parentId || null,
      completed: Boolean(nodeData.completed),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const local = getLocalNodes();
    saveLocalNodes([...local, localNode]);
    return localNode;
  },

  // 6. Update Node
  async updateNode(id, updates, token) {
    try {
      const res = await fetch(`${API_BASE}/nodes/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updated = await res.json();
        const local = getLocalNodes().map(n => (n.id === id ? { ...n, ...updated } : n));
        saveLocalNodes(local);
        return updated;
      }
    } catch (e) {
      console.warn('Update node falling back to local storage:', e);
    }

    const local = getLocalNodes().map(n => {
      if (n.id === id) {
        return { ...n, ...updates, updatedAt: new Date().toISOString() };
      }
      return n;
    });
    saveLocalNodes(local);
    return local.find(n => n.id === id);
  },

  // 7. Delete Node (Recursive)
  async deleteNode(id, token) {
    try {
      const res = await fetch(`${API_BASE}/nodes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token)
      });
      if (res.ok) {
        const data = await res.json();
        const deletedIds = new Set(data.deletedIds || [id]);
        const local = getLocalNodes().filter(n => !deletedIds.has(n.id));
        saveLocalNodes(local);
        return data;
      }
    } catch (e) {
      console.warn('Delete node falling back to local storage:', e);
    }

    // Local recursive deletion
    const local = getLocalNodes();
    const idsToDelete = [id];

    function findDescendants(parentId) {
      local
        .filter(n => n.parentId === parentId)
        .forEach(child => {
          idsToDelete.push(child.id);
          if (child.type === 'folder') {
            findDescendants(child.id);
          }
        });
    }

    findDescendants(id);
    const updated = local.filter(n => !idsToDelete.includes(n.id));
    saveLocalNodes(updated);
    return { success: true, deletedIds: idsToDelete };
  },

  // 8. Initial Local-to-Cloud Sync
  async syncNodes(nodes, token) {
    try {
      const res = await fetch(`${API_BASE}/nodes/sync`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ nodes })
      });
      if (res.ok) {
        const synced = await res.json();
        saveLocalNodes(synced);
        return synced;
      }
    } catch (e) {
      console.warn('Sync fallback:', e);
    }
    return nodes;
  }
};
