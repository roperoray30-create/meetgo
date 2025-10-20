import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getNextDays } from '../utils/dateUtils';

export default function DateSelector({ selectedDate, onDateSelect }) {
  const days = getNextDays(7);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Seleccionar Fecha</h3>
        <div className="flex items-center space-x-2">
          <button className="p-1 hover:bg-gray-100 rounded-md transition-colors">
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded-md transition-colors">
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => onDateSelect(day.date)}
            className={`p-3 rounded-lg text-center transition-all duration-200 ${
              selectedDate?.toDateString() === day.date.toDateString()
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
            } ${day.isToday ? 'ring-2 ring-secondary ring-opacity-50' : ''}`}
          >
            <div className="text-xs font-medium mb-1">
              {day.date.toLocaleDateString('es-ES', { weekday: 'short' })}
            </div>
            <div className="text-sm font-semibold">
              {day.date.getDate()}
            </div>
            {day.isToday && (
              <div className="text-xs text-secondary font-medium mt-1">Hoy</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}