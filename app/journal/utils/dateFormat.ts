export const formatTime = (): string => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatDate = (
  dateString?: string
): {
  year: number;
  fullDate: string;
} => {
  try {
    let dateObj;

    if (dateString) {
      if (dateString.includes('-') && dateString.split('-').length === 3) {
        const [year, month, date] = dateString.split('-').map((num) => parseInt(num, 10));
        dateObj = new Date(year, month - 1, date);
      } else {
        dateObj = new Date(dateString);
      }
    } else {
      dateObj = new Date();
    }

    return {
      year: dateObj.getFullYear(),
      fullDate: dateObj.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    };
  } catch (error) {
    console.error('Error parsing date:', error);
    const now = new Date();

    return {
      year: now.getFullYear(),
      fullDate: now.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    };
  }
};
