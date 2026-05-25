/**
 * Data structure representing a single day cell in the calendar grid.
 * @property day - The day of the month (1-31).
 * @property month - The month number (1-12).
 * @property year - The four-digit year.
 * @property isOtherMonth - Boolean indicating if the cell belongs to a month other than the one currently being viewed.
 * @property dateKey - A unique string identifier for the date in YYYY-MM-DD format.
 */
export interface CellData {
    day: number;
    month: number;
    year: number;
    isOtherMonth: boolean;
    dateKey: string;
}