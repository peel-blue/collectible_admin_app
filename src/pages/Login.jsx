import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/userAuth';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const userData = { username: email, password };
            const response = await adminLogin(userData);
            console.log(response);

            // Store token in localStorage if it exists in the response
            if (response.token) {
                localStorage.setItem('token', response.token);
                console.log('Login successful, token stored');
                // Redirect to Home page after successful login
                navigate('/home');
            } else {
                console.log('Login response:', response);
            }
        } catch (error) {
            console.error('Login failed:', error);
            // You might want to show error message to user here
        }
    };

    const containerStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#f5f5f5',
        margin: 0,
        padding: '20px',
        boxSizing: 'border-box',
        position: 'absolute',
        top: 0,
        left: 0
    };

    const formStyle = {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
    };

    const titleStyle = {
        marginBottom: '30px',
        fontSize: '28px',
        fontWeight: '600',
        color: '#333'
    };

    const formGroupStyle = {
        marginBottom: '20px',
        textAlign: 'left'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#555'
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        border: '2px solid #e1e5e9',
        borderRadius: '8px',
        fontSize: '16px',
        transition: 'border-color 0.3s ease',
        boxSizing: 'border-box'
    };

    const buttonStyle = {
        width: '100%',
        padding: '12px',
        backgroundColor: '#646cff',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '10px',
        transition: 'background-color 0.3s ease'
    };

    return (
        <div style={containerStyle}>
            <form onSubmit={handleSubmit} style={formStyle}>
                <h2 style={titleStyle}>Login</h2>

                <div style={formGroupStyle}>
                    <label htmlFor="email" style={labelStyle}>Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = '#646cff'}
                        onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
                    />
                </div>

                <div style={formGroupStyle}>
                    <label htmlFor="password" style={labelStyle}>Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = '#646cff'}
                        onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
                    />
                </div>

                <button
                    type="submit"
                    style={buttonStyle}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#535bf2'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#646cff'}
                >
                    Login
                </button>
            </form>
        </div>
    );
};

export default LoginPage;