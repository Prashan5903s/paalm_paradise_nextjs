'use client'

import { useState, useEffect, useMemo } from "react"

import { useSession } from "next-auth/react"

import { TabContext, TabList, TabPanel } from "@mui/lab"

import {
    Tab,
    Card,
    MenuItem,
    Button,
    Checkbox,
    CardContent,
    Chip,
    Typography
} from "@mui/material"

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

import TablePaginationComponent from '@components/TablePaginationComponent'

import CustomTextField from "@/@core/components/mui/TextField"

import tableStyles from '@core/styles/table.module.css'

import FormatTime from '@/utils/formatTime';

// Filter function
const fuzzyFilter = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value)

    addMeta({ itemRank })

    return itemRank.passed
}

// Debounced Input
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

const columnHelper = createColumnHelper()

const BillTable = ({ tableData, value, type }) => {

    const [rowSelection, setRowSelection] = useState({})
    const [data, setData] = useState([])
    const [filteredData, setFilteredData] = useState([])
    const [globalFilter, setGlobalFilter] = useState('')

    const [isOpen, setIsOpen] = useState(false)
    const [paidData, setPaidData] = useState()

    const fixedCostMap = useMemo(() => {
        const map = new Map();

        data?.fixed_cost?.forEach(item => {
            map.set(item.apartment_type, Number(item.unit_value || 0));
        });

        return map;
    }, [data?.fixed_cost]);

    useEffect(() => {
        if (tableData) {
            let processedData = tableData;

            if (type === "maintenance") {
                const grouped = {};

                tableData?.userBill?.forEach((row) => {
                    const billId = row?.bill_id?._id;
                    const apartmentId = row?.apartment_id?._id;
                    const key = `${billId}-${apartmentId}`;

                    if (!grouped[key]) {
                        grouped[key] = {
                            ...row,
                            paid_cost: 0,
                            total_cost: 0,
                            status: "Unpaid",
                        };
                    }

                    // total_cost calculation
                    const additionalCost = row?.bill_id?.additional_cost || [];
                    const apartmentTypeRaw = row?.apartment_id?.apartment_type || "";
                    const apartmentType = apartmentTypeRaw.replace(/[^\d]/g, "");
                    const fixedCost = fixedCostMap.get(apartmentType) || 0;

                    const additionalTotal = additionalCost.reduce(
                        (sum, val) => sum + (val.amount || 0),
                        0
                    );

                    grouped[key].total_cost = fixedCost + additionalTotal;

                    // sum paid cost
                    grouped[key].paid_cost += Number(row?.amount) || 0;

                    // status
                    grouped[key].status =
                        grouped[key].paid_cost >= grouped[key].total_cost
                            ? "Paid"
                            : "Unpaid";
                });

                processedData = Object.values(grouped);
            }

            // 🔹 filter logic based on "value"
            let finalData = processedData;
            
            if (type === "maintenance") {
                if (value === true) {
                    finalData = processedData.filter(
                        (row) => row.paid_cost === row.total_cost
                    );
                } else if (value === false) {
                    finalData = processedData.filter(
                        (row) => row.paid_cost !== row.total_cost
                    );
                }
            }

            setData(tableData);
            setFilteredData(finalData);
        }
    }, [tableData, type, value, fixedCostMap]);

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
        ];

        if (type === "utilityBills") {
            baseColumns.splice(
                1,
                0,
                columnHelper.accessor("apartment_no", {
                    header: "Apartment No",
                    cell: ({ row }) => (
                        <Typography className="capitalize" color="text.primary">
                            {row.original.apartment_id.apartment_no}
                        </Typography>
                    ),
                })
            );
        }

        if (type === "common-area-bill" || type === "utilityBills") {
            // Replace column at index 2 with Bill Type
            baseColumns.splice(
                2,
                1,
                columnHelper.accessor("bill_type", {
                    header: "Bill Type",
                    cell: ({ row }) => (
                        <Typography className="capitalize" color="text.primary">
                            {row?.original?.bill_type?.name || ""}
                        </Typography>
                    ),
                })
            );

            // Insert Bill Date at index 3
            baseColumns.splice(
                3,
                0,
                columnHelper.accessor("bill_date", {
                    header: "Bill Date",
                    cell: ({ row }) => (
                        <Typography className="capitalize" color="text.primary">
                            {FormatTime(row.original.bill_date)}
                        </Typography>
                    ),
                })
            );

            // Insert Bill Due Date at index 4
            baseColumns.splice(
                4,
                0,
                columnHelper.accessor("bill_due_date", {
                    header: "Bill Due Date",
                    cell: ({ row }) => (
                        <Typography className="capitalize" color="text.primary">
                            {FormatTime(row.original.bill_due_date)}
                        </Typography>
                    ),
                })
            );

            // Insert Bill Amount at index 5
            baseColumns.splice(
                5,
                0,
                columnHelper.accessor("bill_amount", {
                    header: "Bill Amount",
                    cell: ({ row }) => {
                        const totalPaid =
                            row.original.payments?.reduce(
                                (sum, p) => sum + (p.amount || 0),
                                0
                            ) || 0;

                        return (
                            <Typography className="capitalize" color="text.primary">
                                {row.original.bill_amount}
                            </Typography>
                        );
                    },
                })
            );

            // Insert Paid Amount at index 6
            baseColumns.splice(
                6,
                0,
                columnHelper.accessor("paid_amount", {
                    header: "Paid Amount",
                    cell: ({ row }) => {
                        const totalPaid =
                            row.original.payments?.reduce(
                                (sum, p) => sum + (p.amount || 0),
                                0
                            ) || 0;

                        const remaining = totalPaid;

                        return (
                            <Typography className="capitalize" color="text.primary">
                                {(
                                    <>
                                        {remaining}
                                    </>

                                )}
                            </Typography>
                        );
                    },
                })
            );

            // Status column
            baseColumns.splice(
                9,
                0,
                columnHelper.accessor("status", {
                    header: "Status",
                    cell: ({ row }) => (
                        <Chip
                            label={row.original.status ? "Paid" : "Unpaid"}
                            color={row.original.status ? "success" : "error"}
                            variant="tonal"
                            size="small"
                        />
                    ),
                })
            );
        }

        if (type === "maintenance") {


            baseColumns.splice(
                1,
                0,

                // Apartment No
                columnHelper.accessor('apartment_no', {
                    header: 'Apartment No',
                    cell: ({ row }) => (
                        <Typography className="capitalize" color="text.primary">
                            {row.original?.apartment_id.apartment_no || '-'}
                        </Typography>
                    ),
                }),
            );
            baseColumns.splice(
                2,
                0,
                columnHelper.accessor('user', {
                    header: 'User',
                    cell: ({ row }) => (
                        <Typography className="capitalize" color="text.primary">
                            {row.original?.user_id?.first_name || '-'} {" "} {row.original?.user_id?.last_name || '_'}
                        </Typography>
                    ),
                }),
            );
            baseColumns.splice(
                3,
                0,

                // Total Cost
                // Total Cost
                columnHelper.accessor('total_cost', {
                    header: 'Total cost',
                    cell: ({ row }) => {

                        const leftCost = row?.original?.total_cost || 0;

                        return (
                            <Typography className="capitalize" color="text.primary">
                                {leftCost}
                            </Typography>
                        );
                    },
                }),
            );
            baseColumns.splice(
                4,
                0,
                columnHelper.accessor('Paid cost', {
                    header: 'Paid cost',
                    cell: ({ row }) => {

                        const leftCost = row.original?.paid_cost || 0;

                        return (
                            <Typography className="capitalize" color="text.primary">
                                {leftCost}
                            </Typography>
                        );
                    },
                }),
            );
            baseColumns.splice(
                6,
                0,
                columnHelper.accessor('status', {
                    header: 'Status',
                    cell: ({ row }) => {

                        const leftCost = row?.original?.paid_cost || 0;
                        const finalCost = row?.original?.total_cost || 0;

                        return (
                            <Typography className="capitalize" component="span" color="text.primary">
                                <Chip
                                    label={leftCost == finalCost ? 'Paid' : 'Unpaid'}
                                    color={leftCost == finalCost ? 'success' : 'error'}
                                    variant="tonal"
                                    size="small"
                                />
                            </Typography>
                        );
                    },
                }),
            );
        }

        return baseColumns;
    }, [type, data, value]);

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
            </CardContent>

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

            <TablePaginationComponent table={table} />
        </Card>
    )
}

