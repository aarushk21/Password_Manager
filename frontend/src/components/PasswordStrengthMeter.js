import React from 'react';
import { Box, Typography, LinearProgress, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

const PasswordStrengthMeter = ({ password }) => {
  const getStrength = (password) => {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };

    strength = Object.values(checks).filter(Boolean).length;
    return { strength, checks };
  };

  const getStrengthColor = (strength) => {
    const colors = ['error', 'warning', 'info', 'success'];
    return colors[Math.min(strength, 4) - 1];
  };

  const getStrengthLabel = (strength) => {
    const labels = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
    return labels[Math.min(strength, 4)];
  };

  const { strength, checks } = getStrength(password);

  return (
    <Box sx={{ mt: 2, width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
          Password Strength:
        </Typography>
        <Typography variant="body2" color={`${getStrengthColor(strength)}.main`}>
          {getStrengthLabel(strength)}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={(strength / 5) * 100}
        color={getStrengthColor(strength)}
        sx={{ height: 8, borderRadius: 4, mb: 2 }}
      />
      <List dense>
        <ListItem>
          <ListItemIcon>
            {checks.length ? <CheckCircle color="success" /> : <Cancel color="error" />}
          </ListItemIcon>
          <ListItemText primary="At least 8 characters long" />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            {checks.uppercase ? <CheckCircle color="success" /> : <Cancel color="error" />}
          </ListItemIcon>
          <ListItemText primary="Contains uppercase letter" />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            {checks.lowercase ? <CheckCircle color="success" /> : <Cancel color="error" />}
          </ListItemIcon>
          <ListItemText primary="Contains lowercase letter" />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            {checks.number ? <CheckCircle color="success" /> : <Cancel color="error" />}
          </ListItemIcon>
          <ListItemText primary="Contains number" />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            {checks.special ? <CheckCircle color="success" /> : <Cancel color="error" />}
          </ListItemIcon>
          <ListItemText primary="Contains special character" />
        </ListItem>
      </List>
    </Box>
  );
};

export default PasswordStrengthMeter; 