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

export default function FolderModal({
  open,
  editFolder,
  currentFolder,
  onClose,
  onSave
}) {
  const isEdit = Boolean(editFolder);

  const folderInput = useSanitizedInput(editFolder?.name || '', {
    fieldName: 'Folder name',
    minLength: 1,
    maxLength: 80,
    required: true
  });

  useEffect(() => {
    if (open) {
      folderInput.reset(editFolder?.name || '');
    }
  }, [open, editFolder]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!folderInput.validateOnSubmit()) return;

    onSave(folderInput.sanitizedValue, editFolder?.id);
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
            {isEdit ? 'Rename Folder' : 'New Folder'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isEdit
              ? 'Update directory name'
              : currentFolder
              ? `Create inside "${currentFolder.name}"`
              : 'Create a root directory'}
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
          label="Folder name"
          placeholder="e.g. Work, Projects, Receipts"
          value={folderInput.value}
          onChange={folderInput.onChange}
          onFocus={folderInput.onFocus}
          onBlur={folderInput.onBlur}
          error={Boolean(folderInput.isTouched && folderInput.error)}
          helperText={folderInput.isTouched && folderInput.error}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button type="submit" variant="contained">
          {isEdit ? 'Save Changes' : 'Create Folder'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
