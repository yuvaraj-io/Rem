'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Avatar,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  VpnKey as KeyIcon,
  CreateNewFolder as FolderAddIcon,
  AddTask as TodoAddIcon,
  Login as LoginIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Header({
  onOpenFolderModal,
  onOpenTodoModal,
  onOpenAuthModal,
  onOpenDeviceKeyModal
}) {
  const { isDark, toggleTheme } = useAppTheme();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: isDark
          ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
          : 'linear-gradient(135deg, #417bff 0%, #2953cc 100%)',
        borderBottom: theme => `1px solid ${theme.palette.divider}`,
        px: { xs: 1, md: 3 },
      }}
    >
      <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: 72 }}>
        {/* Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src="/rem.png"
            alt="Rem"
            sx={{
              width: 44,
              height: 44,
              p: 0.5,
              bgcolor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#ffffff' }}>
              Rem
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', display: { xs: 'none', sm: 'block' } }}>
              Remember your TODOs & Nested Folders
            </Typography>
          </Box>
        </Box>

        {/* Right Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FolderAddIcon />}
            onClick={() => onOpenFolderModal()}
            sx={{
              color: '#ffffff',
              borderColor: 'rgba(255,255,255,0.3)',
              bgcolor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)',
                borderColor: '#ffffff',
              },
              display: { xs: 'none', sm: 'inline-flex' }
            }}
          >
            New Folder
          </Button>

          <Button
            variant="contained"
            size="small"
            startIcon={<TodoAddIcon />}
            onClick={() => onOpenTodoModal()}
            sx={{
              bgcolor: '#ffffff',
              color: '#417bff',
              fontWeight: 700,
              '&:hover': {
                bgcolor: '#f0f4ff',
              },
              display: { xs: 'none', sm: 'inline-flex' }
            }}
          >
            New Todo
          </Button>

          {/* Theme Toggle */}
          <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton onClick={toggleTheme} sx={{ color: '#ffffff' }}>
              {isDark ? <LightIcon /> : <DarkIcon />}
            </IconButton>
          </Tooltip>

          {/* Auth & Device Key Button */}
          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="View / Share Device Login Key">
                <Chip
                  icon={<KeyIcon sx={{ '&&': { color: '#ffffff', fontSize: 16 } }} />}
                  label="Device Key"
                  size="small"
                  onClick={onOpenDeviceKeyModal}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.15)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontWeight: 600,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                  }}
                />
              </Tooltip>

              <Tooltip title={user?.name || user?.email}>
                <Avatar
                  src={user?.picture}
                  alt={user?.name}
                  sx={{ width: 34, height: 34, bgcolor: '#ffffff', color: '#417bff', fontSize: 14, fontWeight: 700 }}
                >
                  {(user?.name || user?.email || 'U')[0].toUpperCase()}
                </Avatar>
              </Tooltip>

              <Tooltip title="Logout">
                <IconButton onClick={logout} size="small" sx={{ color: '#ffffff', opacity: 0.85 }}>
                  <LogoutIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ) : (
            <Button
              variant="contained"
              size="small"
              startIcon={<LoginIcon />}
              onClick={onOpenAuthModal}
              sx={{
                bgcolor: '#ffffff',
                color: '#417bff',
                fontWeight: 700,
                '&:hover': { bgcolor: '#f0f4ff' }
              }}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
