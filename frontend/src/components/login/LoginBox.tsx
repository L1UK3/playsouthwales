import React from 'react';
import styles from './LoginBox.module.css';
import type { loginBoxProps } from './LoginBoxProps';
import { loginAdmin } from '@services/authService';

const LoginBox: React.FC<loginBoxProps> = () => {
    return (
        <div className={styles.loginBox}>
            <h2>Login</h2>
            <form className={styles.loginForm}>
                <label htmlFor="username">Username:</label>
                <input type="text" id="username" name="username" required />
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" required />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}
s