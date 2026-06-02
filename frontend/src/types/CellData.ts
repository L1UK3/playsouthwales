/**
 * Data structure representing a single day cell in the calendar grid.
 * @interface CellData
 * @property {number} day - The day of the month (1-31).
 * @property {number} month - The month of the year (0-11).
 * @property {number} year - The full year (e.g., 2023).
 * @property {boolean} isOtherMonth - Indicates if the day belongs to the previous or next month in the current view.
 * @property {string} dateKey - A unique string identifier for the date (typically ISO format YYYY-MM-DD).
 */
export interface CellData {
    day: number;
    month: number;
    year: number;
    isOtherMonth: boolean;
    dateKey: string;
}