import { Box, Typography } from "@mui/material";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Label,
} from "recharts";
import { formatCurrency } from "../../../../utils/currencyFormatter";
const fontStyles = {
    fontSize: "16px",
    color: "#485E75",
    fontFamily:
        "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
};
export default function NetProfitChart({ marketplaceList, country }) {
    const chartData = marketplaceList
        .filter((item) => item.currency_list && item.currency_list.length > 0)
        .map((item) => ({
            name: item.marketplace,
            netProfit: item.currency_list[0]?.netProfit || 0,
        }))
        .filter((item) => item.netProfit > 0);
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <Box
                    sx={{
                        backgroundColor: "white",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        padding: "12px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                >
                    <Typography
                        sx={{
                            ...fontStyles,
                            fontWeight: 600,
                            fontSize: "14px",
                            mb: 0.5,
                        }}
                    >
                        {data.payload.name}
                    </Typography>
                    <Typography sx={{ ...fontStyles, fontSize: "12px" }}>
                        Net Profit: {formatCurrency(data.value, country)}
                    </Typography>
                </Box>
            );
        }
        return null;
    };
    const CustomLabel = ({ x, y, value }) => {
        return (
            <text
                x={x}
                y={y - 10}
                fill="#111827"
                textAnchor="middle"
                style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    fontFamily: fontStyles.fontFamily,
                }}
            >
                {Math.round(value).toLocaleString()}
            </text>
        );
    };
    if (chartData.length === 0) {
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
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                padding: 3,
                backgroundColor: "white",
                minHeight: 400,
            }}
        >
            <Typography
                variant="h6"
                sx={{
                    ...fontStyles,
                    fontWeight: 600,
                    fontSize: "18px",
                    color: "#111827",
                    mb: 3,
                    textAlign: "center",
                }}
            >
                Net Profit by Channel
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
                <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                        dataKey="name"
                        tick={{
                            fill: "#485E75",
                            fontSize: 14,
                            fontFamily: fontStyles.fontFamily,
                        }}
                        axisLine={{ stroke: "#e0e0e0" }}
                    />
                    <YAxis
                        tick={{
                            fill: "#485E75",
                            fontSize: 12,
                            fontFamily: fontStyles.fontFamily,
                        }}
                        axisLine={{ stroke: "#e0e0e0" }}
                        tickFormatter={(value) => Math.round(value).toLocaleString()}
                    >
                        <Label
                            value="Net Profit"
                            angle={-90}
                            position="insideLeft"
                            style={{
                                textAnchor: "middle",
                                fill: "#485E75",
                                fontSize: 14,
                                fontFamily: fontStyles.fontFamily,
                            }}
                        />
                    </YAxis>
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="netProfit"
                        stroke="#FFA500"
                        strokeWidth={3}
                        dot={{
                            fill: "#FFA500",
                            r: 6,
                            strokeWidth: 2,
                            stroke: "#fff",
                        }}
                        activeDot={{
                            r: 8,
                            fill: "#FF8C00",
                        }}
                        label={<CustomLabel />}
                    />
                </LineChart>
            </ResponsiveContainer>
        </Box>
    );
}
