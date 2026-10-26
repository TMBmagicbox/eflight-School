/* ===== CONFIGURACIÓN DE PAGOS =====
   Pega aquí tus datos y el simulador pasará a cobrar de verdad.
   - paypalClientId : "Client ID" de tu app en developer.paypal.com (usa el Live para cobros reales).
   - stripePaymentLink : enlace de pago de Stripe (dashboard.stripe.com → Payment Links), ej. "https://buy.stripe.com/xxxx".
   Si ambos están vacíos, el sitio funciona en MODO DEMO (no se cobra nada). */
window.EFS_CONFIG={
 currency:"USD",
 paypalClientId:"",
 stripePaymentLink:""
};
