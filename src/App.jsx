'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Container,
  Card,
  Divider,
  Box,
  Typography,
  Button,
  CircularProgress
} from '@mui/material';
import {
  FolderOpen as FolderOpenIcon,
  CreateNewFolder as FolderAddIcon,
  AddTask as TodoAddIcon
} from '@mui/icons-material';

import { useAuth } from './context/AuthContext';
import { api } from './services/api';

import Header from './components/Header';
import StatsOverview from './components/StatsOverview';
import BreadcrumbNav from './components/BreadcrumbNav';
import QuickTodoBar from './components/QuickTodoBar';
import FolderGrid from './components/FolderGrid';
import TodoList from './components/TodoList';
import FolderModal from './components/FolderModal';
import TodoModal from './components/TodoModal';
import AuthModal from './components/AuthModal';
import DeviceKeyModal from './components/DeviceKeyModal';

export default function App() {
  const { token, user, isAuthenticated } = useAuth();

  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  // Modals state
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [editFolder, setEditFolder] = useState(null);
  const [todoModalOpen, setTodoModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [deviceKeyModalOpen, setDeviceKeyModalOpen] = useState(false);

  // 1. Initial Load & Legacy Migration
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let fetched = await api.fetchNodes(token);

      // Check legacy single-level data if empty
      if (fetched.length === 0 && typeof window !== 'undefined') {
        try {
          const legacyRaw = localStorage.getItem('list');
          if (legacyRaw) {
            const legacyList = JSON.parse(legacyRaw);
            if (Array.isArray(legacyList) && legacyList.length > 0) {
              const converted = [];
              legacyList.forEach(cat => {
                if (!cat?.name) return;
                const folderId = `f_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
                converted.push({
                  id: folderId,
                  type: 'folder',
                  name: String(cat.name).trim(),
                  parentId: null,
                  createdAt: new Date().toISOString()
                });

                const todos = Array.isArray(cat.todos) ? cat.todos : [];
                todos.forEach(t => {
                  const txt = typeof t === 'string' ? t : t.text;
                  if (txt) {
                    converted.push({
                      id: `t_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                      type: 'todo',
                      text: String(txt).trim(),
                      completed: Boolean(t.completed),
                      parentId: folderId,
                      createdAt: new Date().toISOString()
                    });
                  }
                });
              });

              if (converted.length > 0) {
                fetched = await api.syncNodes(converted, token);
              }
            }
          }
        } catch (e) {
          console.warn('Legacy migration error:', e);
        }
      }

      setNodes(fetched);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 2. Navigation & Breadcrumb Trail
  const currentFolder = useMemo(() => {
    if (currentFolderId === null) return null;
    return nodes.find(n => n.id === currentFolderId && n.type === 'folder') || null;
  }, [nodes, currentFolderId]);

  // Reset to root if current folder no longer exists
  useEffect(() => {
    if (currentFolderId !== null && !currentFolder) {
      setCurrentFolderId(null);
    }
  }, [currentFolderId, currentFolder]);

  const breadcrumbTrail = useMemo(() => {
    const trail = [];
    let currId = currentFolderId;

    while (currId !== null) {
      const folder = nodes.find(n => n.id === currId && n.type === 'folder');
      if (!folder) break;
      trail.unshift({ id: folder.id, name: folder.name });
      currId = folder.parentId;
    }

    trail.unshift({ id: null, name: 'Root' });
    return trail;
  }, [nodes, currentFolderId]);

  // 3. Child Folders & Todos in active directory
  const currentFolders = useMemo(() => {
    return nodes.filter(n => n.parentId === currentFolderId && n.type === 'folder');
  }, [nodes, currentFolderId]);

  const currentTodos = useMemo(() => {
    return nodes.filter(n => n.parentId === currentFolderId && n.type === 'todo');
  }, [nodes, currentFolderId]);

  // 4. Recursive Statistics Calculation
  const getNodeStats = useCallback((folderId) => {
    const descendantFolderIds = [];
    const descendantTodoIds = [];

    function traverse(pId) {
      nodes
        .filter(n => n.parentId === pId)
        .forEach(child => {
          if (child.type === 'folder') {
            descendantFolderIds.push(child.id);
            traverse(child.id);
          } else if (child.type === 'todo') {
            descendantTodoIds.push(child.id);
          }
        });
    }

    traverse(folderId);

    const directFolders = nodes.filter(n => n.parentId === folderId && n.type === 'folder');
    const directTodos = nodes.filter(n => n.parentId === folderId && n.type === 'todo');
    const allTodoIds = new Set([...descendantTodoIds, ...directTodos.map(t => t.id)]);
    const allTodos = nodes.filter(n => allTodoIds.has(n.id));
    const doneTodos = allTodos.filter(t => t.completed);

    return {
      directFolderCount: directFolders.length,
      directTodoCount: directTodos.length,
      totalFolders: descendantFolderIds.length,
      totalTodos: allTodos.length,
      completedTodos: doneTodos.length,
      pendingTodos: allTodos.length - doneTodos.length
    };
  }, [nodes]);

  // Global workspace stats
  const globalStats = useMemo(() => {
    const folders = nodes.filter(n => n.type === 'folder');
    const todos = nodes.filter(n => n.type === 'todo');
    const completed = todos.filter(t => t.completed).length;

    return {
      totalFolders: folders.length,
      totalTodos: todos.length,
      completedTodos: completed,
      pendingTodos: todos.length - completed
    };
  }, [nodes]);

  // 5. Actions: Folders
  const handleOpenFolderModal = (folderToEdit = null) => {
    setEditFolder(folderToEdit);
    setFolderModalOpen(true);
  };

  const handleSaveFolder = async (name, editId = null) => {
    if (editId) {
      const updated = await api.updateNode(editId, { name }, token);
      setNodes(prev => prev.map(n => (n.id === editId ? updated : n)));
    } else {
      const created = await api.createNode(
        {
          type: 'folder',
          name,
          parentId: currentFolderId
        },
        token
      );
      setNodes(prev => [...prev, created]);
    }
  };

  const handleDeleteFolder = async (folder) => {
    const stats = getNodeStats(folder.id);
    let confirmMsg = `Delete directory "${folder.name}"?`;
    if (stats.totalFolders > 0 || stats.totalTodos > 0) {
      confirmMsg = `Delete "${folder.name}" and ALL its contents (${stats.totalFolders} subfolders and ${stats.totalTodos} tasks)?`;
    }

    if (!confirm(confirmMsg)) return;

    const res = await api.deleteNode(folder.id, token);
    const deletedIds = new Set(res.deletedIds || [folder.id]);
    setNodes(prev => prev.filter(n => !deletedIds.has(n.id)));

    if (currentFolderId === folder.id || deletedIds.has(currentFolderId)) {
      setCurrentFolderId(folder.parentId);
    }
  };

  // 6. Actions: Todos
  const handleAddTodo = async (text) => {
    const created = await api.createNode(
      {
        type: 'todo',
        text,
        parentId: currentFolderId,
        completed: false
      },
      token
    );
    setNodes(prev => [...prev, created]);
  };

  const handleToggleTodo = async (todoId) => {
    const todo = nodes.find(n => n.id === todoId);
    if (!todo) return;

    const updated = await api.updateNode(todoId, { completed: !todo.completed }, token);
    setNodes(prev => prev.map(n => (n.id === todoId ? updated : n)));
  };

  const handleDeleteTodo = async (todo) => {
    if (!confirm(`Delete task "${todo.text}"?`)) return;

    await api.deleteNode(todo.id, token);
    setNodes(prev => prev.filter(n => n.id !== todo.id));
  };

  const isDirectoryEmpty = currentFolders.length === 0 && currentTodos.length === 0;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
      {/* Top Navigation Bar */}
      <Header
        onOpenFolderModal={() => handleOpenFolderModal()}
        onOpenTodoModal={() => setTodoModalOpen(true)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenDeviceKeyModal={() => setDeviceKeyModalOpen(true)}
      />

      <Container maxWidth="lg" sx={{ mt: { xs: 2.5, md: 4 } }}>
        {/* Workspace Summary Cards */}
        <StatsOverview stats={globalStats} />

        {/* Main Explorer Card */}
        <Card>
          {/* Breadcrumb Navigation Bar */}
          <BreadcrumbNav
            trail={breadcrumbTrail}
            onNavigate={id => setCurrentFolderId(id)}
            onBack={() => setCurrentFolderId(currentFolder?.parentId ?? null)}
            canGoBack={currentFolderId !== null}
            onOpenFolderModal={() => handleOpenFolderModal()}
            onOpenTodoModal={() => setTodoModalOpen(true)}
          />

          {/* Quick Task Bar (with DOMPurify Sanitization) */}
          <QuickTodoBar onAddTodo={handleAddTodo} />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Sub-directories Grid */}
              <FolderGrid
                folders={currentFolders}
                getNodeStats={getNodeStats}
                onNavigate={id => setCurrentFolderId(id)}
                onRename={folder => handleOpenFolderModal(folder)}
                onDelete={handleDeleteFolder}
              />

              {currentFolders.length > 0 && currentTodos.length > 0 && <Divider />}

              {/* Tasks List with Filter Tabs */}
              <TodoList
                todos={currentTodos}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                onToggleTodo={handleToggleTodo}
                onDeleteTodo={handleDeleteTodo}
              />

              {/* Empty Directory State */}
              {isDirectoryEmpty && (
                <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
                  <FolderOpenIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {currentFolder ? `"${currentFolder.name}" is empty` : 'Your workspace is empty'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Create subfolders to organize projects, or add your first task here.
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5 }}>
                    <Button
                      variant="outlined"
                      startIcon={<FolderAddIcon />}
                      onClick={() => handleOpenFolderModal()}
                    >
                      New Folder
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<TodoAddIcon />}
                      onClick={() => setTodoModalOpen(true)}
                    >
                      Add Todo
                    </Button>
                  </Box>
                </Box>
              )}
            </>
          )}
        </Card>
      </Container>

      {/* Modals */}
      <FolderModal
        open={folderModalOpen}
        editFolder={editFolder}
        currentFolder={currentFolder}
        onClose={() => {
          setFolderModalOpen(false);
          setEditFolder(null);
        }}
        onSave={handleSaveFolder}
      />

      <TodoModal
        open={todoModalOpen}
        currentFolder={currentFolder}
        onClose={() => setTodoModalOpen(false)}
        onSave={handleAddTodo}
      />

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <DeviceKeyModal
        open={deviceKeyModalOpen}
        onClose={() => setDeviceKeyModalOpen(false)}
      />
    </Box>
  );
}
