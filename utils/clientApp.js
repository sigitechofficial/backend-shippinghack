// The customer mobile app talks to the API through GetX's GetConnect, which
// sends "user-agent: getx-client" on every request (plain dart:io sends
// "Dart/x.y"). Browsers never send either, so this tells app calls apart
// from website calls without any change in the app.
function isMobileAppRequest(req) {
  const ua = String(req.get('user-agent') || '').toLowerCase();
  return ua.includes('getx-client') || ua.startsWith('dart/');
}

// Business accounts are website-only for now. The app shows the response's
// message and error as they are (no translation), so both languages are sent,
// the user's own language first.
const BUSINESS_APP_BLOCK = {
  en: "Business accounts can't use the mobile app yet. Please sign in on our website.",
  es: "Las cuentas de empresa aún no pueden usar la aplicación móvil. Inicia sesión en nuestro sitio web.",
};

function businessAppBlockedResponse(language) {
  const first = language === 'es' ? 'es' : 'en';
  const second = first === 'es' ? 'en' : 'es';
  return {
    status: '0',
    message: BUSINESS_APP_BLOCK[first],
    data: {},
    error: BUSINESS_APP_BLOCK[second],
  };
}

// The app's session check (splash screen) only sends the user to the login screen
// when the reply's message is "Access Denied", so a business account's saved
// session gets exactly that; the login screen then shows the message above.
function businessAppSessionResponse(language) {
  const blocked = businessAppBlockedResponse(language);
  return {
    status: '0',
    message: 'Access Denied',
    data: {},
    error: `${blocked.message} ${blocked.error}`,
  };
}

module.exports = { isMobileAppRequest, businessAppBlockedResponse, businessAppSessionResponse };
