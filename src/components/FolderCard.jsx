'use client';

import React, { useState } from 'react';
import {
  Card,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  useTheme
} from '@mui/material';
import {
  Folder as FolderIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

export default function FolderCard({
  folder,
  stats,
  onNavigate,
  onRename,
  onDelete
}) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = (e) => {
    if (e) e.stopPropagation();
    setAnchorEl(null);
  };

  const handleRenameClick = (e) => {
    e.stopPropagation();
    handleMenuClose();
    onRename(folder);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    handleMenuClose();
    onDelete(folder);
  };

  // Subtitle stats text
  let metaText = 'Empty directory';
  if (stats.totalTodos > 0 || stats.directFolderCount > 0) {
    const fStr = stats.directFolderCount ? `${stats.directFolderCount} folder${stats.directFolderCount > 1 ? 's' : ''}` : '';
    const tStr = `${stats.totalTodos} task${stats.totalTodos > 1 ? 's' : ''} (${stats.completedTodos} done)`;
    metaText = fStr ? `${fStr} • ${tStr}` : tStr;
  }

  return (
    <Card
      onClick={() => onNavigate(folder.id)}
      sx={{
        p: 2,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        bgcolor: 'background.paper',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: theme.palette.primary.main,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(65, 123, 255, 0.08)' : 'rgba(65, 123, 255, 0.03)',
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            borderRadius: '10px',
            bgcolor: '#ffb30018',
            color: '#ffb300',
            flexShrink: 0
          }}
        >
          <FolderIcon sx={{ fontSize: 28 }} />
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {folder.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            {metaText}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton size="small" onClick={handleMenuOpen} sx={{ color: 'text.secondary' }}>
          <MoreIcon fontSize="small" />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          onClick={e => e.stopPropagation()}
        >
          <MenuItem onClick={handleRenameClick}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Rename</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    </Card>
  );
}
