import { Clock, Users } from 'lucide-react';
import { generateTimeSlots } from '../utils/dateUtils';

export default function TimeSlots({ selectedDate, selectedTime, onTimeSelect }) {
  const timeSlots = generateTimeSlots(selectedDate);
  


  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Horarios Disponibles</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>Zona horaria: GMT-6</span>
        </div>
      </div>
      
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-2 text-blue-800">
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium">
            Fecha seleccionada: {selectedDate?.toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {timeSlots.map((slot) => (
          <button
            key={slot.id}
            onClick={() => slot.available && onTimeSelect(slot)}
            disabled={!slot.available}
            className={`time-slot ${
              selectedTime?.id === slot.id ? 'selected' : ''
            } ${!slot.available ? 'booked' : ''}`}
          >
            <div className="text-sm font-medium">{slot.time}</div>
            {!slot.available && (
              <div className="text-xs mt-1">Ocupado</div>
            )}
          </button>
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-white border border-gray-200 rounded"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded"></div>
            <span>Seleccionado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-100 rounded"></div>
            <span>Ocupado</span>
          </div>
        </div>
        <span>{timeSlots.filter(slot => slot.available).length} horarios disponibles</span>
      </div>
    </div>
  );
}