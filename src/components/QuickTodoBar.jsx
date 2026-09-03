'use client';

import React from 'react';
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  FormHelperText
} from '@mui/material';
import {
  AddTask as TaskIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useSanitizedInput } from '../hooks/useSanitizer';

export default function QuickTodoBar({ onAddTodo }) {
  const taskInput = useSanitizedInput('', {
    fieldName: 'Task',
    minLength: 1,
    maxLength: 250,
    required: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskInput.validateOnSubmit()) return;

    onAddTodo(taskInput.sanitizedValue);
    taskInput.reset('');
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 2,
        borderBottom: theme => `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Add a new task in this folder..."
          value={taskInput.value}
          onChange={taskInput.onChange}
          onFocus={taskInput.onFocus}
          onBlur={taskInput.onBlur}
          error={Boolean(taskInput.isTouched && taskInput.error)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <TaskIcon color="action" fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Button
          type="submit"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ minWidth: 100, height: 40 }}
        >
          Add
        </Button>
      </Box>

      {taskInput.isTouched && taskInput.error && (
        <FormHelperText error sx={{ mt: 0.5, ml: 1 }}>
          {taskInput.error}
        </FormHelperText>
      )}
    </Box>
  );
}
