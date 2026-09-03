'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  Google as GoogleIcon,
  VpnKey as KeyIcon,
  Devices as DevicesIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useSanitizedInput } from '../hooks/useSanitizer';

// SVG Google Icon
function ColorfulGoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: 10 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function AuthModal({ open, onClose }) {
  const [tab, setTab] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const { signInWithGoogle, loginWithKey, loading } = useAuth();

  const keyInput = useSanitizedInput('', {
    fieldName: 'Device Login Key',
    minLength: 6,
    maxLength: 64,
    required: true
  });

  const handleFirebaseGoogleLogin = async () => {
    try {
      setErrorMsg('');
      await signInWithGoogle();
      onClose();
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(err.message || 'Google Login failed');
      }
    }
  };

  const handleKeyLoginSubmit = async (e) => {
    e.preventDefault();
    if (!keyInput.validateOnSubmit()) return;

    try {
      setErrorMsg('');
      await loginWithKey(keyInput.sanitizedValue);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Invalid Device Login Key. Please check the key.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Sign In to Rem
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Sync your nested directories & tasks across devices
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Tabs
        value={tab}
        onChange={(e, val) => {
          setTab(val);
          setErrorMsg('');
        }}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<GoogleIcon fontSize="small" />} iconPosition="start" label="Google Sign-In" />
        <Tab icon={<KeyIcon fontSize="small" />} iconPosition="start" label="Device Key" />
      </Tabs>

      <DialogContent sx={{ py: 3 }}>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        {tab === 0 ? (
          <Box sx={{ textAlign: 'center', py: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Sign in with your Google account to save and sync your tasks in MongoDB.
            </Typography>

            <Button
              variant="outlined"
              fullWidth
              size="large"
              onClick={handleFirebaseGoogleLogin}
              disabled={loading}
              startIcon={<ColorfulGoogleIcon />}
              sx={{
                py: 1.5,
                borderColor: 'divider',
                color: 'text.primary',
                bgcolor: 'background.paper',
                fontWeight: 600,
                fontSize: '0.95rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                '&:hover': {
                  bgcolor: 'action.hover',
                  borderColor: 'primary.main',
                  boxShadow: '0 4px 12px rgba(65, 123, 255, 0.15)',
                }
              }}
            >
              {loading ? <CircularProgress size={20} /> : 'Sign in with Google'}
            </Button>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2.5 }}>
              Uses secure Google Authentication from Mood app
            </Typography>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleKeyLoginSubmit}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <DevicesIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Instant Device Key Login
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Logged in on your mobile or another computer? Enter your secret <b>Device Key</b> here to instantly log in without Google!
            </Typography>

            <TextField
              fullWidth
              label="Device Login Key"
              placeholder="e.g. rem_a1b2c3d4e5f6g7h8"
              value={keyInput.value}
              onChange={keyInput.onChange}
              onFocus={keyInput.onFocus}
              onBlur={keyInput.onBlur}
              error={Boolean(keyInput.isTouched && keyInput.error)}
              helperText={keyInput.isTouched && keyInput.error}
              sx={{ mb: 2 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <KeyIcon />}
            >
              {loading ? 'Authenticating...' : 'Log In via Key'}
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: 'background.default' }}>
        <Button onClick={onClose} color="inherit" fullWidth>
          Continue as Guest (Local Offline Mode)
        </Button>
      </DialogActions>
    </Dialog>
  );
}
