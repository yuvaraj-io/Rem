'use client';

import React from 'react';
import { Box, Typography, Grid, Chip } from '@mui/material';
import { FolderOpen as FolderOpenIcon } from '@mui/icons-material';
import FolderCard from './FolderCard';

export default function FolderGrid({
  folders,
  getNodeStats,
  onNavigate,
  onRename,
  onDelete
}) {
  if (folders.length === 0) return null;

  return (
    <Box sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <FolderOpenIcon color="primary" fontSize="small" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Directories
        </Typography>
        <Chip label={folders.length} size="small" color="primary" sx={{ height: 20, fontSize: 11, fontWeight: 700 }} />
      </Box>

      <Grid container spacing={2}>
        {folders.map(folder => (
          <Grid item xs={12} sm={6} md={4} key={folder.id}>
            <FolderCard
              folder={folder}
              stats={getNodeStats(folder.id)}
              onNavigate={onNavigate}
              onRename={onRename}
              onDelete={onDelete}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
