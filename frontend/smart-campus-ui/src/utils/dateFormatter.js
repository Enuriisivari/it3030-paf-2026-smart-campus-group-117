// utils/dateFormatter.js
// Utility function to format a JavaScript Date object as 'YYYY-MM-DD'

export function formatDate(date) {
  if (!(date instanceof Date)) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
