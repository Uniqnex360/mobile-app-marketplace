import React from "react";
import {
  Box,
  Grid,
  Button,
  Tooltip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Autocomplete,
  Chip,
  IconButton,
} from "@mui/material";
import {
  Refresh,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import CountrySelector from "../../../utils/countrySelector";
import BrandSelector from "../../../utils/BrandSelector";

function DashboardFilters({
  onClose,
  selectedCountry,
  setSelectedCountry,
  selectedBrand,
  setSelectedBrand,
  brandList,
  inputValueBrand,
  setInputValueBrand,
  brandLimit,
  setBrandLimit,
  hasMore,
  isLoading,
  toggleSelection,
  selectedSku,
  setSelectedSku,
  skuList,
  inputValueSku,
  setInputValueSku,
  toggleSelectionSKU,
  selectedAsin,
  setSelectedAsin,
  asinList,
  inputValueAsin,
  setInputValueAsin,
  toggleSelectionAsin,
  presets,
  selectedPreset,
  handlePresetSelectHelium,
  befePreset,
  setBefePreset,
  setAppliedPreset,
  startDate,
  endDate,
  handleStartDateChangeOptimized,
  handleEndDateChangeOptimized,
  handleClearFilter,
  activeFilters,
  handleRemoveFilter,
}) {
  const datePickerSx = {
    width: "100%",
    "& .MuiInputBase-root": { height: 40 },
    "& .MuiInputLabel-root": { fontSize: "16px" },
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        backgroundColor: "#fff",
        zIndex: 2000,
      }}
    >
      {/* --- Header (secondary bar just below global navbar) --- */}
      <Box
        sx={{
          backgroundColor: "#000080",
          display: "flex",
          alignItems: "center",
          py: 1,
          px: 2,
          color: "#fff",
        }}
      >
        <IconButton edge="start" color="inherit" onClick={onClose} sx={{ mr: 1 }}>
          <ArrowBackIcon sx={{ color: "#fff" }} />
        </IconButton>
        <Typography sx={{ fontWeight: 600, fontSize: 18 }}>Filters</Typography>
      </Box>

      {/* --- Scrollable filter form --- */}
      <Box
        sx={{
          px: 2,
          py: 2,
          overflowY: "auto",
          height: "calc(100vh - 120px)", // minus top + action bar
          pb: 10,
        }}
      >
        <Grid container spacing={2}>
          {/* Country */}
          <Grid item xs={12}>
            <CountrySelector
              selectedCountry={selectedCountry}
              onCountryChange={(country) => setSelectedCountry(country)}
            />
          </Grid>

          {/* Brand */}
          <Grid item xs={12}>
            <BrandSelector
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
              brandList={brandList}
              inputValueBrand={inputValueBrand}
              setInputValueBrand={setInputValueBrand}
              brandLimit={brandLimit}
              setBrandLimit={setBrandLimit}
              isLoading={isLoading}
              hasMore={hasMore}
              toggleSelection={toggleSelection}
              label="Brands"
            />
          </Grid>

          {/* SKU */}
          <Grid item xs={12}>
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={[
                ...selectedSku,
                ...skuList.filter(
                  (s) => !selectedSku.some((ss) => ss.id === s.id)
                ),
              ]}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.sku
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              inputValue={inputValueSku}
              onInputChange={(e, newInputValue) => {
                setInputValueSku(newInputValue);
              }}
              value={selectedSku}
              onChange={(event, newValue) => setSelectedSku(newValue)}
              renderTags={() => null}
              renderInput={(params) => (
                <TextField {...params} label="SKU" size="small" />
              )}
              sx={{
                "& .MuiInputBase-root": { height: 40, fontSize: 14 },
              }}
            />
          </Grid>

          {/* ASIN / Product ID */}
          <Grid item xs={12}>
            <Autocomplete
              multiple
              disableCloseOnSelect
              freeSolo
              options={[
                ...selectedAsin,
                ...asinList.filter(
                  (a) => !selectedAsin.some((sa) => sa.id === a.id)
                ),
              ]}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.Asin
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              inputValue={inputValueAsin}
              onInputChange={(e, newInputValue) =>
                setInputValueAsin(newInputValue)
              }
              value={selectedAsin}
              onChange={(event, newValue) => setSelectedAsin(newValue)}
              renderTags={() => null}
              renderInput={(params) => (
                <TextField {...params} label="Product ID" size="small" />
              )}
              sx={{
                "& .MuiInputBase-root": { height: 40, fontSize: 14 },
              }}
            />
          </Grid>

          {/* Preset */}
          <Grid item xs={12}>
            <FormControl size="small" sx={{ width: "100%" }}>
              <InputLabel>Preset</InputLabel>
              <Select
                value={selectedPreset}
                label="Preset"
                onChange={(e) => {
                  handlePresetSelectHelium(e.target.value);
                  setBefePreset(e.target.value);
                  setAppliedPreset(e.target.value);
                }}
              >
                {presets.map((preset) => (
                  <MenuItem key={preset} value={preset}>
                    {preset}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Dates */}
          <Grid item xs={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={handleStartDateChangeOptimized}
                format="DD/MM/YYYY"
                disableFuture
                maxDate={endDate || dayjs()}
                slotProps={{
                  textField: { size: "small", sx: datePickerSx },
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={handleEndDateChangeOptimized}
                format="DD/MM/YYYY"
                disableFuture
                minDate={startDate}
                disabled={!startDate}
                slotProps={{
                  textField: { size: "small", sx: datePickerSx },
                }}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>

        {/* Active filters */}
        {activeFilters && activeFilters.length > 0 && (
          <Box
            sx={{
              mt: 3,
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              borderTop: "1px solid #e0e0e0",
              pt: 2,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Active Filters:
            </Typography>
            {activeFilters.map((f, i) => (
              <Chip
                key={`${f.type}-${f.value}-${i}`}
                label={`${f.type}: ${f.label}`}
                onDelete={() => handleRemoveFilter(f)}
                size="small"
              />
            ))}
          </Box>
        )}
      </Box>

      {/* --- Fixed Bottom Apply / Reset Bar --- */}
      {/* --- Fixed Bottom Apply / Reset Bar --- */}
<Box
  sx={{
    position: "fixed",
    bottom: 100, // move it above your persistent bottom navigation
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTop: "1px solid #ddd",
    p: 1.5,
    display: "flex",
    justifyContent: "space-between",
    zIndex: 3000,
    pb: "env(safe-area-inset-bottom)", // iOS home-bar safety
  }}
>
  <Button
    variant="outlined"
    onClick={handleClearFilter}
    sx={{
      borderColor: "#000080",
      color: "#000080",
      textTransform: "none",
      fontWeight: 600,
      flex: 1,
      mr: 1,
      height: 44,
    }}
  >
    Reset
  </Button>

  <Button
    variant="contained"
    onClick={onClose}
    sx={{
      backgroundColor: "#000080",
      "&:hover": { backgroundColor: "darkblue" },
      textTransform: "none",
      fontWeight: 600,
      flex: 1,
      height: 44,
    }}
  >
    Apply
  </Button>
</Box>
    </Box>
  );
}

export default DashboardFilters;