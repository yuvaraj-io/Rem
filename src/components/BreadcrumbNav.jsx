'use client';

import React from 'react';
import {
  Box,
  Breadcrumbs,
  Chip,
  IconButton,
  Button,
  useTheme
} from '@mui/material';
import {
  Home as HomeIcon,
  Folder as FolderIcon,
  ArrowBack as BackIcon,
  NavigateNext as NextIcon,
  CreateNewFolder as FolderAddIcon,
  Add as TodoAddIcon
} from '@mui/icons-material';

export default function BreadcrumbNav({
  trail,
  onNavigate,
  onBack,
  canGoBack,
  onOpenFolderModal,
  onOpenTodoModal
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1.5,
      }}
    >
      {/* Left: Back Button & Breadcrumbs */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
        <IconButton
          size="small"
          disabled={!canGoBack}
          onClick={onBack}
          sx={{
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }
          }}
        >
          <BackIcon fontSize="small" />
        </IconButton>

        <Breadcrumbs
          separator={<NextIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />}
          aria-label="breadcrumb"
          sx={{ '& .MuiBreadcrumbs-ol': { flexWrap: 'wrap', gap: 0.5 } }}
        >
          {trail.map((item, index) => {
            const isLast = index === trail.length - 1;
            const isRoot = item.id === null;

            return (
              <Chip
                key={item.id || 'root'}
                icon={isRoot ? <HomeIcon sx={{ fontSize: '16px !important' }} /> : <FolderIcon sx={{ fontSize: '16px !important' }} />}
                label={item.name}
                size="small"
                onClick={!isLast ? () => onNavigate(item.id) : undefined}
                sx={{
                  cursor: isLast ? 'default' : 'pointer',
                  fontWeight: isLast ? 700 : 500,
                  bgcolor: isLast
                    ? theme.palette.mode === 'dark' ? 'rgba(65, 123, 255, 0.2)' : 'rgba(65, 123, 255, 0.12)'
                    : 'transparent',
                  color: isLast ? theme.palette.primary.main : 'text.primary',
                  border: isLast ? `1px solid ${theme.palette.primary.main}40` : 'none',
                  '&:hover': {
                    bgcolor: isLast
                      ? undefined
                      : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'
                  }
                }}
              />
            );
          })}
        </Breadcrumbs>
      </Box>

      {/* Right: Quick Action Buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<FolderAddIcon />}
          onClick={onOpenFolderModal}
        >
          Folder
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<TodoAddIcon />}
          onClick={onOpenTodoModal}
        >
          Todo
        </Button>
      </Box>
    </Box>
  );
}
