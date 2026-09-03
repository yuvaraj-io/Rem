'use client';

import React from 'react';
import { Grid, Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import {
  Folder as FolderIcon,
  ListAlt as TodoIcon,
  CheckCircle as DoneIcon,
  PendingActions as PendingIcon
} from '@mui/icons-material';

export default function StatsOverview({ stats }) {
  const theme = useTheme();

  const items = [
    {
      title: 'Folders',
      value: stats.totalFolders,
      icon: <FolderIcon />,
      color: theme.palette.primary.main,
      bgColor: theme.palette.mode === 'dark' ? 'rgba(65, 123, 255, 0.15)' : 'rgba(65, 123, 255, 0.1)'
    },
    {
      title: 'Total Todos',
      value: stats.totalTodos,
      icon: <TodoIcon />,
      color: theme.palette.secondary.main,
      bgColor: theme.palette.mode === 'dark' ? 'rgba(124, 58, 237, 0.15)' : 'rgba(124, 58, 237, 0.1)'
    },
    {
      title: 'Completed',
      value: stats.completedTodos,
      icon: <DoneIcon />,
      color: theme.palette.success.main,
      bgColor: theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)'
    },
    {
      title: 'Pending',
      value: stats.pendingTodos,
      icon: <PendingIcon />,
      color: theme.palette.warning.main,
      bgColor: theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)'
    }
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {items.map((item, index) => (
        <Grid item xs={6} md={3} key={index}>
          <Card
            sx={{
              height: '100%',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.palette.mode === 'dark' ? '0 6px 20px rgba(0,0,0,0.6)' : '0 6px 20px rgba(0,0,0,0.08)'
              }
            }}
          >
            <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 }, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  bgcolor: item.bgColor,
                  color: item.color,
                  flexShrink: 0
                }}
              >
                {item.icon}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {item.title}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.2 }}>
                  {item.value}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
