import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  IconButton, 
  Slider, 
  Typography, 
  FormControlLabel, 
  Checkbox,
  Tooltip
} from '@mui/material';
import { ContentCopy, Refresh } from '@mui/icons-material';

const PasswordGenerator = ({ onPasswordGenerated }) => {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
  });
  const [generatedPassword, setGeneratedPassword] = useState('');

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = '';
    if (options.uppercase) chars += uppercase;
    if (options.lowercase) chars += lowercase;
    if (options.numbers) chars += numbers;
    if (options.symbols) chars += symbols;

    if (chars === '') {
      setGeneratedPassword('');
      return;
    }

    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      password += chars[randomIndex];
    }

    setGeneratedPassword(password);
    if (onPasswordGenerated) {
      onPasswordGenerated(password);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPassword);
  };

  return (
    <Box sx={{ mt: 2, width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
          Password Length: {length}
        </Typography>
        <Slider
          value={length}
          onChange={(_, value) => setLength(value)}
          min={8}
          max={32}
          sx={{ flex: 1, mx: 2 }}
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={options.uppercase}
              onChange={(e) => setOptions({ ...options, uppercase: e.target.checked })}
            />
          }
          label="Uppercase (A-Z)"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={options.lowercase}
              onChange={(e) => setOptions({ ...options, lowercase: e.target.checked })}
            />
          }
          label="Lowercase (a-z)"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={options.numbers}
              onChange={(e) => setOptions({ ...options, numbers: e.target.checked })}
            />
          }
          label="Numbers (0-9)"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={options.symbols}
              onChange={(e) => setOptions({ ...options, symbols: e.target.checked })}
            />
          }
          label="Symbols (!@#$%^&*)"
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography
          variant="body1"
          sx={{
            flex: 1,
            p: 1,
            bgcolor: 'background.paper',
            borderRadius: 1,
            fontFamily: 'monospace',
            wordBreak: 'break-all'
          }}
        >
          {generatedPassword || 'Click Generate to create a password'}
        </Typography>
        <Tooltip title="Copy to clipboard">
          <IconButton onClick={handleCopy} disabled={!generatedPassword}>
            <ContentCopy />
          </IconButton>
        </Tooltip>
      </Box>

      <Button
        variant="contained"
        startIcon={<Refresh />}
        onClick={generatePassword}
        fullWidth
      >
        Generate Password
      </Button>
    </Box>
  );
};

export default PasswordGenerator; 