import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, TextField, Button, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  List, ListItem, ListItemText, ListItemSecondaryAction,
  ThemeProvider, createTheme, CssBaseline, Paper, Avatar, Zoom, Grow
} from '@mui/material';
import { Delete as DeleteIcon, Visibility as VisibilityIcon, 
  VisibilityOff as VisibilityOffIcon, Lock as LockIcon, 
  Add as AddIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_URL = 'http://localhost:5001';

// Create a dark theme with custom colors
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#0a1929',
      paper: '#132f4c',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 5px 15px rgba(33, 150, 243, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 48px rgba(0,0,0,0.3)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        },
      },
    },
  },
});

// Animation variants for Framer Motion
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2 }
  }
};

const MotionContainer = motion(Container);
const MotionPaper = motion(Paper);
const MotionListItem = motion(ListItem);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwords, setPasswords] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newPassword, setNewPassword] = useState({ site: '', username: '', password: '' });
  const [showPassword, setShowPassword] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchPasswords();
    }
  }, []);

  const fetchPasswords = async () => {
    try {
      const response = await axios.get(`${API_URL}/passwords`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPasswords(response.data);
    } catch (error) {
      console.error('Error fetching passwords:', error);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isRegistering ? 'register' : 'login';
      const response = await axios.post(`${API_URL}/${endpoint}`, {
        username,
        password
      });

      if (!isRegistering) {
        localStorage.setItem('token', response.data.token);
        setIsLoggedIn(true);
        fetchPasswords();
      } else {
        setIsRegistering(false);
      }

      setUsername('');
      setPassword('');
    } catch (error) {
      console.error('Authentication error:', error);
      alert(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setPasswords([]);
  };

  const handleAddPassword = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/passwords`, newPassword, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Clear form and close dialog
      setShowAddDialog(false);
      setNewPassword({ site: '', username: '', password: '' });
      
      // Immediately fetch updated passwords
      const response = await axios.get(`${API_URL}/passwords`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPasswords(response.data);
    } catch (error) {
      console.error('Error adding password:', error);
      alert(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePassword = async (id) => {
    try {
      await axios.delete(`${API_URL}/passwords/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Immediately fetch updated passwords
      const response = await axios.get(`${API_URL}/passwords`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPasswords(response.data);
    } catch (error) {
      console.error('Error deleting password:', error);
      alert(error.response?.data?.message || 'An error occurred');
    }
  };

  const togglePasswordVisibility = (id) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isLoggedIn) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(45deg, #0a1929 0%, #132f4c 100%)',
            backgroundSize: '400% 400%',
            animation: 'gradient 15s ease infinite',
            p: 3,
          }}
        >
          <Container maxWidth="sm">
            <motion.div
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
                    <LockIcon fontSize="large" />
                  </Avatar>
                </motion.div>
                <Typography 
                  component={motion.h1}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  variant="h4" 
                  sx={{ mb: 2, color: 'white', fontWeight: 600 }}
                >
                  Password Manager
                </Typography>
              </Box>
            </motion.div>

            <Card
              component={motion.div}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <CardContent sx={{ p: 4 }}>
                <form onSubmit={handleAuth}>
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <TextField
                      fullWidth
                      label="Username"
                      variant="outlined"
                      margin="normal"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <TextField
                      fullWidth
                      label="Password"
                      type="password"
                      variant="outlined"
                      margin="normal"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      sx={{ mb: 3 }}
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      fullWidth
                      variant="contained"
                      type="submit"
                      size="large"
                      sx={{ mb: 2 }}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : (isRegistering ? 'Register' : 'Login')}
                    </Button>
                  </motion.div>
                </form>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    fullWidth
                    onClick={() => setIsRegistering(!isRegistering)}
                    sx={{ mt: 1 }}
                    color="secondary"
                  >
                    {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(45deg, #0a1929 0%, #132f4c 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradient 15s ease infinite',
          p: 3,
        }}
      >
        <MotionContainer
          maxWidth="md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 4,
            pt: 2 
          }}>
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                Your Passwords
              </Typography>
            </motion.div>
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Box>
                <Button
                  variant="contained"
                  onClick={() => setShowAddDialog(true)}
                  sx={{ mr: 2 }}
                  startIcon={<AddIcon />}
                  component={motion.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Add Password
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleLogout}
                  color="secondary"
                  component={motion.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Logout
                </Button>
              </Box>
            </motion.div>
          </Box>

          <MotionPaper
            variants={containerVariants}
            sx={{ borderRadius: 2, bgcolor: 'background.paper', overflow: 'hidden' }}
          >
            <List>
              <AnimatePresence>
                {passwords.map((item) => (
                  <MotionListItem
                    key={item.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    divider
                    sx={{
                      '&:last-child': {
                        borderBottom: 'none',
                      },
                      borderColor: 'rgba(255,255,255,0.12)',
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="h6" sx={{ color: 'primary.main' }}>
                          {item.site}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <motion.div
                            initial={false}
                            animate={{ 
                              height: showPassword[item.id] ? 'auto' : 40,
                              opacity: 1 
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                              Username: {item.username}
                            </Typography>
                            <motion.div
                              initial={false}
                              animate={{
                                opacity: showPassword[item.id] ? 1 : 0.7,
                                scale: showPassword[item.id] ? 1 : 0.98,
                              }}
                              transition={{ duration: 0.2 }}
                            >
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: showPassword[item.id] ? 'primary.main' : 'text.secondary',
                                  bgcolor: showPassword[item.id] ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
                                  p: showPassword[item.id] ? 1 : 0,
                                  borderRadius: 1,
                                  transition: 'all 0.3s ease',
                                  fontFamily: showPassword[item.id] ? 'monospace' : 'inherit'
                                }}
                              >
                                Password: {showPassword[item.id] ? (
                                  <motion.span
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    {item.password}
                                  </motion.span>
                                ) : '••••••••'}
                              </Typography>
                            </motion.div>
                            {showPassword[item.id] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    display: 'block',
                                    mt: 1,
                                    color: 'text.secondary',
                                    fontSize: '0.7rem'
                                  }}
                                >
                                  Created: {new Date(item.created_at).toLocaleString()}
                                </Typography>
                              </motion.div>
                            )}
                          </motion.div>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        onClick={() => togglePasswordVisibility(item.id)}
                        sx={{ 
                          color: showPassword[item.id] ? 'primary.main' : 'text.secondary',
                          bgcolor: showPassword[item.id] ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
                          '&:hover': {
                            bgcolor: showPassword[item.id] ? 'rgba(33, 150, 243, 0.2)' : 'rgba(255, 255, 255, 0.1)'
                          }
                        }}
                        component={motion.button}
                        whileHover={{ scale: 1.2, rotate: 180 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {showPassword[item.id] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        onClick={() => handleDeletePassword(item.id)}
                        sx={{ color: 'secondary.main' }}
                        component={motion.button}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </MotionListItem>
                ))}
              </AnimatePresence>
              {passwords.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                          No passwords stored yet. Click "Add Password" to get started.
                        </Typography>
                      }
                    />
                  </ListItem>
                </motion.div>
              )}
            </List>
          </MotionPaper>

          <Dialog 
            open={showAddDialog} 
            onClose={() => setShowAddDialog(false)}
            TransitionComponent={Grow}
            PaperProps={{
              sx: {
                borderRadius: 2,
                bgcolor: 'background.paper',
              }
            }}
          >
            <DialogTitle sx={{ pb: 1 }}>Add New Password</DialogTitle>
            <DialogContent sx={{ pb: 2 }}>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <TextField
                  fullWidth
                  label="Site"
                  variant="outlined"
                  margin="normal"
                  value={newPassword.site}
                  onChange={(e) => setNewPassword({ ...newPassword, site: e.target.value })}
                />
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <TextField
                  fullWidth
                  label="Username"
                  variant="outlined"
                  margin="normal"
                  value={newPassword.username}
                  onChange={(e) => setNewPassword({ ...newPassword, username: e.target.value })}
                />
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  value={newPassword.password}
                  onChange={(e) => setNewPassword({ ...newPassword, password: e.target.value })}
                />
              </motion.div>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={() => setShowAddDialog(false)} color="inherit">
                  Cancel
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={handleAddPassword} 
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Password'}
                </Button>
              </motion.div>
            </DialogActions>
          </Dialog>
        </MotionContainer>
      </Box>
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </ThemeProvider>
  );
}

export default App;