const TypeMyBill = ({ type }) => {

    const [value, setValue] = useState(false)
    const [data, setData] = useState()

    const handleTabChange = () => {
        setValue(!value)
    }

    const URL = process.env.NEXT_PUBLIC_API_URL;

    const { data: session } = useSession() || {};

    const token = session && session.user && session?.user?.token;

    const fetchBillData = async () => {
        try {
            const response = await fetch(`${URL}/user/my-bill/${type}/${value}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (response.ok) {
                const result = await response.json()

                const value = result?.data

                setData(value)
            }

        } catch (error) {
            throw new Error(error)
        }
    }

    useEffect(() => {
        if (URL && token) {
            fetchBillData()
        }
    }, [URL, token, type, value])

    return (
        <>
            <TabContext value={value}>
                <TabList variant='scrollable' onChange={handleTabChange} className='border-b px-0 pt-0'>
                    <Tab key={1} label='Pending' value={false} />
                    <Tab key={2} label='Paid' value={true} />
                </TabList>

                <div className='pt-0 mt-4'>
                    <TabPanel value={false} className='p-0'>
                        <BillTable type={type} value={value} tableData={data} />
                    </TabPanel>
                    <TabPanel value={true} className='p-0'>
                        <BillTable type={type} value={value} tableData={data} />
                    </TabPanel>
                </div>
            </TabContext>
        </>
    )
}

export default TypeMyBill
