export const formatDate = (date: string): string => {
  const currentDate = new Date(date);
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const year = String(currentDate.getFullYear());

  return `${month}/${day}/${year}`;
};
