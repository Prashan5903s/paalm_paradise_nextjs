'use client'

import { useState, useMemo, useEffect } from 'react'

import dynamic from 'next/dynamic'

import { useSession } from 'next-auth/react'

import {
    TabContext,
    TabList,
    TabPanel
} from '@mui/lab'

import {
    Tab,
    Checkbox,
    Box,
    Stack,
    Card,
    Chip,
    TextField,
    Button,
    CardHeader,
    MenuItem,
    CardContent,
    Typography,
} from '@mui/material'

import dayjs from 'dayjs'

import classnames from 'classnames'

import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getFilteredRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFacetedMinMaxValues,
    getPaginationRowModel,
    getSortedRowModel
} from '@tanstack/react-table'

import { useTheme } from '@mui/material/styles'

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'

import OptionMenu from '@core/components/option-menu'

import CustomAvatar from '@core/components/mui/Avatar'

import TablePaginationComponent from '@components/TablePaginationComponent'

import CustomTextField from '@/@core/components/mui/TextField'

import tableStyles from '@core/styles/table.module.css'


const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const columnHelper = createColumnHelper()

const fuzzyFilter = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value)

    addMeta({ itemRank })

    return itemRank.passed
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
    const [value, setValue] = useState(initialValue)

    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value)
        }, debounce)

        return () => clearTimeout(timeout)

    }, [value])

    return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />

}

