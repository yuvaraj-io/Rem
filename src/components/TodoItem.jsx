'use client';

import React from 'react';
import {
  Paper,
  Checkbox,
  Typography,
  IconButton,
  Box,
  useTheme
} from '@mui/material';
import {
  Delete as DeleteIcon,
  CheckCircle as CheckedIcon,
  RadioButtonUnchecked as UncheckedIcon
} from '@mui/icons-material';

export default function TodoItem({ todo, onToggle, onDelete }) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: '8px',
        bgcolor: todo.completed
          ? theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
          : 'background.paper',
        opacity: todo.completed ? 0.8 : 1,
        transition: 'all 0.15s ease',
        '&:hover': {
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
        }
      }}
    >
      <Checkbox
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        icon={<UncheckedIcon />}
        checkedIcon={<CheckedIcon color="primary" />}
        sx={{ p: 0.5 }}
      />

      <Typography
        variant="body2"
        sx={{
          flex: 1,
          wordBreak: 'break-word',
          textDecoration: todo.completed ? 'line-through' : 'none',
          color: todo.completed ? 'text.secondary' : 'text.primary',
          fontWeight: todo.completed ? 400 : 500,
        }}
      >
        {todo.text}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          size="small"
          onClick={() => onDelete(todo)}
          sx={{
            color: 'error.main',
            opacity: 0.7,
            '&:hover': { opacity: 1, bgcolor: 'error.light' }
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
}
