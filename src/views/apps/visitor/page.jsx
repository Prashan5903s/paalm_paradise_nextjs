'use client'

import { useState, useEffect, useMemo } from "react"

import {
    Card,
    MenuItem,
    Box,
    TextField,
    Button,
    Dialog,
    Checkbox,
    CardContent,
    Typography,
    DialogContent,
    DialogTitle,
    DialogActions
} from "@mui/material"

import Grid from '@mui/material/Grid2'

import { QRCodeCanvas } from "qrcode.react";

import utc from "dayjs/plugin/utc";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { TimePicker } from "@mui/x-date-pickers/TimePicker";

import { valibotResolver } from '@hookform/resolvers/valibot'

import {
    object,
    string,
    minLength,
    pipe,
    optional,
} from 'valibot'

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

import { rankItem } from '@tanstack/match-sorter-utils'

import { useForm, Controller } from 'react-hook-form'

import { useSession } from "next-auth/react"

import { toast } from "react-toastify"

import dayjs from "dayjs"

import tableStyles from '@core/styles/table.module.css'

import TablePaginationComponent from '@components/TablePaginationComponent'

import { usePermissionList } from '@/utils/getPermission'

import CustomTextField from "@/@core/components/mui/TextField"

import DialogCloseButton from "@/components/dialogs/DialogCloseButton"

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

// Filter function
const fuzzyFilter = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value)
    
    addMeta({ itemRank })
    
    return itemRank.passed
}

dayjs.extend(utc);


function formatTimeTo12Hour(timeStr) {
    if (!timeStr) return "-";

    const [hours, minutes] = timeStr.split(":").map(Number);
    let h = hours % 12 || 12; // 0 → 12
    let ampm = hours >= 12 ? "PM" : "AM";

    return `${String(h).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${ampm}`;
}


const columnHelper = createColumnHelper()

