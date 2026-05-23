import React from 'react';
import type { LoginProps } from './LoginProps';
import styles from './Login.module.css';

/**
 * A reusable login field wrapper component that provides a label, input container, and error message display.
 * @param props - The props for the component, including the input elements, field label, and validation error message.
 * @returns JSX.Element
 */
const Login: React.FC<LoginProps> = ({ children, label, error }) => {
    return (
        <div className={styles.login}>
            {label && (
                <label className={styles.label}>
                    {label}
                </label>
            )}
            <div className={styles.relative}>
                {children}
            </div>
            {error && (
                <span className={styles.error}>
                    {error}
                </span>
            )}
        </div>
    );
};

export default Login;