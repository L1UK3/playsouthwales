/**
 * Returns a date string in YYYY-MM-DD format based on the local time of the provided Date object.
 * @param {Date} date - The Date object to format.
 * @returns {String} The formatted date string (YYYY-MM-DD).
 */
export function getLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
