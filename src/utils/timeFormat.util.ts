export const TimeFormat: Intl.DateTimeFormatOptions = {
    month: 'short',    // 'Aug'
    day: '2-digit',    // '26'
    year: 'numeric',   // '2024'
    hour: '2-digit',   // '01'
    minute: '2-digit', // '11'
    hour12: true       // 'PM'
  };
  
  export const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("us-US", TimeFormat)
  }