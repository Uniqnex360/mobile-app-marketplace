// import { useState } from "react";
// import { FilterList, Refresh } from "@mui/icons-material";
// import {
//   Box,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   TextField,
//   Autocomplete,
//   Menu,
//   ListItemIcon,
//   ListItemText,
//   IconButton,
//   Collapse,
//   CircularProgress,
//   Tooltip,
//   Button,
//   Drawer,
//   Typography,
//   Divider
// } from "@mui/material";
// import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import ExpandLessIcon from "@mui/icons-material/ExpandLess";
// import ImageIcon from "@mui/icons-material/Image";

// export const FilterDrawer = ({
//   selectedCountry,
//   setSelectedCountry,
//   selectedBrand,
//   setSelectedBrand,
//   brandList,
//   inputValueBrand,
//   setInputValueBrand,
//   brandLimit,
//   setBrandLimit,
//   toggleSelection,
//   selectedSku,
//   setSelectedSku,
//   skuList,
//   inputValueSku,
//   setInputValueSku,
//   skuLimit,
//   setSkuLimit,
//   toggleSelectionSKU,
//   updateMergedProducts,
//   selectedAsin,
//   setSelectedAsin,
//   asinList,
//   inputValueAsin,
//   setInputValueAsin,
//   toggleSelectionAsin,
//   selectedCategory,
//   handleCategorySelect,
//   handleFulfillmentSelect,
//   enhancedCategories,
//   expandedCategories,
//   toggleExpandCategory,
//   anchorEl,
//   setAnchorEl,
//   selectedPreset,
//   setSelectedPreset,
//   handlePresetSelectHelium,
//   setBefePreset,
//   setAppliedPreset,
//   presets,
//   getPresetDisplayLabel,
//   startDate,
//   endDate,
//   handleStartDateChangeOptimized,
//   handleEndDateChangeOptimized,
//   datePickerSx,
//   activeFilters,
//   setActiveFilters,
//   handleRemoveFilter,
//   handleClearFilter,
//   isLoading,
//   hasMore,
//   CountrySelector,
//   BrandSelector,
// }) => {
//   const [open, setOpen] = useState(false);

//   const handleMenuOpen = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleMenuClose = () => {
//     setAnchorEl(null);
//   };

//   const applyFilters = () => {
//     setOpen(false);
//   };

//   const resetFilters = () => {
//     handleClearFilter();
//   };

//   return (
//     <>
//       {/* Mobile Filter Button - Hidden on Desktop */}
//       <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
//         <Button
//           onClick={() => setOpen(true)}
//           className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl bg-[hsl(var(--filter-button-bg))] text-[hsl(var(--filter-button-fg))] hover:bg-[hsl(var(--filter-button-bg))]/90 transition-all duration-300 hover:scale-110"
//           sx={{
//             position: 'fixed',
//             bottom: 24,
//             right: 24,
//             zIndex: 50,
//             height: 56,
//             width: 56,
//             minWidth: 56,
//             borderRadius: '50%',
//             backgroundColor: '#1976d2',
//             color: 'white',
//             '&:hover': {
//               backgroundColor: '#1565c0',
//               transform: 'scale(1.1)',
//             },
//             transition: 'all 0.3s ease',
//             boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
//           }}
//         >
//           <FilterList className="h-6 w-6" />
//         </Button>

//         <Drawer
//           anchor="bottom"
//           open={open}
//           onClose={() => setOpen(false)}
//           sx={{
//             '& .MuiDrawer-paper': {
//               height: '90vh',
//               overflowY: 'auto',
//               borderTopLeftRadius: 24,
//               borderTopRightRadius: 24,
//             },
//           }}
//         >
//           <Box sx={{ p: 2 }}>
//             <Box sx={{ pb: 2, borderBottom: '1px solid #e0e0e0' }}>
//               <Typography variant="h6" className="text-xl font-semibold">
//                 Filter Options
//               </Typography>
//             </Box>
            
//             <Box sx={{ mt: 3, spaceY: 2, '& > *': { mb: 2 } }}>
//               {/* Country */}
//               <Box>
//                 <CountrySelector
//                   selectedCountry={selectedCountry}
//                   onCountryChange={(country) => {
//                     setSelectedCountry(country);
//                     setActiveFilters((prev) => {
//                       const filtered = prev.filter(f => f.type !== 'country');
//                       return [...filtered, { type: 'country', value: country, label: country }];
//                     });
//                   }}
//                 />
//               </Box>

