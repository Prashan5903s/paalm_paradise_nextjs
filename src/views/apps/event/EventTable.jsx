'use client'

// React Imports
import { useState, useMemo, useEffect } from 'react'

import {
  Button,
  CardContent,
  Card,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Divider,
  Chip,
  MenuItem
} from '@mui/material'

import Grid from '@mui/material/Grid2'

import { useForm, Controller } from 'react-hook-form'

import classnames from 'classnames'

import { rankItem } from '@tanstack/match-sorter-utils'

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

import {
  object,
  string,
  minLength,
  pipe,
  optional,
} from 'valibot'

import { valibotResolver } from '@hookform/resolvers/valibot'

import { useSession } from 'next-auth/react'

import { toast } from 'react-toastify'

import OptionMenu from '@core/components/option-menu';

import CustomTextField from '@core/components/mui/TextField'

import TablePaginationComponent from '@components/TablePaginationComponent'

import tableStyles from '@core/styles/table.module.css'

import EventDialog from '@/components/dialogs/event-dialog/page'

import { usePermissionList } from '@/utils/getPermission'

import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

import Logo from '@components/layout/shared/Logo'

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

const EventTable = ({ tableData, fetchZoneData }) => {

  const [role, setRole] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedZone, setSelectedZone] = useState(null)

  const getPermissions = usePermissionList();
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const result = await getPermissions();

        setPermissions(result);
      } catch (error) {
        console.error('Error fetching permissions:', error);
      }
    };

    if (getPermissions) {
      fetchPermissions();
    }
  }, [getPermissions]); // Include in dependency array

  useEffect(() => {
    if (tableData) {
      setData(tableData)
      setFilteredData(tableData)
    }
  }, [tableData])

  // Role filter effect
  useEffect(() => {
    const filtered = data.filter(user => {
      if (role && user.role !== role) return false

      return true
    })

    setFilteredData(filtered)
  }, [role, data])

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

    baseColumns.splice(
      2,
      0,
      columnHelper.accessor("event_name", {
        header: "Event name",
        cell: ({ row }) => (
          <Typography className="capitalize" color="text.primary">
            {row.original.event_name}
          </Typography>
        ),
      })
    );
    baseColumns.splice(
      3,
      0,
      columnHelper.accessor("venue", {
        header: "venue",
        cell: ({ row }) => (
          <Typography className="capitalize" color="text.primary">
            {row.original.venue}
          </Typography>
        ),
      })
    );
    baseColumns.splice(
      4,
      0,
      columnHelper.accessor("start_on_date", {
        header: "Start On Date",
        cell: ({ row }) => (
          <Typography className="capitalize" color="text.primary">
            {row.original.start_on_date}
          </Typography>
        ),
      })
    );
    baseColumns.splice(
      5,
      0,
      columnHelper.accessor("start_on_time", {
        header: "start on time",
        cell: ({ row }) => {
          return (
            <Typography className="capitalize" color="text.primary">
              {row.original.start_on_time}
            </Typography>
          );
        },
      })
    );

    baseColumns.splice(
      6,
      0,
      columnHelper.accessor("end_on_date", {
        header: "End On Date",
        cell: ({ row }) => (
          <Typography className="capitalize" color="text.primary">
            {row.original.end_on_date}
          </Typography>
        ),
      })
    );
    baseColumns.splice(
      7,
      0,
      columnHelper.accessor("end_on_time", {
        header: "end on time",
        cell: ({ row }) => {
          return (
            <Typography className="capitalize" color="text.primary">
              {row.original.end_on_time}
            </Typography>
          );
        },
      })
    );

    baseColumns.splice(
      8,
      0,
      columnHelper.accessor("Status", {
        header: "status",
        cell: ({ row }) => {

          const typeStatus = {
            "1": "Pending",
            "2": "Completed",
            "3": "Cancelled"
          }
          
          return (
            <Typography className="capitalize" color="text.primary">
              {typeStatus?.[row.original.status]}
            </Typography>
          );
        },
      })
    );

    baseColumns.splice(
      9,
      0,
      columnHelper.accessor("action", {
        header: "Action",
        cell: ({ row }) => (
          <div className="flex items-center">
            <OptionMenu
              iconButtonProps={{ size: "medium" }}
              iconClassName="text-textSecondary"
              options={[

                ...(permissions?.hasBillingEditPermission
                  ? [
                    {
                      text: "Edit Event",
                      icon: "tabler-edit",
                      menuItemProps: {
                        className:
                          "flex items-center gap-2 text-textSecondary",
                        onClick: () => {
                          setSelectedZone(row.original);
                          setOpenDialog(true);
                        },
                      },
                    },
                  ]
                  : []),
              ]}
            />
          </div>
        ),
        enableSorting: false,
      })
    );

    return baseColumns;
  }, [permissions]);

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
        <div className='flex gap-4 flex-col !items-start max-sm:is-full sm:flex-row sm:items-center'>
          <DebouncedInput
            value={globalFilter ?? ''}
            className='max-sm:is-full min-is-[250px]'
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search Bill'
          />
          {permissions && permissions?.['hasBillingAddPermission'] && (
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                setOpenDialog(true)
                setSelectedZone()
              }}
              className='max-sm:is-full '

            >
              Add Event
            </Button>
          )}
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

      {/* Role Dialog */}
      {openDialog && (
        <EventDialog
          open={openDialog}
          setOpen={setOpenDialog}
          selectedZone={selectedZone}
          fetchZoneData={fetchZoneData}
          tableData={tableData}
          type={""}
        />
      )}
    </Card>
  )
}


export default EventTable
