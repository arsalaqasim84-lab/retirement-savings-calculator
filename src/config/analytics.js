// Google Analytics 4 Configuration
// Set to true to enable tracking, false to disable
export const GA4_ENABLED = false;

// Replace with your actual GA4 Measurement ID
export const GA4_MEASUREMENT_ID = 'G-XXXXXXXXXX';

// GA4 Implementation
export const initializeGA4 = () => {
  if (!GA4_ENABLED) {
    // No-op function when GA4 is disabled
    window.trackCalculatorEvent = () => {};
    return;
  }

  // Load GA4 script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', GA4_MEASUREMENT_ID);

  // Track calculator usage
  window.trackCalculatorEvent = function(eventName, parameters = {}) {
    gtag('event', eventName, parameters);
  };
};

// Event tracking functions
export const trackEvent = (eventName, parameters = {}) => {
  if (window.trackCalculatorEvent) {
    window.trackCalculatorEvent(eventName, parameters);
  }
};

// Predefined events
export const trackCalculatorUsed = (currentAge, retirementAge, yearsToRetirement) => {
  trackEvent('calculator_used', {
    current_age: currentAge,
    retirement_age: retirementAge,
    years_to_retirement: yearsToRetirement
  });
};

export const trackCalculatorReset = () => {
  trackEvent('calculator_reset');
};

export const trackResultsShared = (projectedSavings, retirementAge) => {
  trackEvent('results_shared', {
    projected_savings: projectedSavings,
    retirement_age: retirementAge
  });
};