//               {/* Brand */}
//               <Box>
//                 <BrandSelector
//                   selectedBrand={selectedBrand}
//                   setSelectedBrand={(brands) => {
//                     setSelectedBrand(brands);
//                     setActiveFilters((prev) => {
//                       const filtered = prev.filter(f => f.type !== 'brand');
//                       const brandFilters = brands.map(brand => ({
//                         type: "brand",
//                         value: brand.id,
//                         label: brand.name
//                       }));
//                       return [...filtered, ...brandFilters];
//                     });
//                   }}
//                   brandList={brandList}
//                   inputValueBrand={inputValueBrand}
//                   setInputValueBrand={setInputValueBrand}
//                   brandLimit={brandLimit}
//                   setBrandLimit={setBrandLimit}
//                   isLoading={isLoading}
//                   hasMore={hasMore}
//                   toggleSelection={toggleSelection}
//                   label="Brands"
//                 />
//               </Box>

//               {/* SKU */}
//               <Box>
//                 <Autocomplete
//                   multiple
//                   disableCloseOnSelect
//                   options={[
//                     ...selectedSku,
//                     ...skuList.filter(
//                       (s) => !selectedSku.some((ss) => ss.id === s.id)
//                     ),
//                   ]}
//                   getOptionLabel={(option) =>
//                     typeof option === "string" ? option : option.sku
//                   }
//                   isOptionEqualToValue={(option, value) => option.id === value.id}
//                   inputValue={inputValueSku}
//                   onInputChange={(e, newInputValue) => {
//                     setInputValueSku(newInputValue);
//                     setSkuLimit(11);
//                   }}
//                   value={selectedSku}
//                   onChange={(event, newValue) => {
//                     setSelectedSku(newValue);
//                     setActiveFilters((prev) => {
//                       const filtered = prev.filter(f => f.type !== 'sku');
//                       const skuFilters = newValue.map(sku => ({
//                         type: 'sku',
//                         value: sku.id,
//                         label: sku.sku
//                       }));
//                       return [...filtered, ...skuFilters];
//                     });
//                     updateMergedProducts(selectedAsin, newValue);
//                   }}
//                   renderTags={() => null}
//                   noOptionsText={inputValueSku ? "No options" : ""}
//                   renderOption={(props, option) => {
//                     const isSelected = selectedSku.some((s) => s.id === option.id);
//                     return (
//                       <Box
//                         component="li"
//                         {...props}
//                         onClick={() => toggleSelectionSKU(option)}
//                         sx={{
//                           backgroundColor: isSelected
//                             ? "#b6d5f3 !important"
//                             : "transparent",
//                           fontSize: 13,
//                           cursor: "pointer",
//                         }}
//                         key={option.id}
//                       >
//                         {option.sku}
//                       </Box>
//                     );
//                   }}
//                   renderInput={(params) => (
//                     <TextField
//                       {...params}
//                       label="SKU"
//                       size="small"
//                       placeholder="Search SKU..."
//                       fullWidth
//                       InputProps={{
//                         ...params.InputProps,
//                         endAdornment: <>{params.InputProps.endAdornment}</>,
//                       }}
//                     />
//                   )}
//                 />
//               </Box>

