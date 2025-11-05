export const getCurrencySymbol = (country = 'US') => {
  const currencyMap = {
    'US': '$',
    'UK': '£',
  };
  return currencyMap[country.toUpperCase()] || '$';
};