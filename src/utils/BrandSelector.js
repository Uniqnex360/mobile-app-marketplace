import { Autocomplete, TextField, Box, Paper } from "@mui/material";

const BrandSelector = ({
    selectedBrand,
    setSelectedBrand,
    brandList,
    inputValueBrand,
    setInputValueBrand,
    brandLimit,
    setBrandLimit,
    isLoading,
    hasMore,
    toggleSelection,
    label = 'Brands',
    fullWidth = true
}) => {
    return (
        <Box sx={{
            position: 'relative',
            width: fullWidth ? '100%' : 'auto',
        }}>
            <Autocomplete
                multiple
                disableCloseOnSelect
                disablePortal
                options={[
                    ...selectedBrand,
                    ...brandList.filter(
                        (b) => !selectedBrand.some((sb) => sb.id === b.id)
                    ),
                ]}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                }
                inputValue={inputValueBrand}
                onInputChange={(event, newInputValue) => {
                    setInputValueBrand(newInputValue);
                    setBrandLimit(11);
                }}
                value={selectedBrand}
                onChange={(event, newValue) => {
                    setSelectedBrand(newValue);
                }}
                renderTags={() => null}
                noOptionsText={inputValueBrand ? "No options" : ""}
                renderOption={(props, option) => {
                    const isSelected = selectedBrand.some(
                        (b) => b.id === option.id
                    );
                    return (
                        <Box
                            component="li"
                            {...props}
                            onClick={() => toggleSelection(option)}
                            sx={{
                                backgroundColor: isSelected
                                    ? "#b6d5f3 !important"
                                    : "transparent",
                                fontSize: 13,
                                cursor: "pointer",
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                            }}
                            key={option.id}
                        >
                            {option.name}
                        </Box>
                    );
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={label}
                        size="small"
                        placeholder="Search brands..."
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: <>{params.InputProps.endAdornment}</>,
                        }}
                        fullWidth={fullWidth}
                    />
                )}
                PaperComponent={(props) => (
                    <Paper
                        {...props}
                        sx={{
                            width: '100% !important',
                            maxWidth: '100% !important',
                            margin: 0,
                        }}
                    />
                )}
                ListboxProps={{
                    onScroll: (event) => {
                        const { scrollTop, scrollHeight, clientHeight } =
                            event.target;
                        if (
                            scrollTop + clientHeight >= scrollHeight - 5 &&
                            !isLoading &&
                            hasMore
                        ) {
                            setBrandLimit((prev) => prev + 10);
                        }
                    },
                    sx: {
                        maxHeight: 300,
                        overflowY: 'auto',
                    }
                }}
                slotProps={{
                    popper: {
                        disablePortal: true,
                        placement: 'bottom-start',
                        modifiers: [
                            {
                                name: 'flip',
                                enabled: false,
                            },
                            {
                                name: 'preventOverflow',
                                enabled: true,
                                options: {
                                    altAxis: false,
                                    tether: false,
                                },
                            },
                        ],
                        sx: {
                            width: '100% !important',
                            left: '0 !important',
                            right: '0 !important',
                            zIndex: 1300,
                        }
                    }
                }}
                sx={{
                    width: '100%',
                    "& .MuiInputBase-root": {
                        height: 40,
                        fontSize: 14,
                        width: '100%',
                    },
                    "& input": {
                        fontSize: 13,
                    },
                    "& .MuiAutocomplete-popper": {
                        width: '100% !important',
                    }
                }}
            />
        </Box>
    );
};

export default BrandSelector;   