//               {/* Channel */}
//               <Box>
//                 <Button
//                   variant="outlined"
//                   onClick={handleMenuOpen}
//                   fullWidth
//                   sx={{ justifyContent: "space-between" }}
//                 >
//                   {selectedCategory
//                     ? selectedCategory.fulfillment
//                       ? `${selectedCategory.name} - ${selectedCategory.fulfillment}`
//                       : selectedCategory.name
//                     : "Select Channel"}
//                   <ArrowDropDownIcon />
//                 </Button>
//                 <Menu
//                   anchorEl={anchorEl}
//                   open={Boolean(anchorEl)}
//                   onClose={handleMenuClose}
//                   PaperProps={{
//                     sx: { maxHeight: 400, width: 250 },
//                   }}
//                 >
//                   {isLoading ? (
//                     <MenuItem disabled>
//                       <CircularProgress size={24} sx={{ margin: "0 auto" }} />
//                     </MenuItem>
//                   ) : (
//                     enhancedCategories.map((category) => (
//                       <div key={category.id}>
//                         <MenuItem
//                           onClick={() => handleCategorySelect(category)}
//                           sx={{
//                             pl: 2,
//                             display: "flex",
//                             justifyContent: "space-between",
//                           }}
//                         >
//                           <div style={{ display: "flex", alignItems: "center" }}>
//                             <ListItemIcon>
//                               {category.icon ||
//                                 (category.imageUrl ? (
//                                   <img
//                                     src={category.imageUrl}
//                                     alt={category.name}
//                                     style={{ width: 17, height: 14, marginRight: 5 }}
//                                   />
//                                 ) : (
//                                   <ImageIcon sx={{ width: 17, height: 14, mr: 0.5 }} />
//                                 ))}
//                             </ListItemIcon>
//                             <ListItemText primary={category.name} />
//                           </div>
//                           {category.fulfillment_channel && (
//                             <IconButton
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 toggleExpandCategory(category.id);
//                               }}
//                               size="small"
//                             >
//                               {expandedCategories[category.id] ? (
//                                 <ExpandLessIcon fontSize="small" />
//                               ) : (
//                                 <ExpandMoreIcon fontSize="small" />
//                               )}
//                             </IconButton>
//                           )}
//                         </MenuItem>
//                         {category.fulfillment_channel && (
//                           <Collapse
//                             in={expandedCategories[category.id]}
//                             timeout="auto"
//                             unmountOnExit
//                           >
//                             {category.fulfillment_channel.map((channelObj) => {
//                               const [label, value] = Object.entries(channelObj)[0];
//                               return (
//                                 <MenuItem
//                                   key={label}
//                                   onClick={() =>
//                                     handleFulfillmentSelect(category, { label, value })
//                                   }
//                                   sx={{ pl: 6 }}
//                                 >
//                                   {label}
//                                 </MenuItem>
//                               );
//                             })}
//                           </Collapse>
//                         )}
//                       </div>
//                     ))
//                   )}
//                 </Menu>
//               </Box>

//               {/* Product ID (ASIN) */}
//               <Box>
//                 <Autocomplete
//                   multiple
//                   disableCloseOnSelect
//                   freeSolo
//                   options={[
//                     ...selectedAsin,
//                     ...asinList.filter(
//                       (a) => !selectedAsin.some((sa) => sa.id === a.id)
//                     ),
//                   ]}
//                   getOptionLabel={(option) =>
//                     typeof option === "string" ? option : option.Asin
//                   }
//                   isOptionEqualToValue={(option, value) => option.id === value.id}
//                   inputValue={inputValueAsin}
//                   onInputChange={(e, newInputValue) =>
//                     setInputValueAsin(newInputValue)
//                   }
//                   value={selectedAsin}
//                   onChange={(event, newValue) => {
//                     setSelectedAsin(newValue);
//                     setActiveFilters((prev) => {
//                       const filtered = prev.filter(f => f.type !== 'asin');
//                       const asinFilters = newValue.map(asin => ({
//                         type: "asin",
//                         value: asin.id,
//                         label: asin.Asin
//                       }));
//                       return [...filtered, ...asinFilters];
//                     });
//                     updateMergedProducts(newValue, selectedSku);
//                   }}
//                   renderTags={() => null}
//                   renderOption={(props, option) => {
//                     const isSelected = selectedAsin.some((s) => s.id === option.id);
//                     return (
//                       <Box
//                         component="li"
//                         {...props}
//                         onClick={() => toggleSelectionAsin(option)}
//                         sx={{
//                           backgroundColor: isSelected
//                             ? "#b6d5f3 !important"
//                             : "transparent",
//                           fontSize: 13,
//                           cursor: "pointer",
//                         }}
//                       >
//                         {option.Asin}
//                       </Box>
//                     );
//                   }}
//                   renderInput={(params) => (
//                     <TextField
//                       {...params}
//                       label="Product ID"
//                       size="small"
//                       placeholder="Search ASIN..."
//                       fullWidth
//                       InputProps={{
//                         ...params.InputProps,
//                         endAdornment: <>{params.InputProps.endAdornment}</>,
//                       }}
//                     />
//                   )}
//                 />
//               </Box>

//               {/* Preset */}
//               <Box>
//                 <FormControl size="small" fullWidth>
//                   <InputLabel>Preset</InputLabel>
//                   <Select
//                     value={selectedPreset}
//                     label="Preset"
//                     onChange={(e) => {
//                       setSelectedPreset(e.target.value);
//                       handlePresetSelectHelium(e.target.value);
//                       setBefePreset(e.target.value);
//                       setAppliedPreset(e.target.value);
//                     }}
//                   >
//                     {presets.map((preset) => (
//                       <MenuItem key={preset} value={preset}>
//                         {getPresetDisplayLabel(preset)}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </Box>

