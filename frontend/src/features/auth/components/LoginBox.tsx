import React from 'react';
import styles from './LoginBox.module.css';
import { loginAdmin } from '../api/authServices';

export interface loginBoxProps {
    isAdmin?: boolean;
    onClose: () => void;
}

const LoginBox: React.FC<loginBoxProps> = ({ onClose }) => {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const username = (form.elements.namedItem('username') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;
        const greatSuccess = await loginAdmin(username, password);
        if (greatSuccess) {
            console.log("great success");
        }
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.loginBox} onClick={e => e.stopPropagation()}>
                <h2>Admin Login</h2>
                <form className={styles.loginForm} onSubmit={handleSubmit}>
                    <label htmlFor="username">Username:</label>
                    <input type="text" id="username" name="username" required />
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" required />
                    <button type="submit">Login</button>
                </form>
                <button className={styles.closeButton} onClick={onClose}>✕</button>
            </div>
        </div>
    );
};

export default LoginBox;