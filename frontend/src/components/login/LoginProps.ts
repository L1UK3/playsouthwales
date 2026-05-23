import type React from "react";

/**
 * Properties for the Login component.
 * @property {React.ReactNode} children - The content to be rendered inside the login component.
 * @property {string} [label] - An optional label for the login field.
 * @property {string} [error] - An optional error message to display.
 */
export interface LoginProps {
    children: React.ReactNode;
    label?: string;
    error?: string;
}
