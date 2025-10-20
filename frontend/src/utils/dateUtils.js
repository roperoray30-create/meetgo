// Utilidades para manejo de fechas y horarios
export const getCurrentDate = () => {
  return new Date();
};

export const formatDate = (date) => {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTime = (date) => {
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const generateTimeSlots = (selectedDate = new Date(), startHour = 9, endHour = 18, interval = 30) => {
  const slots = [];
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  

  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const slotTime = new Date(selectedDate);
      slotTime.setHours(hour, minute, 0, 0);
      
      // Generar todos los horarios (temporalmente sin filtro)
      slots.push({
        time: formatTime(slotTime),
        hour,
        minute,
        available: true, // Todos disponibles para testing
        id: `${hour}-${minute}`
      });
    }
  }
  

  return slots;
};

export const getNextDays = (count = 7) => {
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    days.push({
      date,
      formatted: formatDate(date),
      short: date.toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      }),
      isToday: i === 0
    });
  }
  
  return days;
};