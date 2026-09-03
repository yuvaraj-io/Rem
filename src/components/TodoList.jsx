'use client';

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Stack
} from '@mui/material';
import { Checklist as ChecklistIcon } from '@mui/icons-material';
import TodoItem from './TodoItem';

export default function TodoList({
  todos,
  activeFilter,
  onFilterChange,
  onToggleTodo,
  onDeleteTodo
}) {
  if (todos.length === 0 && activeFilter === 'all') return null;

  // Filter tasks
  const filteredTodos = todos.filter(t => {
    if (activeFilter === 'active') return !t.completed;
    if (activeFilter === 'completed') return t.completed;
    return true;
  });

  return (
    <Box sx={{ p: 2.5 }}>
      {/* Section Header with Filter Tabs */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ChecklistIcon color="primary" fontSize="small" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Tasks
          </Typography>
          <Chip label={todos.length} size="small" color="primary" sx={{ height: 20, fontSize: 11, fontWeight: 700 }} />
        </Box>

        <ToggleButtonGroup
          value={activeFilter}
          exclusive
          onChange={(e, val) => val && onFilterChange(val)}
          size="small"
          sx={{ height: 32 }}
        >
          <ToggleButton value="all" sx={{ px: 1.5, fontSize: 12, fontWeight: 600 }}>
            All
          </ToggleButton>
          <ToggleButton value="active" sx={{ px: 1.5, fontSize: 12, fontWeight: 600 }}>
            Active
          </ToggleButton>
          <ToggleButton value="completed" sx={{ px: 1.5, fontSize: 12, fontWeight: 600 }}>
            Completed
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Task List */}
      <Stack spacing={1}>
        {filteredTodos.length > 0 ? (
          filteredTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggleTodo}
              onDelete={onDeleteTodo}
            />
          ))
        ) : (
          <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">
              No tasks found in "{activeFilter}" filter.
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
}
