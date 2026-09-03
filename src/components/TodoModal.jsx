'use client';

import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useSanitizedInput } from '../hooks/useSanitizer';

export default function TodoModal({
  open,
  currentFolder,
  onClose,
  onSave
}) {
  const taskInput = useSanitizedInput('', {
    fieldName: 'Task description',
    minLength: 1,
    maxLength: 250,
    required: true
  });

  useEffect(() => {
    if (open) {
      taskInput.reset('');
    }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskInput.validateOnSubmit()) return;

    onSave(taskInput.sanitizedValue);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            New Task
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {currentFolder
              ? `Add task to "${currentFolder.name}"`
              : 'Add task to Root directory'}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3 }}>
        <TextField
          autoFocus
          fullWidth
          label="Task description"
          placeholder="e.g. Finish quarterly project proposal"
          value={taskInput.value}
          onChange={taskInput.onChange}
          onFocus={taskInput.onFocus}
          onBlur={taskInput.onBlur}
          error={Boolean(taskInput.isTouched && taskInput.error)}
          helperText={taskInput.isTouched && taskInput.error}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button type="submit" variant="contained">
          Add Task
        </Button>
      </DialogActions>
    </Dialog>
  );
}
