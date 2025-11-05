import React from 'react';
import {
  Box,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Grid,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";

const BusinessFormulas = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const formulas = [
    { name: "Gross Revenue", formula: "Order Total" },
    { name: "Expenses", formula: "COGS + Channel Fees" },
    { name: "COGS", formula: "(Product Cost * Quantity)+Shipping cost by merchant" },
    { name: "Channel Fees", formula: "Channel Fees * Quantity" },
    { name: "Net Profit", formula: "(Product Price + Shipping Cost by customer + Funding + Item Promotion Discount) - (Channel Fee + COGS + Vendor Discount + Shipping Promotion Discount)" },
    { name: "Profit Margin", formula: "(Net Profit/Gross Revenue)*100" },
    { name: "ROI", formula: "(Net Profit/Expenses)*100" },
  ];

  const dataFields = [
    { field: "Product Cost", source: "Manual" },
    { field: "Ship Cost (Merchant Cost)", source: "From ShipStation" },
    { field: "Product Price (Customer Price)", source: "From API" },
    { field: "Shipping Price by Customer", source: "From ShipStation" },
    { field: 'Funding', source: "Manual" },
    { field: "Referral Fee", source: "Calculating on 0.15 * product price" },
    { field: "Tax", source: "From API" },
    { field: "Promotion Discount", source: "From API" },
    { field: "Ship Promotion Discount", source: "From API" },
    { field: "Vendor Discount", source: "Manual" },
  ];

  // 📱 Mobile: Render formulas as cards
  const renderMobileFormulas = () => (
    <Stack spacing={2}>
      {formulas.map((item, index) => (
        <Card key={index} sx={{
          border: '1px solid',
          borderColor: '#000080',
          borderRadius: 2,
          boxShadow: 2,
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#000080', fontWeight: 'bold', mb: 1 }}>
              {item.name}
            </Typography>
            <Typography variant="body1" sx={{
              fontFamily: 'monospace',
              p: "8px",
              borderRadius: '4px',
              bgcolor: 'rgba(0, 0, 128, 0.05)',
              color: '#000080',
            }}>
              {item.formula}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );

  // 📱 Mobile: Render data sources as cards
  const renderMobileDataSources = () => (
    <Stack spacing={2}>
      {dataFields.map((row, index) => (
        <Card key={index} sx={{
          border: '1px solid',
          borderColor: '#000080',
          borderRadius: 2,
          boxShadow: 1,
        }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#000080', mb: 1 }}>
              {row.field}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {row.source}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );

  // 💻 Desktop/Tablet: Render data sources as table
  const renderDesktopDataSources = () => (
    <TableContainer component={Paper} sx={{
      border: '1px solid',
      borderColor: '#000080',
      borderRadius: 2,
      overflow: 'hidden',
    }}>
      <Table aria-label="data sources table">
        <TableHead>
          <TableRow sx={{
            backgroundColor: 'rgba(0, 0, 128, 0.05)',
            borderBottom: '2px solid #000080',
          }}>
            <TableCell sx={{
              fontWeight: 'bold',
              fontSize: '1.1rem',
              color: '#000080',
              borderBottom: 'none',
              width: '50%',
            }}>
              Fields
            </TableCell>
            <TableCell sx={{
              fontWeight: 'bold',
              fontSize: '1.1rem',
              color: '#000080',
              borderBottom: 'none',
            }}>
              Data fetched from ?
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dataFields.map((row, index) => (
            <TableRow key={index} sx={{
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 128, 0.02)',
              },
              borderBottom: '1px solid #000080',
            }}>
              <TableCell component="th" scope="row" sx={{
                fontWeight: 'medium',
                borderBottom: 'none',
                py: 2,
              }}>
                {row.field}
              </TableCell>
              <TableCell sx={{
                color: 'text.secondary',
                borderBottom: 'none',
                py: 2,
              }}>
                {row.source}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{
      padding: { xs: 2, sm: 3 },
      mt: { xs: '10%', sm: 0 },
    }}>
      {/* 🔝 Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' gutterBottom sx={{
          fontWeight: 'bold',
          color: '#000080',
          mb: 3,
        }}>
          Business Rules
        </Typography>
      </Box>

      {/* 📊 Formulas Section */}
      <Paper elevation={2} sx={{
        padding: { xs: 2, sm: 3 },
        mb: 4,
        border: '1px solid',
        borderColor: '#000080',
        borderRadius: 2,
      }}>
        <Typography variant='h5' sx={{
          fontWeight: 'bold',
          color: '#000080',
          mb: 3,
        }}>
          Business Formulas
        </Typography>

        {isMobile ? renderMobileFormulas() : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {formulas.map((item, index) => (
              <Box key={index} sx={{
                display: 'flex',
                alignItems: { xs: 'flex-start', sm: 'center' },
                flexDirection: { xs: 'column', sm: 'row' },
                padding: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: '#000080',
                gap: { xs: 1, sm: 2 },
              }}>
                <Typography variant='h6' sx={{
                  fontWeight: 'bold',
                  minWidth: { xs: 'auto', sm: '150px' },
                  color: '#000080',
                }}>
                  {item.name}
                </Typography>
                <Typography variant='body1' sx={{
                  fontFamily: 'monospace',
                  padding: "8px",
                  borderRadius: '4px',
                  bgcolor: 'rgba(0, 0, 128, 0.05)',
                  color: '#000080',
                  flex: 1,
                  width: { xs: '100%', sm: 'auto' },
                }}>
                  {item.formula}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      {/* 📋 Data Sources Section */}
      <Divider sx={{ my: 4, borderColor: '#000080' }}>
        <Typography variant="h6" sx={{
          bgcolor: 'white',
          px: 2,
          color: '#000080',
        }}>
          Data Sources
        </Typography>
      </Divider>

      <Paper elevation={2} sx={{
        padding: { xs: 2, sm: 3 },
        border: '1px solid',
        borderColor: '#000080',
        borderRadius: 2,
      }}>
        <Typography variant='h5' sx={{
          fontWeight: 'bold',
          color: '#000080',
          mb: 3,
        }}>
          Where Data Comes From
        </Typography>

        {isMobile ? renderMobileDataSources() : renderDesktopDataSources()}
      </Paper>
    </Box>
  );
};

export default BusinessFormulas;