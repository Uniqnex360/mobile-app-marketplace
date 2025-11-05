import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

/**
 * Reusable Country Selector Component
 * Defaults to US if no country is selected
 * 
 * @param {Object} props
 * @param {string} props.selectedCountry - Currently selected country code
 * @param {function} props.onCountryChange - Callback function when country changes
 * @param {string} props.label - Label for the select (optional, default: empty)
 * @param {string} props.size - Size of the select (optional, default: "small")
 * @param {number} props.minWidth - Minimum width of the FormControl (optional, default: 180)
 * @param {Object} props.sx - Additional sx styles (optional)
 */
const CountrySelector = ({
  selectedCountry,
  onCountryChange,
  label = '',
  size = 'small',
  minWidth = 180,
  sx = {},
}) => {
  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'AU', name: 'Australia' },
    { code: 'UK', name: 'United Kingdom' },
  ];

  // Set default to US if no country is selected
  const effectiveCountry = selectedCountry || 'US';

  return (
    <FormControl
      size={size}
      sx={{
        minWidth,
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'white',
          '& fieldset': { borderColor: '#cacaca' },
        },
        ...sx,
      }}
    >
      {label && <InputLabel>{label}</InputLabel>}
      <Select
        value={effectiveCountry}
        onChange={(e) => onCountryChange(e.target.value)}
        inputProps={{ 'aria-label': 'country select' }}
      >
        {countries.map((country) => (
          <MenuItem key={country.code} value={country.code}>
            {country.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CountrySelector;