//               {/* Date Pickers */}
//               <Box>
//                 <LocalizationProvider dateAdapter={AdapterDayjs}>
//                   <DatePicker
//                     label="Start Date"
//                     value={startDate}
//                     onChange={handleStartDateChangeOptimized}
//                     format="DD/MM/YYYY"
//                     disableFuture
//                     maxDate={endDate}
//                     slotProps={{
//                       textField: {
//                         size: "small",
//                         fullWidth: true,
//                         sx: datePickerSx
//                       }
//                     }}
//                   />
//                 </LocalizationProvider>
//               </Box>

//               <Box>
//                 <LocalizationProvider dateAdapter={AdapterDayjs}>
//                   <DatePicker
//                     label="End Date"
//                     value={endDate}
//                     onChange={handleEndDateChangeOptimized}
//                     format="DD/MM/YYYY"
//                     disableFuture
//                     minDate={startDate}
//                     disabled={!startDate}
//                     slotProps={{
//                       textField: {
//                         size: "small",
//                         fullWidth: true,
//                         sx: datePickerSx
//                       }
//                     }}
//                   />
//                 </LocalizationProvider>
//               </Box>

//               {/* Action Buttons */}
//               <Box sx={{ 
//                 display: 'flex', 
//                 gap: 2, 
//                 pt: 3, 
//                 position: 'sticky', 
//                 bottom: 0, 
//                 backgroundColor: 'background.paper', 
//                 pb: 2, 
//                 borderTop: '1px solid #e0e0e0',
//                 mt: 2
//               }}>
//                 <Button
//                   onClick={resetFilters}
//                   variant="outlined"
//                   sx={{ flex: 1, height: 44 }}
//                   startIcon={<Refresh />}
//                 >
//                   Reset All
//                 </Button>
//                 <Button
//                   onClick={applyFilters}
//                   variant="contained"
//                   sx={{ 
//                     flex: 1, 
//                     height: 44,
//                     backgroundColor: '#1976d2',
//                     '&:hover': {
//                       backgroundColor: '#1565c0',
//                     }
//                   }}
//                 >
//                   Apply Filters
//                 </Button>
//               </Box>
//             </Box>
//           </Box>
//         </Drawer>
//       </Box>

//       {/* Desktop Filters - Hidden on Mobile */}
//       <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
//         <Box sx={{ width: "180px" }}>
//           <CountrySelector
//             selectedCountry={selectedCountry}
//             onCountryChange={(country) => {
//               setSelectedCountry(country);
//               setActiveFilters((prev) => {
//                 const filtered = prev.filter(f => f.type !== 'country');
//                 return [...filtered, { type: 'country', value: country, label: country }];
//               });
//             }}
//           />
//         </Box>

//         <Box sx={{ width: "190px" }}>
//           <BrandSelector
//             selectedBrand={selectedBrand}
//             setSelectedBrand={(brands) => {
//               setSelectedBrand(brands);
//               setActiveFilters((prev) => {
//                 const filtered = prev.filter(f => f.type !== 'brand');
//                 const brandFilters = brands.map(brand => ({
//                   type: "brand",
//                   value: brand.id,
//                   label: brand.name
//                 }));
//                 return [...filtered, ...brandFilters];
//               });
//             }}
//             brandList={brandList}
//             inputValueBrand={inputValueBrand}
//             setInputValueBrand={setInputValueBrand}
//             brandLimit={brandLimit}
//             setBrandLimit={setBrandLimit}
//             isLoading={isLoading}
//             hasMore={hasMore}
//             toggleSelection={toggleSelection}
//             label="Brands"
//           />
//         </Box>

