import {
    EmailOutlined,
    LockOutlined,
    Visibility,
    VisibilityOff,
} from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Container,
    Grid,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Create axios instance with base URL
const api = axios.create({
    baseURL: process.env.NODE_ENV === 'production'
        ? 'https://data-insights-backend-ten.vercel.app/api'
        : 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
    withCredentials: true // Enable credentials
});

// Add request interceptor for logging
api.interceptors.request.use(
    (config) => {
        console.log('Making request to:', config.url);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            config: {
                url: error.config?.url,
                baseURL: error.config?.baseURL,
                method: error.config?.method
            }
        });
        
        if (error.response) {
            return Promise.reject(error.response.data);
        } else if (error.request) {
            return Promise.reject({ 
                message: 'No response from server. Please check if the server is running.' 
            });
        } else {
            return Promise.reject({ 
                message: error.message || 'Error setting up request' 
            });
        }
    }
);

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { email, password } = formData;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('Attempting to login with:', { email, password: '***' });
            const response = await api.post('/auth/login', {
                email,
                password,
            });

            console.log('Login response:', response.data);

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                navigate('/dashboard');
            } else {
                setError('Invalid response from server');
            }
        } catch (error) {
            console.error('Login error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers,
                }
            });

            if (error.response) {
                // Server responded with error status
                setError(error.response.data.message || 'Login failed');
            } else if (error.request) {
                // Request was made but no response received
                console.error('No response received. Server might be down or unreachable.');
                setError('Unable to connect to server. Please try again later.');
            } else {
                // Error in request setup
                console.error('Request setup error:', error.message);
                setError('Error setting up login request: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                py: 8,
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={24}
                    sx={{
                        p: 4,
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            mb: 4,
                        }}
                    >
                        <Avatar
                            sx={{
                                m: 1,
                                bgcolor: 'primary.main',
                                width: 56,
                                height: 56,
                            }}
                        >
                            <LockOutlined fontSize="large" />
                        </Avatar>
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{
                                fontWeight: 'bold',
                                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Welcome Back
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Sign in to your account to continue
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={handleChange}
                            disabled={loading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailOutlined color="primary" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={handleChange}
                            disabled={loading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockOutlined color="primary" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 3 }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                mt: 2,
                                mb: 3,
                                py: 1.5,
                                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #764ba2, #667eea)',
                                },
                            }}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                        <Grid container justifyContent="center">
                            <Grid item>
                                <Link
                                    to="/register"
                                    style={{
                                        color: '#1976d2',
                                        textDecoration: 'none',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        '&:hover': {
                                            textDecoration: 'underline',
                                        },
                                    }}
                                >
                                    Don't have an account? Sign Up
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Login; 