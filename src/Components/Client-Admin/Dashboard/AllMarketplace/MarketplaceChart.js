import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Box, Typography } from '@mui/material';
import { MARKETPLACE_COLORS } from '../CardComponet';
const fontStyles = {
  fontSize: "16px",
  color: "#485E75",
  fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
};

export default function MarketplaceChart({ marketplaceList }) {
  const chartData = marketplaceList.map(item => ({
    marketplace: item.marketplace,
    margin: item.currency_list[0]?.margin || 0,
    grossRevenue: item.currency_list[0]?.grossRevenue || 0,
    netProfit: item.currency_list[0]?.netProfit || 0,
    roi: item.currency_list[0]?.roi || 0,
  }));
  const sortedData = [...chartData].sort((a, b) => b.margin - a.margin);
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Typography sx={{ ...fontStyles, fontWeight: 600, fontSize: '14px', mb: 1 }}>
            {data.marketplace}
          </Typography>
          <Typography sx={{ ...fontStyles, fontSize: '12px' }}>
            Margin: {data.margin.toFixed(2)}%
          </Typography>
          <Typography sx={{ ...fontStyles, fontSize: '12px' }}>
            ROI: {data.roi.toFixed(2)}%
          </Typography>
          <Typography sx={{ ...fontStyles, fontSize: '12px' }}>
            Gross Revenue: ${data.grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
          <Typography sx={{ ...fontStyles, fontSize: '12px' }}>
            Net Profit: ${data.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
        </Box>
      );
    }
    return null;
  };
   if (sortedData.length === 0) {
          return (
              <Box
                  sx={{
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      padding: 3,
                      backgroundColor: "white",
                      minHeight: 400,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                  }}
              >
                  <Typography
                      variant="body2"
                      sx={{
                          textAlign: "center",
                          fontSize: "1rem",
                          fontWeight: "bold",
                          color: "#888",
                      }}
                  >
                      No data available
                  </Typography>
              </Box>
          );
      }
      
  return (
    <Box 
      sx={{ 
        height:400,
        border: "1px solid #e0e0e0",
        borderRadius: "8px", 
        padding: 3,
        backgroundColor: "white",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          ...fontStyles,
          fontWeight: 600,
          fontSize: '18px',
          color: '#111827',
          mb: 2, 
          textAlign: 'center',
          flexShrink: 0, 
        }}
      >
        Margin % by Channel
      </Typography>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 10, right: 60, left: 10, bottom: 10 }} 
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              type="number"
              domain={[0, 'dataMax + 5']}
              tick={{ fill: '#485E75', fontFamily: fontStyles.fontFamily, fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="marketplace"
              tick={{ fill: '#111827', fontFamily: fontStyles.fontFamily, fontSize: 12, fontWeight: 500 }}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
            <Bar dataKey="margin" radius={[0, 4, 4, 0]} barSize={20}>
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={MARKETPLACE_COLORS[entry.marketplace] || MARKETPLACE_COLORS.custom} />
              ))}
              <LabelList
                dataKey="margin"
                position="right"
                formatter={(value) => `${value.toFixed(0)}%`}
                style={{ fill: '#111827', fontFamily: fontStyles.fontFamily, fontSize: 12, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}