const VisitorModal = ({
    open,
    setIsOpen,
    fetchVisitors,
    datass,
    setVisitorData,
    createData,
}) => {
    const { data: session } = useSession();
    const token = session?.user?.token;
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    //  Validation schema
    const schema = object({
        visitor_name: pipe(string(), minLength(1, "Visitor name is required")),
        visitor_contact: pipe(string(), minLength(10, "Contact no. is required")),
        checkin_date: pipe(string(), minLength(1, "Check-in date is required")),
        checkin_from_time: pipe(string(), minLength(1, "Check-in from time is required")),
        checkin_to_time: pipe(string(), minLength(1, "Check-in to time is required")),
        no_of_persons: pipe(string(), minLength(1, "No of persons is required")),
        vehicle_number: string(),
        category: pipe(string(), minLength(1, "Category is required")),
        description: string(),
        apartment_id:
            createData && createData.length > 1
                ? pipe(string(), minLength(1, "Apartment is required"))
                : optional(string()),
    });

    //  useForm setup
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: valibotResolver(schema),
        defaultValues: {
            user: "",
            visitor_name: "",
            visitor_contact: "",
            apartment_id: "",
            checkin_date: "",
            checkin_from_time: "",
            checkin_to_time: "",
            no_of_persons: "",
            vehicle_number: "",
            category: "",
            description: "",
        },
    });

    const onClose = () => {
        setVisitorData();
        setIsOpen(false);
        reset(
            {
                user: "",
                visitor_name: "",
                visitor_contact: "",
                apartment_id: "",
                checkin_date: "",
                checkin_from_time: "",
                checkin_to_time: "",
                no_of_persons: "",
                vehicle_number: "",
                category: "",
                description: "",
            }
        );
    };

    //  Reset when datass changes
    useEffect(() => {
        if (datass) {
            reset({
                visitor_name: datass.visitor_name || "",
                apartment_id: datass.apartment_id?._id
                    ? String(datass.apartment_id._id)
                    : "",
                visitor_contact: datass.visitor_contact_no
                    ? String(datass.visitor_contact_no)
                    : "",
                checkin_date: datass.check_in_date || "",
                checkin_from_time: datass.check_in_from_time || "",
                checkin_to_time: datass.check_in_to_time || "",
                no_of_persons: datass.no_person
                    ? String(datass.no_person)
                    : "1",
                vehicle_number: datass.vehicle_no || "",
                category: datass.category || "",
                description: datass.description || "",
            });
        } else {
            reset(
                {
                    user: "",
                    visitor_name: "",
                    visitor_contact: "",
                    apartment_id: "",
                    checkin_date: "",
                    checkin_from_time: "",
                    checkin_to_time: "",
                    no_of_persons: "",
                    vehicle_number: "",
                    category: "",
                    description: "",
                }
            );
        }
    }, [datass, reset]);

    //  Submit handler
    const onSubmit = async (data) => {
        try {
            const response = await fetch(
                datass
                    ? `${API_URL}/user/visitor/update/${datass._id}`
                    : `${API_URL}/user/visitor`,
                {
                    method: datass ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(data),
                }
            );

            if (response.ok) {
                toast.success(
                    `Visitor ${datass ? "updated" : "added"} successfully`,
                    { autoClose: 1000 }
                );
                fetchVisitors();
                onClose();
            } else {
                const errorData = await response.json().catch(() => ({}));
                
                toast.error(errorData?.message || "Failed to add visitor");
            }
        } catch (error) {
            console.error("Submit error:", error);
            toast.error("Something went wrong. Please try again.");
        }
    };

    return (
        <Dialog
            fullWidth
            maxWidth="lg"
            scroll="body"
            open={open}
            sx={{ "& .MuiDialog-paper": { overflow: "visible" } }}
        >
            <DialogCloseButton
                onClick={() => {
                    onClose();
                }}
            >
                <i className="tabler-x" />
            </DialogCloseButton>
            <DialogTitle>Visitor Dialog</DialogTitle>

            {/*  form wrapper */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Grid container spacing={3}>
                        {/* Visitor Name */}
                        <Grid item size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="visitor_name"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Visitor Name *"
                                        fullWidth
                                        error={!!errors.visitor_name}
                                        helperText={errors.visitor_name?.message}
                                    />
                                )}
                            />
                        </Grid>

                        {createData && createData.length > 1 && (
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="apartment_id"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            select
                                            fullWidth
                                            label="Apartment*"
                                            error={!!errors.apartment_id}
                                            helperText={errors.apartment_id?.message}
                                        >
                                            {createData.map((item) => (
                                                <MenuItem key={item._id} value={String(item._id)}>
                                                    {item.apartment_no}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                />
                            </Grid>
                        )}

                        {/* Visitor Contact */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="visitor_contact"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Visitor Contact No. *"
                                        fullWidth
                                        error={!!errors.visitor_contact}
                                        helperText={errors.visitor_contact?.message}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Check-in Date */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="checkin_date"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        type="date"
                                        label="Check-in Date *"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        error={!!errors.checkin_date}
                                        helperText={errors.checkin_date?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Typography>
                                <strong>Check In Time*</strong>
                            </Typography>
                        </Grid>

                        {/* Check-in Time */}
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="checkin_from_time"
                                    control={control}
                                    render={({ field }) => (
                                        <TimePicker
                                            label="From*"
                                            value={
                                                field.value ? dayjs(field.value, "HH:mm") : null
                                            }
                                            onChange={(newValue) =>
                                                field.onChange(
                                                    newValue ? newValue.format("HH:mm") : ""
                                                )
                                            }
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    error: !!errors.checkin_from_time,
                                                    helperText: errors.checkin_from_time?.message,
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                        </LocalizationProvider>

                        {/* Check-out Time */}
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="checkin_to_time"
                                    control={control}
                                    render={({ field }) => (
                                        <TimePicker
                                            label="To*"
                                            value={
                                                field.value ? dayjs(field.value, "HH:mm") : null
                                            }
                                            onChange={(newValue) =>
                                                field.onChange(
                                                    newValue ? newValue.format("HH:mm") : ""
                                                )
                                            }
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    error: !!errors.checkin_to_time,
                                                    helperText: errors.checkin_to_time?.message,
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                        </LocalizationProvider>

                        {/* No of Persons */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="no_of_persons"
                                control={control}
                                rules={{
                                    required: "No of Persons is required",
                                    min: {
                                        value: 1,
                                        message: "Only positive numbers are allowed"
                                    }
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        type="number"
                                        label="No of Persons *"
                                        fullWidth
                                        error={!!errors.no_of_persons}
                                        helperText={errors.no_of_persons?.message}
                                        inputProps={{
                                            min: 1  // Prevent user from entering numbers < 1
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Vehicle Number */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="vehicle_number"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Vehicle Number" fullWidth />
                                )}
                            />
                        </Grid>

                        {/* Category */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="category"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label="Category *"
                                        error={!!errors.category}
                                        helperText={errors.category?.message}
                                    >
                                        <MenuItem value="1">Allow kids</MenuItem>
                                        <MenuItem value="2">Courier</MenuItem>
                                        <MenuItem value="3">Driver</MenuItem>
                                        <MenuItem value="4">Friend/relatives</MenuItem>
                                        <MenuItem value="5">Helper/maid</MenuItem>
                                        <MenuItem value="6">Others</MenuItem>
                                        <MenuItem value="7">Technician</MenuItem>
                                    </TextField>
                                )}
                            />
                        </Grid>

                        {/* Description */}
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        multiline
                                        minRows={3}
                                        label="Description"
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                {/* Buttons */}
                <DialogActions sx={{ justifyContent: "center", gap: 2 }}>
                    <Button variant="contained" type="submit">
                        Submit
                    </Button>
                    <Button variant="outlined" color="error" onClick={onClose}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

const OTPCodeModal = ({ open, setOpenDialog, code, id, data }) => {

    const onClose = () => {
        setOpenDialog(false)
    }

    return (
        <Dialog
            fullWidth
            maxWidth="xs"
            scroll="body"
            open={open}
            onClose={onClose}
            sx={{
                "& .MuiDialog-paper": {
                    overflow: "visible",
                    borderRadius: 4,
                    boxShadow: "0px 6px 20px rgba(0,0,0,0.15)",
                },
            }}
        >
            {/* Close Button */}
            <DialogCloseButton onClick={onClose}>
                <i className="tabler-x" />
            </DialogCloseButton>

            {/* Title */}
            <DialogTitle
                sx={{
                    textAlign: "center",
                    fontWeight: 600,
                    background: "linear-gradient(90deg, #7e57c2, #26a69a)", // softer gradient
                    color: "white",
                    py: 2,
                    fontSize: "1.2rem",
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
                }}
            >
                Visitor
            </DialogTitle>

            <DialogContent sx={{ textAlign: "center", mt: 2, px: 3 }}>
                {/* Inviter Info */}
                <Box
                    sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        mb: 2,
                        mt: 4
                    }}
                >
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "15px" }}>
                        <strong>{data?.user_id?.first_name} {data?.user_id?.last_name}</strong>  has invited you to <strong>aparment {data?.apartment_id?.apartment_no}</strong>, <strong>{data?.apartment_id?.tower_id?.name}</strong>, <strong>{data?.apartment_id?.floor_id?.floor_name}</strong>
                    </Typography>
                </Box>

                <Typography color="text.secondary" gutterBottom>
                    Show this QR code or OTP to the guard at the gate
                </Typography>

                {/* QR Code */}
                <Box sx={{ my: 3, display: "flex", justifyContent: "center" }}>
                    <Box
                        sx={{
                            p: 2,
                            backgroundColor: "#fff",
                            borderRadius: 2,
                            boxShadow: "0px 3px 10px rgba(0,0,0,0.15)",
                        }}
                    >
                        <QRCodeCanvas
                            value={String(code)}
                            size={120}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="H"
                            includeMargin={true}
                        />
                    </Box>
                </Box>

                <Typography variant="body2" fontWeight={600} sx={{ my: 1 }}>
                    — OR —
                </Typography>

                {/* OTP Box */}
                <Box
                    sx={{
                        background: "linear-gradient(135deg, #ff9800, #ff7043)",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "2rem",
                        borderRadius: 2,
                        display: "inline-block",
                        px: 4,
                        py: 1,
                        my: 2,
                        letterSpacing: 2,
                        boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
                    }}
                >
                    {code}
                </Box>

                <Typography
                    variant="body2"
                    sx={{ fontStyle: "italic", mt: 4, mb: 4, fontWeight: 500 }}
                    color="text.primary"
                >
                    <strong>{data?.check_in_date}</strong>, <strong>{formatTimeTo12Hour(data?.check_in_from_time)}</strong> to <strong>{formatTimeTo12Hour(data?.check_in_to_time)}</strong>
                </Typography>

                <Typography variant="body2" color="text.secondary">
                    Paalm Paradise, Deoria Road, near zoo, Gorakhpur, UP, 273004
                </Typography>

                {/* Logo */}
                <Box sx={{ my: 3 }}>
                    <img
                        src="/images/company_logo.png"
                        alt="Logo"
                        style={{
                            width: 100,
                            margin: "0 auto",
                            display: "block",
                            filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.2))",
                        }}
                    />
                </Box>
            </DialogContent>

            {/* Footer */}
            <DialogActions sx={{ justifyContent: "center", pb: 2, mb: 8 }}>
                <Typography variant="body1" fontWeight={600} color="text.secondary">
                    <strong>Paalm Paradise</strong>
                </Typography>
            </DialogActions>
        </Dialog >

    );

}

const VisitorTable = () => {

    const { data: session } = useSession()
    const token = session?.user?.token
    const API_URL = process.env.NEXT_PUBLIC_API_URL

    const [rowSelection, setRowSelection] = useState({})
    const [data, setData] = useState([])
    const [openDialog, setOpenDialog] = useState(false)

    const [isOpen, setIsOpen] = useState(false)
    const [visitorData, setVisitorData] = useState(null)
    const [code, setCode] = useState('')
    const [visitorId, setVisitorId] = useState('')
    const [createData, setCreateData] = useState(null)
    const [category, setCategory] = useState('')
    const [nameNo, setNameNo] = useState('')
    const [globalFilter, setGlobalFilter] = useState('')

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

    // Fetch visitor list
    const fetchComplain = async () => {
        try {
            const response = await fetch(`${API_URL}/user/visitor`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` }
            })

            const result = await response.json()

            if (response.ok) setData(result?.data || [])
        } catch (error) {
            console.error(error)
        }
    }

    // Fetch create data
    const fetchCreateData = async () => {
        try {
            const response = await fetch(`${API_URL}/user/visitor/create/data`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` }
            })

            const result = await response.json()

            if (response.ok) setCreateData(result?.data || null)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        if (API_URL && token) {
            fetchComplain()
            fetchCreateData()
        }
    
    }, [API_URL, token])

    const allowGateIn = async (id) => {
        try {
            const response = await fetch(`${API_URL}/user/visitor/allow/gateIn/${id}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` }
            })
            
            if (response.ok) {
                toast.success('Visitor allowed successfully', { autoClose: 1000 })
                fetchComplain()
            }
        } catch (error) {
            console.error(error)
        }
    }

    // Custom filtering
    const filteredData = useMemo(() => {
        return data.filter((row) => {
            const otpMatch =
                row?.otp?.toString().includes(globalFilter) || globalFilter === ''
            
                const nameNoMatch =
                row?.visitor_name?.toLowerCase().includes(nameNo.toLowerCase()) ||
                row?.visitor_contact_no?.toString()?.includes(nameNo) ||
                nameNo === ''

                const categoryMap = {
                '1': 'Allow kids',
                '2': 'Courier',
                '3': 'Driver',
                '4': 'Friend/relatives',
                '5': 'Helper/maid',
                '6': 'Others',
                '7': 'Technician'
            }

            const categoryName = categoryMap[row.category] || ''
            const categoryMatch = !category || categoryName === category
          
            return otpMatch && nameNoMatch && categoryMatch
        })
    }, [data, globalFilter, nameNo, category])

    const columns = useMemo(() => {
        const dataMap = {
            '1': 'Allow kids',
            '2': 'Courier',
            '3': 'Driver',
            '4': 'Friend/relatives',
            '5': 'Helper/maid',
            '6': 'Others',
            '7': 'Technician'
        }

        return [
            {
                id: 'select',
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
                )
            },
            columnHelper.display({
                id: 'sr_no',
                header: 'Sr No',
                cell: ({ row }) => <Typography>{row.index + 1}</Typography>
            }),
            columnHelper.accessor('visitor_name', {
                header: 'Visitor Name',
                cell: ({ row }) => <Typography>{row.original.visitor_name}</Typography>
            }),
            columnHelper.accessor('visitor_no', {
                header: 'Visitor No',
                cell: ({ row }) => (
                    <Typography>{row.original.visitor_contact_no || '-'}</Typography>
                )
            }),
            columnHelper.accessor('category', {
                header: 'Category',
                cell: ({ row }) => (
                    <Typography>{dataMap[row.original.category] || '-'}</Typography>
                )
            }),
            columnHelper.accessor('otp', {
                header: 'OTP',
                cell: ({ row }) => (
                    <Typography>
                        <i
                            className="tabler-eye"
                            style={{ cursor: 'pointer', transition: '0.2s' }}
                            onClick={() => {
                                setOpenDialog(true)
                                setVisitorId(row.original._id || '')
                                setVisitorData(row.original || null)
                                setCode(row.original.otp || '')
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        ></i>
                    </Typography>
                )
            }),
            columnHelper.accessor('check_in_date', {
                header: 'Check in date & time',
                cell: ({ row }) => {
                    const times1 = row.original.check_in_from_time
                    const times2 = row.original.check_in_to_time
                    const formatTime1 = formatTimeTo12Hour(times1)
                    const formatTime2 = formatTimeTo12Hour(times2)

                    return (
                        <Typography>
                            {row.original.check_in_date || '-'} <br />
                            {formatTime1} - {formatTime2}
                        </Typography>
                    )
                }
            }),
            columnHelper.accessor('gate_in_allow', {
                header: 'Gate in allow',
                cell: ({ row }) =>
                    row.original.status ? (
                        'Allowed'
                    ) : (
                        <Button variant="outlined" onClick={() => allowGateIn(row.original._id)}>
                            Allow
                        </Button>
                    )
            }),
            columnHelper.accessor('no_person', {
                header: 'No person',
                cell: ({ row }) => <Typography>{row.original.no_person || '-'}</Typography>
            }),
            columnHelper.accessor('description', {
                header: 'Description',
                cell: ({ row }) => <Typography>{row.original.description || '-'}</Typography>
            }),
            columnHelper.accessor('created_at', {
                header: 'Created At',
                cell: ({ row }) => <Typography>{row.original.created_at || '-'}</Typography>
            }),
            columnHelper.display({
                id: 'action',
                header: 'Action',
                cell: ({ row }) =>
                    row.original.status
                        ? null
                        : (
                            <i
                                className="tabler-edit"
                                style={{ cursor: 'pointer', transition: '0.2s' }}
                                onClick={() => {
                                    setVisitorData(row.original || null)
                                    setIsOpen(true)
                                }}
                            ></i>
                        )
            })
        ]
    }, [])

    const table = useReactTable({
        data: filteredData,
        columns,
        state: { rowSelection },
        initialState: { pagination: { pageSize: 10 } },
        enableRowSelection: true,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel()
    })

    return (
        <Card>
            <CardContent className="flex justify-between flex-col gap-4 items-start sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                    <Typography>Show</Typography>
                    <CustomTextField
                        select
                        value={table.getState().pagination.pageSize || 10}
                        onChange={(e) => table.setPageSize(Number(e.target.value))}
                    >
                        <MenuItem value="" disabled></MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                    </CustomTextField>
                </div>
                <div className="flex gap-2">
                    {/* <div className="flex gap-4 flex-col !items-start max-sm:is-full sm:flex-row sm:items-center"> */}
                    <DebouncedInput
                        value={globalFilter || ''}
                        placeholder="OTP"
                        onChange={(value) => setGlobalFilter(String(value))}
                    />
                    <DebouncedInput
                        value={nameNo || ''}
                        placeholder="Visitor name/contact no"
                        onChange={(value) => setNameNo(String(value))}
                    />
                    <CustomTextField
                        className="w-full sm:w-[250px]"
                        select
                        value={category || ''}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <MenuItem value="">Select Category</MenuItem>
                        <MenuItem value="Allow kids">Allow kids</MenuItem>
                        <MenuItem value="Courier">Courier</MenuItem>
                        <MenuItem value="Driver">Driver</MenuItem>
                        <MenuItem value="Friend/relatives">Friend/relatives</MenuItem>
                        <MenuItem value="Helper/maid">Helper/maid</MenuItem>
                        <MenuItem value="Others">Others</MenuItem>
                        <MenuItem value="Technician">Technician</MenuItem>
                    </CustomTextField>
                    {/* </div> */}

                    {permissions && permissions?.['hasVisitorAddPermission'] && (
                        <Button
                            variant="contained"
                            startIcon={<i className="tabler-plus" />}
                            onClick={() => {
                                setVisitorData(null)
                                setIsOpen(true)
                            }}
                        >
                            Add Visitor
                        </Button>
                    )}
                </div>
            </CardContent>

            <div className="overflow-x-auto">
                <table className={tableStyles.table}>
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id}>
                                        {header.isPlaceholder ? null : (
                                            <div
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </div>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={table.getVisibleFlatColumns().length} className="text-center">
                                    No data available
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
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

            <VisitorModal
                open={isOpen}
                setIsOpen={setIsOpen}
                fetchVisitors={fetchComplain}
                datass={visitorData}
                setVisitorData={setVisitorData}
                createData={createData}
            />
            <OTPCodeModal
                open={openDialog}
                setOpenDialog={setOpenDialog}
                code={code}
                id={visitorId}
                data={visitorData}
            />
        </Card>
    )
}


export default VisitorTable
