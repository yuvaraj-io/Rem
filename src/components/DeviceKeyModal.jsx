'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  IconButton,
  Paper,
  Alert,
  Tooltip,
  Snackbar
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  VpnKey as KeyIcon,
  PhoneIphone as PhoneIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function DeviceKeyModal({ open, onClose }) {
  const { user, regenerateDeviceKey } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleCopy = () => {
    if (user?.loginKey) {
      navigator.clipboard.writeText(user.loginKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleRegenerate = async () => {
    if (!confirm('Regenerating your Device Key will invalidate old keys on secondary devices. Proceed?')) {
      return;
    }
    setIsRegenerating(true);
    try {
      await regenerateDeviceKey();
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <KeyIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Your Device Login Key
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 2.5 }}>
        <Alert severity="info" icon={<PhoneIcon />} sx={{ mb: 2.5 }}>
          Share this key with your mobile, tablet, or work computer. Enter it in the <b>Device Key</b> login tab to log in instantly without Google!
        </Alert>

        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Secret Device Login Key:
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            mt: 0.5,
            mb: 2,
            border: theme => `1px dashed ${theme.palette.primary.main}`,
            borderRadius: '10px',
            bgcolor: theme => (theme.palette.mode === 'dark' ? 'rgba(65, 123, 255, 0.1)' : 'rgba(65, 123, 255, 0.05)'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1
          }}
        >
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'monospace',
              fontWeight: 700,
              fontSize: '1rem',
              color: 'primary.main',
              wordBreak: 'break-all'
            }}
          >
            {user?.loginKey || 'rem_key_loading...'}
          </Typography>

          <Tooltip title={copied ? 'Copied!' : 'Copy to Clipboard'}>
            <IconButton onClick={handleCopy} color={copied ? 'success' : 'primary'} size="small">
              {copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            size="small"
            color="warning"
            startIcon={<RefreshIcon />}
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            {isRegenerating ? 'Generating...' : 'Regenerate Key'}
          </Button>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" fullWidth>
          Done
        </Button>
      </DialogActions>

      <Snackbar
        open={copied}
        autoHideDuration={2500}
        message="Device Key copied to clipboard!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Dialog>
  );
}
