import React from 'react'
import { Box, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
const BusinessFormulas = () => {
    const formulas = [
        {
            name: "Gross Revenue",
            formula: "Order Total"
        },
        {
            name: "Expenses",
            formula: "COGS + Channel Fees"
        },
        {
            name: "COGS",
            formula: "(Product Cost * Quantity)+Shipping cost by merchant"
        },
        {
            name: "Channel Fees",
            formula: "Channel Fees * Quantity"
        },
        {
            name: "Net Profit",
            formula: "(Product Price + Shipping Cost by customer + Funding + Item Promotion Discount) - (Channel Fee + COGS + Vendor Discount + Shipping Promotion Discount)"
        },
        {
            name: "Profit Margin",
            formula: "(Net Profit/Gross Revenue)*100"
        },
        {
            name: "ROI",
            formula: "(Net Profit/Expenses)*100"
        }
    ]
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
    ]
    return (
        <div>
            <Box sx={{ padding: 3 }}>
                <Typography variant='h4' gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                    Business Rules
                </Typography>
                <Paper elevation={2} sx={{ padding: 3, mb: 4,border:'1px solid',borderColor:'#000080'}}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {formulas.map((item, index) => (
                            <Box key={index} sx={{
                                display: 'flex',
                                alignItems: "flex-start",
                                padding: 2,
                                borderRadius: 1,
                                border:'1px solid',
                                borderColor:'#000080'
                            }}>
                                <Typography variant='h6' sx={{ fontWeight: 'bold', minWidth: '150px', color: '#000080', mr: 2 }}>
                                    {item.name}
                                </Typography>
                                <Typography variant='body1' sx={{ fontFamily: 'monospace',padding: "4px 8px", borderRadius: '4px',borderColor:'#000080', flex: 1 }}>
                                    {item.formula}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Paper>
                <Divider sx={{my:3}}>
                    <Paper elevation={2} sx={{padding:3}}>
                        <Typography variant='h5' gutterBottom sx={{fontWeight:'semibold',mb:3}}>
                            Data Sources
                        </Typography>
                        <TableContainer>
                            <Table sx={{minWidth:650}} aria-label='data sources table'>
                                <TableHead>
                                    <TableRow sx={{borderBottom:'2px solid',borderColor:'#000080'}}>
                                        <TableCell sx={{fontWeight:'bold',fontSize:'1.1rem',color:'#000080',borderBottom:'none'}}>
                                            Fields
                                        </TableCell>
                                        <TableCell sx={{fontWeight:'bold',fontSize:'1.1rem',color:'#000080',borderBottom:'none'}}>
                                            Data fetched from ?
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {dataFields.map((row,index)=>(
                                        <TableRow key={index} sx={{
                                            borderBottom:'1px solid',
                                            borderColor:'#000080',
                                            '&:hover':{
                                                backgroundColor:'rgba(25,118,210,0.04)'
                                            }
                                        }}>

                                            <TableCell component='th' scope='row' sx={{fontWeight:'medium',borderBottom:"none"}}>
                                                {row.field}
                                                </TableCell>
                                                <TableCell sx={{color:'text.secondary',borderBottom:'none'}}>
                                                    {row.source}
                                                </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Divider>
            </Box>
        </div>
    )
}
export default BusinessFormulas