const EarningReportsWithTabs = () => {
    // States
    const [value, setValue] = useState('All')
    const [reportData, setReportData] = useState([])

    // Hooks
    const theme = useTheme()
    const { data: session } = useSession() || {}
    const token = session?.user?.token
    const URL = process.env.NEXT_PUBLIC_API_URL

    // Vars
    const disabledText = 'var(--mui-palette-text-disabled)'

    // Tab change
    const handleChange = (event, newValue) => {
        setValue(newValue)
    }

    // Fetch data
    const fetchGraphicalReport = async () => {
        try {
            const response = await fetch(`${URL}/company/graph/payment/report/${value}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` }
            })

            const result = await response.json()

            if (response.ok) {
                setReportData(result?.data || [])
            } else {
                setReportData([])
            }
        } catch (error) {
            console.error("Error fetching report:", error)
            setReportData([])
        }
    }

    useEffect(() => {
        if (URL && token && value) {
            fetchGraphicalReport()
        }
    }, [URL, token, value])

    // Tabs
    const tabData = [
        { type: 'All', avatarIcon: 'tabler-shopping-cart' },
        { type: 'Utility', avatarIcon: 'tabler-chart-bar' },
        { type: 'Common Area', avatarIcon: 'tabler-currency-dollar' },
        { type: 'Maintenance', avatarIcon: 'tabler-chart-pie-2' }
    ]

    const renderTabs = currentValue => {
        return tabData.map((item, index) => (
            <Tab
                key={index}
                value={item.type}
                className='mie-4'
                label={
                    <div
                        className={classnames(
                            'flex flex-col items-center justify-center gap-2 is-[110px] bs-[100px] border rounded-xl',
                            item.type === currentValue ? 'border-solid border-[var(--mui-palette-primary-main)]' : 'border-dashed'
                        )}
                    >
                        <CustomAvatar
                            variant='rounded'
                            skin='light'
                            size={38}
                            {...(item.type === currentValue && { color: 'primary' })}
                        >
                            <i
                                className={classnames(
                                    'text-[22px]',
                                    { 'text-textSecondary': item.type !== currentValue },
                                    item.avatarIcon
                                )}
                            />
                        </CustomAvatar>
                        <Typography className='font-medium capitalize' color='text.primary'>
                            {item.type}
                        </Typography>
                    </div>
                }
            />
        ))
    }

    const renderTabPanels = (currentValue, theme, options, colors) => {

        const max = reportData.length > 0 ? Math.max(...reportData) : 0

        const seriesIndex = reportData.indexOf(max)

        const finalColors = colors.map((color, i) =>
            seriesIndex === i ? 'var(--mui-palette-primary-main)' : color
        )

        return tabData.map((item, index) => (
            <TabPanel key={index} value={item.type} className='!p-0'>
                {item.type === currentValue && (
                    <AppReactApexCharts
                        type='bar'
                        height={233}
                        width='100%'
                        options={{ ...options, colors: finalColors }}
                        series={[{ data: reportData }]}
                    />
                )}
            </TabPanel>
        ))
    }

    // Chart config
    const colors = Array(12).fill('var(--mui-palette-primary-lightOpacity)')

    const options = {
        chart: { parentHeightOffset: 0, toolbar: { show: false } },
        plotOptions: {
            bar: {
                borderRadius: 6,
                distributed: true,
                columnWidth: '33%',
                borderRadiusApplication: 'end',
                dataLabels: { position: 'top' }
            }
        },
        legend: { show: false },
        tooltip: { enabled: false },
        dataLabels: {
            offsetY: -11,
            formatter: val => `${val}k`,
            style: {
                fontWeight: 500,
                colors: ['var(--mui-palette-text-primary)'],
                fontSize: theme.typography.body1.fontSize
            }
        },
        colors,
        states: {
            hover: { filter: { type: 'none' } },
            active: { filter: { type: 'none' } }
        },
        grid: {
            show: false,
            padding: { top: -19, left: -4, right: 0, bottom: -11 }
        },
        xaxis: {
            axisTicks: { show: false },
            axisBorder: { color: 'var(--mui-palette-divider)' },
            categories: [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ],
            labels: {
                style: {
                    colors: disabledText,
                    fontFamily: theme.typography.fontFamily,
                    fontSize: theme.typography.body2.fontSize
                }
            }
        },
        yaxis: {
            labels: {
                offsetX: -18,
                formatter: val => `$${val}k`,
                style: {
                    colors: disabledText,
                    fontFamily: theme.typography.fontFamily,
                    fontSize: theme.typography.body2.fontSize
                }
            }
        },
        responsive: [
            {
                breakpoint: 1450,
                options: { plotOptions: { bar: { columnWidth: '45%' } } }
            },
            {
                breakpoint: 600,
                options: {
                    dataLabels: { style: { fontSize: theme.typography.body2.fontSize } },
                    plotOptions: { bar: { columnWidth: '58%' } }
                }
            },
            {
                breakpoint: 500,
                options: { plotOptions: { bar: { columnWidth: '70%' } } }
            }
        ]
    }

    return (
        <Card>
            <CardHeader
                title='Payment Report'
                subheader='Yearly Earnings Overview'
                action={<OptionMenu options={['Last Week', 'Last Month', 'Last Year']} />}
            />
            <CardContent>
                <TabContext value={value}>
                    <TabList
                        variant='scrollable'
                        scrollButtons='auto'
                        onChange={handleChange}
                        aria-label='earning report tabs'
                        className='!border-0 mbe-10'
                        sx={{
                            '& .MuiTabs-indicator': { display: 'none !important' },
                            '& .MuiTab-root': { padding: '0 !important', border: '0 !important' }
                        }}
                    >
                        {renderTabs(value)}
                    </TabList>
                    {renderTabPanels(value, theme, options, colors)}
                </TabContext>
            </CardContent>
        </Card>
    )
}