//         <Box sx={{ width: "140px" }}>
//           <Autocomplete
//             multiple
//             disableCloseOnSelect
//             options={[
//               ...selectedSku,
//               ...skuList.filter(
//                 (s) => !selectedSku.some((ss) => ss.id === s.id)
//               ),
//             ]}
//             getOptionLabel={(option) =>
//               typeof option === "string" ? option : option.sku
//             }
//             isOptionEqualToValue={(option, value) => option.id === value.id}
//             inputValue={inputValueSku}
//             onInputChange={(e, newInputValue) => {
//               setInputValueSku(newInputValue);
//               setSkuLimit(11);
//             }}
//             value={selectedSku}
//             onChange={(event, newValue) => {
//               setSelectedSku(newValue);
//               setActiveFilters((prev) => {
//                 const filtered = prev.filter(f => f.type !== 'sku');
//                 const skuFilters = newValue.map(sku => ({
//                   type: 'sku',
//                   value: sku.id,
//                   label: sku.sku
//                 }));
//                 return [...filtered, ...skuFilters];
//               });
//               updateMergedProducts(selectedAsin, newValue);
//             }}
//             renderTags={() => null}
//             noOptionsText={inputValueSku ? "No options" : ""}
//             renderOption={(props, option) => {
//               const isSelected = selectedSku.some((s) => s.id === option.id);
//               return (
//                 <Box
//                   component="li"
//                   {...props}
//                   onClick={() => toggleSelectionSKU(option)}
//                   sx={{
//                     backgroundColor: isSelected
//                       ? "#b6d5f3 !important"
//                       : "transparent",
//                     fontSize: 13,
//                     cursor: "pointer",
//                   }}
//                   key={option.id}
//                 >
//                   {option.sku}
//                 </Box>
//               );
//             }}
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 label="SKU"
//                 size="small"
//                 placeholder="Search SKU..."
//                 InputProps={{
//                   ...params.InputProps,
//                   endAdornment: <>{params.InputProps.endAdornment}</>,
//                 }}
//               />
//             )}
//             sx={{
//               "& .MuiInputBase-root": {
//                 height: 40,
//                 fontSize: 14,
//                 width: 140,
//               },
//               "& input": {
//                 fontSize: 13,
//               },
//             }}
//           />
//         </Box>

//         <Box>
//           <Button
//             variant="outlined"
//             onClick={handleMenuOpen}
//             sx={{
//               width: 160,
//               height: 40,
//               justifyContent: "space-between",
//               padding: "9px 8px 6px 8px",
//               color: "rgba(0, 0, 0, 0.6)",
//               fontSize: "16px",
//               borderColor: "#cacaca",
//               textTransform: "none",
//             }}
//           >
//             {selectedCategory
//               ? selectedCategory.fulfillment
//                 ? `${selectedCategory.name} - ${selectedCategory.fulfillment}`
//                 : selectedCategory.name
//               : "Select Channel"}
//             <ArrowDropDownIcon />
//           </Button>
//           <Menu
//             anchorEl={anchorEl}
//             open={Boolean(anchorEl)}
//             onClose={handleMenuClose}
//             PaperProps={{
//               sx: { maxHeight: 400, width: 143, fontSize: "15px" },
//             }}
//           >
//             {isLoading ? (
//               <MenuItem disabled>
//                 <CircularProgress size={24} sx={{ margin: "0 auto" }} />
//               </MenuItem>
//             ) : (
//               enhancedCategories.map((category) => (
//                 <div key={category.id}>
//                   <MenuItem
//                     onClick={() => handleCategorySelect(category)}
//                     sx={{
//                       pl: 2,
//                       color: "black",
//                       display: "flex",
//                       justifyContent: "space-between",
//                     }}
//                   >
//                     <div style={{ display: "flex", alignItems: "center" }}>
//                       <ListItemIcon>
//                         {category.icon ||
//                           (category.imageUrl ? (
//                             <img
//                               src={category.imageUrl}
//                               alt={category.name}
//                               style={{ width: 17, height: 14, marginRight: 5 }}
//                             />
//                           ) : (
//                             <ImageIcon sx={{ width: 17, height: 14, mr: 0.5 }} />
//                           ))}
//                       </ListItemIcon>
//                       <ListItemText primary={category.name} />
//                     </div>
//                     {category.fulfillment_channel && (
//                       <IconButton
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           toggleExpandCategory(category.id);
//                         }}
//                         size="small"
//                         sx={{ ml: 1 }}
//                       >
//                         {expandedCategories[category.id] ? (
//                           <ExpandLessIcon fontSize="small" />
//                         ) : (
//                           <ExpandMoreIcon fontSize="small" />
//                         )}
//                       </IconButton>
//                     )}
//                   </MenuItem>
//                   {category.fulfillment_channel && (
//                     <Collapse
//                       in={expandedCategories[category.id]}
//                       timeout="auto"
//                       unmountOnExit
//                     >
//                       {category.fulfillment_channel.map((channelObj) => {
//                         const [label, value] = Object.entries(channelObj)[0];
//                         return (
//                           <MenuItem
//                             key={label}
//                             onClick={() =>
//                               handleFulfillmentSelect(category, { label, value })
//                             }
//                             sx={{ pl: 6 }}
//                           >
//                             {label}
//                           </MenuItem>
//                         );
//                       })}
//                     </Collapse>
//                   )}
//                 </div>
//               ))
//             )}
//           </Menu>
//         </Box>

