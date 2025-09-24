"use client"

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'

import LogisticsStatisticsCard from '@/views/pages/widget-examples/statistics/LogisticsStatisticsCard'

const StyledCard = ({ children }) => (
    <Card
        sx={{
            borderRadius: 3,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease',
            '&:hover': {
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                transform: 'translateY(-2px)',
            },
        }}
    >
        {children}
    </Card>

)

const data = [
    {
        title: 'Open complain',
        stats: 42,
        trendNumber: 18.2,
        avatarIcon: 'tabler-report',
        color: 'primary'
    },
    {
        title: 'Resolved complain',
        stats: 8,
        trendNumber: -8.7,
        avatarIcon: 'tabler-checklist',
        color: 'success'
    },
    {
        title: 'Unpaid bill',
        stats: 27,
        trendNumber: 4.3,
        avatarIcon: 'tabler-receipt',
        color: 'error'
    },
    {
        title: 'Paid bill',
        stats: 13,
        trendNumber: 2.5,
        avatarIcon: 'tabler-receipt',
        color: 'info'
    },
    {
        title: 'Camera',
        stats: 13,
        trendNumber: 2.5,
        avatarIcon: 'tabler-camera',
        color: 'info'
    },
    {
        title: 'Visitor',
        stats: 13,
        trendNumber: 2.5,
        avatarIcon: 'tabler-user',
        color: 'info'
    }
]

const UserDashboard = () => {
    return (
        <Grid container spacing={6}>
            {/* Row 1 - Stats placeholder */}
            <Grid size={{ xs: 12 }}>
                <LogisticsStatisticsCard data={data} />
            </Grid>

            {/* Row 2 */}
            <Grid size={{ xs: 12, md: 6 }}>
                <StyledCard>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">Open and Pending Tickets</Typography>
                            <Box>
                                <Chip label="0 Pending" color="warning" size="small" sx={{ mr: 1 }} />
                                <Chip label="2 Open" color="primary" size="small" />
                            </Box>
                        </Box>
                        <Divider sx={{ mb: 2 }} />

                        {/* Ticket Item */}
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{
                                p: 2,
                                border: '1px solid #eee',
                                borderRadius: 2,
                                mb: 2,
                                transition: '0.3s',
                                '&:hover': { backgroundColor: '#fafafa' },
                            }}
                        >
                            <Box display="flex" alignItems="center">
                                <Avatar sx={{ mr: 2 }}>
                                    <i className='tabler-report'></i>
                                </Avatar>
                                <Box>
                                    <Typography fontWeight={600}>65949064</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Owner
                                    </Typography>
                                </Box>
                            </Box>
                            <Chip label="Open" color="primary" variant="outlined" size="small" />
                        </Box>

                        {/* Another Ticket */}
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{
                                p: 2,
                                border: '1px solid #eee',
                                borderRadius: 2,
                                transition: '0.3s',
                                '&:hover': { backgroundColor: '#fafafa' },
                            }}
                        >
                            <Box display="flex" alignItems="center">
                                <Avatar sx={{ mr: 2 }}>
                                    <i className='tabler-report'></i>
                                </Avatar>
                                <Box>
                                    <Typography fontWeight={600}>74127357</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Owner
                                    </Typography>
                                </Box>
                            </Box>
                            <Chip label="Open" color="primary" variant="outlined" size="small" />
                        </Box>
                    </CardContent>
                </StyledCard>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
                <StyledCard>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">Utility Bills Payments Due</Typography>
                            <Chip label="$894.82 Total Due" />
                        </Box>
                        <Divider sx={{ mb: 2 }} />

                        {[
                            { date: "04 September 2025", amount: "$387.72" },
                            { date: "10 September 2025", amount: "$364.02" },
                            { date: "20 September 2025", amount: "$143.08" },
                        ].map((bill, i) => (
                            <Box
                                key={i}
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                sx={{
                                    p: 2,
                                    border: '1px solid #eee',
                                    borderRadius: 2,
                                    mb: 2,
                                    transition: '0.3s',
                                    '&:hover': { backgroundColor: '#fafafa' },
                                }}
                            >
                                <Box display="flex" alignItems="center">
                                    <Avatar sx={{ mr: 2 }}>
                                        <i className='tabler-invoice'></i>
                                    </Avatar>
                                    <Box>
                                        <Typography fontWeight={600}>101 Water Bill</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {bill.date}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box textAlign="right">
                                    <Typography fontWeight={600}>{bill.amount}</Typography>
                                    <Chip label="Unpaid" color="primary" size="small" />
                                </Box>
                            </Box>
                        ))}
                    </CardContent>
                </StyledCard>
            </Grid>

            {/* Row 3 */}
            <Grid size={{ xs: 12, md: 6 }}>
                <StyledCard>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Today&apos;s Visitors
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Wednesday, 24 Sep 2025
                        </Typography>
                        <Divider sx={{ mb: 4 }} />
                        <Box display="flex" flexDirection="column" alignItems="center" py={6}>
                            <Avatar sx={{ width: 56, height: 56, mb: 2 }}>
                                <i className='tabler-user'></i>
                            </Avatar>
                            <Typography color="text.secondary">No visitors found</Typography>
                        </Box>
                    </CardContent>
                </StyledCard>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
                <StyledCard>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Notices
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        {[
                            "Parking Policy Update",
                            "Children's Park Renovation",
                            "Annual General Meeting Notice",
                            "Building Maintenance Schedule",
                        ].map((notice, i) => (
                            <Box
                                key={i}
                                display="flex"
                                alignItems="center"
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    mb: 1,
                                    transition: '0.3s',
                                    '&:hover': { backgroundColor: '#fafafa' },
                                }}
                            >
                                <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                                    <i className='tabler-bell'></i>
                                </Avatar>
                                <Typography>{notice}</Typography>
                            </Box>
                        ))}
                    </CardContent>
                </StyledCard>
            </Grid>
        </Grid>
    )
}

export default UserDashboard