const PaymentReport = () => {
    const [type, setType] = useState('') // default empty string to avoid uncontrolled warning
    const [value, setValue] = useState("graphical")
    const [isOpen, setIsOpen] = useState(false)
    const [openDialog, setOpenDialog] = useState(false)
    const [payDialog, setPayDialog] = useState(false)
    const [filteredData, setFilteredData] = useState([])
    const [globalFilter, setGlobalFilter] = useState('')
    const [rowSelection, setRowSelection] = useState({})
    const [permissions, setPermissions] = useState({})
    const [payData, setPayData] = useState(null)
    const [bill_id, setBillId] = useState(null)
    const [paidData, setPaidData] = useState([])

    const initialStart = dayjs().startOf('day')
    const initialEnd = dayjs().endOf('day')
    const minDateTime = dayjs('2000-01-01') // set a fallback min date
    const maxDateTime = dayjs('2100-01-01') // set a fallback max date

    const [start, setStart] = useState(initialStart)
    const [end, setEnd] = useState(initialEnd)

    const handleTabChange = (e, newValue) => {
        setValue(newValue)
    }

    const columns = useMemo(() => {
        const baseColumns = [
            {
                id: "select",
                header: ({ table }) => (
                    <Checkbox
                        checked={table.getIsAllRowsSelected()}
                        indeterminate={table.getIsSomeRowsSelected()}
                        onChange={table.getToggleAllRowsSelectedHandler()}
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        disabled={!row.getCanSelect()}
                        indeterminate={row.getIsSomeSelected()}
                        onChange={row.getToggleSelectedHandler()}
                    />
                ),
            },
        ]

        // Define all other columns like year, month, total_amount, etc.
        baseColumns.push(
            columnHelper.accessor("year", { header: "Year", cell: ({ row }) => <Typography>{row.original.year}</Typography> }),
            columnHelper.accessor("month", { header: "Month", cell: ({ row }) => <Typography>{row.original.month}</Typography> }),
            columnHelper.accessor("payment_due_date", { header: "Bill Payment Date", cell: ({ row }) => <Typography>{row.original.payment_due_date ? FormatTime(row.original.payment_due_date) : ""}</Typography> }),
            columnHelper.accessor("total_amount", {
                header: "Total Amount",
                cell: ({ row }) => {

                    const additionalCosts = row.original.additional_cost || []

                    const total = additionalCosts.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)

                    return <Typography>{total}</Typography>
                }
            }),
            columnHelper.accessor("bill_type", { header: "Bill Type", cell: ({ row }) => <Typography className="capitalize">{row.original.bill_type?.name || ''}</Typography> }),
            columnHelper.accessor("bill_date", { header: "Bill Date", cell: ({ row }) => <Typography>{FormatTime(row.original.bill_date)}</Typography> }),
            columnHelper.accessor("bill_due_date", { header: "Bill Due Date", cell: ({ row }) => <Typography>{FormatTime(row.original.bill_due_date)}</Typography> }),
            columnHelper.accessor("bill_amount", {
                header: "Bill Amount",
                cell: ({ row }) => {

                    const totalPaid = row.original.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

                    const remaining = (row.original.bill_amount || 0) - totalPaid

                    return (
                        <Typography>
                            {row.original.bill_amount || 0}
                            {remaining > 0 && (
                                <Button variant="outlined" sx={{ ml: 1 }} onClick={() => { setBillId(row.original._id); setPayDialog(true); setPayData(remaining) }} disabled={remaining <= 0}>
                                    Pay
                                </Button>
                            )}
                        </Typography>
                    )
                }
            }),
            columnHelper.accessor("paid_amount", {
                header: "Paid Amount",
                cell: ({ row }) => {

                    const totalPaid = row.original.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

                    return (
                        <Typography>
                            {totalPaid > 0 ? (
                                <Button onClick={() => { setIsOpen(true); setPaidData(row.original) }}>{totalPaid}</Button>
                            ) : totalPaid}
                        </Typography>
                    )
                }
            }),
            columnHelper.accessor("status", {
                header: "Status",
                cell: ({ row }) => <Chip label={row.original.status ? "Paid" : "Unpaid"} color={row.original.status ? "success" : "error"} variant="tonal" size="small" />
            })
        )

        return baseColumns
    }, [permissions])

    const table = useReactTable({
        data: filteredData,
        columns,
        filterFns: { fuzzy: fuzzyFilter },
        state: { rowSelection, globalFilter },
        initialState: { pagination: { pageSize: 10 } },
        enableRowSelection: true,
        globalFilterFn: fuzzyFilter,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues()
    })

    return (
        <TabContext value={value}>
            <TabList
                variant='scrollable'
                onChange={handleTabChange}
                className='border-b px-0 pt-0'
            >
                <Tab key={1} label='Graphical' value="graphical" />
                <Tab key={2} label='Tabular' value="tabular" />
            </TabList>

            <div className='pt-0 mt-4'>
                {/* Graphical */}
                <TabPanel value="graphical" className='p-0'>
                    <EarningReportsWithTabs />
                </TabPanel>

                {/* Tabular */}
                <TabPanel value="tabular" className='p-0'>
                    <Card>
                        <CardContent className='flex justify-between flex-col gap-4 items-start sm:flex-row sm:items-center'>
                            <div className='flex items-center gap-2'>
                                <Typography>Show</Typography>
                                <CustomTextField
                                    select
                                    value={table.getState().pagination.pageSize}
                                    onChange={e => table.setPageSize(Number(e.target.value))}
                                    className='max-sm:is-full sm:is-[70px]'
                                >
                                    <MenuItem value={10}>10</MenuItem>
                                    <MenuItem value={25}>25</MenuItem>
                                    <MenuItem value={50}>50</MenuItem>
                                </CustomTextField>
                            </div>

                            {/* 🔥 Filters Row */}
                            <div className="flex gap-4 flex-col">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <Box sx={{ flex: 1 }}>
                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="stretch" sx={{ width: '100%' }}>
                                            <DateTimePicker label="Start" value={start || initialStart} onChange={(newVal) => setStart(newVal || initialStart)} minDateTime={minDateTime} maxDateTime={maxDateTime} slotProps={{ textField: { fullWidth: true, size: 'small' } }} />
                                            <DateTimePicker label="End" value={end || initialEnd} onChange={(newVal) => setEnd(newVal || initialEnd)} minDateTime={minDateTime} maxDateTime={maxDateTime} slotProps={{ textField: { fullWidth: true, size: 'small' } }} />
                                            <TextField select fullWidth size="small" required label="Bill Type" value={type} onChange={(e) => setType(e.target.value)}>
                                                <MenuItem value="" disabled>Select Bill Type</MenuItem>
                                                <MenuItem value="all">All</MenuItem>
                                                <MenuItem value="utility_bill">Utility Bill</MenuItem>
                                                <MenuItem value="common_area_bill">Common Area Bill</MenuItem>
                                                <MenuItem value="maintenance">Maintenance</MenuItem>
                                            </TextField>
                                        </Stack>
                                    </Box>
                                </LocalizationProvider>
                            </div>
                        </CardContent>

                        {/* Table */}
                        <div className='overflow-x-auto'>
                            <table className={tableStyles.table}>
                                <thead>
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <th key={header.id}>
                                                    {header.isPlaceholder ? null : (
                                                        <div
                                                            className={classnames({
                                                                'flex items-center': header.column.getIsSorted(),
                                                                'cursor-pointer select-none': header.column.getCanSort()
                                                            })}
                                                            onClick={header.column.getToggleSortingHandler()}
                                                        >
                                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                                            {{
                                                                asc: <i className='tabler-chevron-up text-xl' />,
                                                                desc: <i className='tabler-chevron-down text-xl' />
                                                            }[header.column.getIsSorted()] ?? null}
                                                        </div>
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody>
                                    {table.getFilteredRowModel().rows.length === 0 ? (
                                        <tr>
                                            <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                                                No data available
                                            </td>
                                        </tr>
                                    ) : (
                                        table.getRowModel().rows.map(row => (
                                            <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                                                {row.getVisibleCells().map(cell => (
                                                    <td key={cell.id}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <TablePaginationComponent table={table} />
                    </Card>
                </TabPanel>
            </div>
        </TabContext>
    )
}

export default PaymentReport