//         <Box sx={{ width: "150px" }}>
//           <Autocomplete
//             multiple
//             disableCloseOnSelect
//             freeSolo
//             options={[
//               ...selectedAsin,
//               ...asinList.filter(
//                 (a) => !selectedAsin.some((sa) => sa.id === a.id)
//               ),
//             ]}
//             getOptionLabel={(option) =>
//               typeof option === "string" ? option : option.Asin
//             }
//             isOptionEqualToValue={(option, value) => option.id === value.id}
//             inputValue={inputValueAsin}
//             onInputChange={(e, newInputValue) =>
//               setInputValueAsin(newInputValue)
//             }
//             value={selectedAsin}
//             onChange={(event, newValue) => {
//               setSelectedAsin(newValue);
//               setActiveFilters((prev) => {
//                 const filtered = prev.filter(f => f.type !== 'asin');
//                 const asinFilters = newValue.map(asin => ({
//                   type: "asin",
//                   value: asin.id,
//                   label: asin.Asin
//                 }));
//                 return [...filtered, ...asinFilters];
//               });
//               updateMergedProducts(newValue, selectedSku);
//             }}
//             renderTags={() => null}
//             renderOption={(props, option) => {
//               const isSelected = selectedAsin.some((s) => s.id === option.id);
//               return (
//                 <Box
//                   component="li"
//                   {...props}
//                   onClick={() => toggleSelectionAsin(option)}
//                   sx={{
//                     backgroundColor: isSelected
//                       ? "#b6d5f3 !important"
//                       : "transparent",
//                     fontSize: 13,
//                     cursor: "pointer",
//                   }}
//                 >
//                   {option.Asin}
//                 </Box>
//               );
//             }}
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 label="Product ID"
//                 size="small"
//                 placeholder="Search ASIN..."
//                 InputProps={{
//                   ...params.InputProps,
//                   endAdornment: <>{params.InputProps.endAdornment}</>,
//                 }}
//               />
//             )}
//             sx={{
//               "& .MuiInputBase-root": {
//                 height: 40,
//                 fontSize: 14,
//                 width: 150,
//               },
//               "& input": {
//                 fontSize: 13,
//               },
//             }}
//           />
//         </Box>

//         <Box sx={{ width: "130px" }}>
//           <FormControl size="small" sx={{ width: "110%" }}>
//             <InputLabel>Preset</InputLabel>
//             <Select
//               value={selectedPreset}
//               label="Preset"
//               onChange={(e) => {
//                 setSelectedPreset(e.target.value);
//                 handlePresetSelectHelium(e.target.value);
//                 setBefePreset(e.target.value);
//                 setAppliedPreset(e.target.value);
//               }}
//             >
//               {presets.map((preset) => (
//                 <MenuItem key={preset} value={preset}>
//                   {getPresetDisplayLabel(preset)}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         </Box>

//         <Box sx={{ width: "130px" }}>
//           <LocalizationProvider dateAdapter={AdapterDayjs}>
//             <DatePicker
//               label="Start Date"
//               value={startDate}
//               onChange={handleStartDateChangeOptimized}
//               format="DD/MM/YYYY"
//               disableFuture
//               maxDate={endDate}
//               slotProps={{
//                 textField: {
//                   size: "small",
//                   sx: datePickerSx
//                 }
//               }}
//             />
//           </LocalizationProvider>
//         </Box>

//         <Box sx={{ width: "130px" }}>
//           <LocalizationProvider dateAdapter={AdapterDayjs}>
//             <DatePicker
//               label="End Date"
//               value={endDate}
//               onChange={handleEndDateChangeOptimized}
//               format="DD/MM/YYYY"
//               disableFuture
//               minDate={startDate}
//               disabled={!startDate}
//               slotProps={{
//                 textField: {
//                   size: "small",
//                   sx: datePickerSx
//                 }
//               }}
//             />
//           </LocalizationProvider>
//         </Box>

//         <Tooltip title="Reset" arrow>
//           <Button
//             onClick={handleClearFilter}
//             variant="outlined"
//             sx={{
//               backgroundColor: "#000080",
//               minWidth: "auto",
//               padding: "8px",
//               "&:hover": {
//                 backgroundColor: "darkblue",
//               },
//             }}
//           >
//             <Refresh sx={{ color: "white", fontSize: "19px" }} />
//           </Button>
//         </Tooltip>
//       </Box>
//     </>
//   );
// };