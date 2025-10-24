import { useState, useEffect } from 'react';
import Header from '../components/Header';
import DateSelector from '../components/DateSelector';
import TimeSlots from '../components/TimeSlots';
import BookingForm from '../components/BookingForm';
import BookingConfirmation from '../components/BookingConfirmation';
import { logUserInfo } from '../utils/userInfo';

export default function MeetingScheduler() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [booking, setBooking] = useState(null);
  


  // Capturar información del usuario al cargar la página
  useEffect(() => {
    logUserInfo(); // Captura automática al entrar
  }, []);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleBookingComplete = (bookingData) => {
    setBooking(bookingData);
  };

  const handleNewBooking = () => {
    setSelectedDate(new Date());
    setSelectedTime(null);
    setBooking(null);
  };

  if (booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BookingConfirmation 
            booking={booking} 
            onNewBooking={handleNewBooking}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Programa tu Reunión Virtual
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Selecciona la fecha y hora que mejor te convenga. Generaremos automáticamente 
            un enlace de Google Meet para tu reunión.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Selector de Fecha */}
          <div className="lg:col-span-1">
            <DateSelector 
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
            />
          </div>

          {/* Horarios Disponibles */}
          <div className="lg:col-span-2">
            <TimeSlots
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onTimeSelect={handleTimeSelect}
            />
          </div>

          {/* Formulario de Reserva */}
          <div className="lg:col-span-3">
            <BookingForm
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onBookingComplete={handleBookingComplete}
            />
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="bg-primary/10 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <span className="text-primary font-bold">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Selecciona Fecha y Hora</h3>
            <p className="text-sm text-gray-600">Elige el día y horario que mejor se adapte a tu agenda</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="bg-secondary/10 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <span className="text-secondary font-bold">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Completa tus Datos</h3>
            <p className="text-sm text-gray-600">Proporciona la información necesaria para la reunión</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="bg-success/10 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <span className="text-success font-bold">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">¡Listo para Reunirte!</h3>
            <p className="text-sm text-gray-600">Recibe el enlace de Google Meet y agrega el evento a tu calendario</p>
          </div>
        </div>
      </main>
      

    </div>
  );
}