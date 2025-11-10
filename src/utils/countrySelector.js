import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const CountrySelector = ({
  selectedCountry,
  onCountryChange,
  label = '',
  size = 'small',
  fullWidth = false,
  sx = {},
}) => {
  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'AU', name: 'Australia' },
    { code: 'UK', name: 'United Kingdom' },
  ];
  const effectiveCountry = selectedCountry || 'US';
  return (
    <FormControl
      size={size}
      fullWidth={fullWidth}
      sx={{
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
        native={false}
        MenuProps={{
          disableScrollLock: true,
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
          PaperProps: {
            sx: {
              maxWidth: 'calc(100vw - 32px)',
              left: '16px !important',
              right: '16px !important',
              width: 'auto !important',
              '& .MuiMenuItem-root': {
                whiteSpace: 'normal',
                wordBreak: 'break-word',
              },
            },
          },
        }}
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