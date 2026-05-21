export const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getCalendarDays = (currentDate: Date) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const startDay = firstDay === 0 ? 6 : firstDay - 1;

  const days = [];

  // Prev month padding
  for (let i = startDay - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const date = new Date(year, month - 1, dayNum);
    days.push({ dayNum, date, isOtherMonth: true });
  }

  // Current month
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const date = new Date(year, month, dayNum);
    days.push({ dayNum, date, isOtherMonth: false });
  }

  // Next month padding
  const totalCells = days.length;
  const remainingCells = (Math.ceil(totalCells / 7) * 7) - totalCells;
  for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
    const date = new Date(year, month + 1, dayNum);
    days.push({ dayNum, date, isOtherMonth: true });
  }

  return days;
};
