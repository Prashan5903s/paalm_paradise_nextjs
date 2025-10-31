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

import FormatTime from '@/utils/formatTime';

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
      createData && createData?.apartment?.length > 1
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
        category: datass.category._id || "",
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
      <DialogTitle>{!datass ? "Add New Visitor" : "Edit Visitor"}</DialogTitle>

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

            {createData && createData?.apartment?.length > 1 && (
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
                      {createData?.apartment?.map((item) => (
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
                    label="Visit in date *"
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
                <strong>Visit In Time*</strong>
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
                    {createData && createData?.['visitorType']?.map((item, index) => (
                      <MenuItem key={index} value={item._id}>{item.name}</MenuItem>
                    ))}
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

  // ⬇️ 2-step modal logic
  const [confirmDialog, setConfirmDialog] = useState(false)
  const [submitDialog, setSubmitDialog] = useState(false)
  const [selectedAction, setSelectedAction] = useState(null)
  const [selectedVisitorId, setSelectedVisitorId] = useState('')

  // Permissions
  const getPermissions = usePermissionList()
  const [permissions, setPermissions] = useState({})

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const result = await getPermissions()

        setPermissions(result)
      } catch (error) {
        console.error('Error fetching permissions:', error)
      }
    }

    if (getPermissions) fetchPermissions()
  }, [getPermissions])

  // Fetch Visitors
  const fetchVisitors = async () => {
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

  // Fetch Create Data
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
      fetchVisitors()
      fetchCreateData()
    }
  }, [API_URL, token])

  // ✅ Final API call for Accept/Reject
  const handleFinalSubmit = async () => {
    try {
      const allow = selectedAction === 'accept'

      const response = await fetch(
        `${API_URL}/user/visitor/allow/gateIn/${allow}/${selectedVisitorId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      )

      if (response.ok) {
        toast.success(`Visitor ${allow ? 'accepted' : 'rejected'} successfully`, {
          autoClose: 1000
        })

        fetchVisitors()
      } else {
        toast.error('Action failed, please try again')
      }
    } catch (error) {
      console.error(error)
      toast.error('Something went wrong')
    } finally {
      setSubmitDialog(false)
      setSelectedAction(null)
      setSelectedVisitorId('')
    }
  }

  // Filtering
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const otpMatch =
        row?.otp?.toString().includes(globalFilter) || globalFilter === ''

      const nameNoMatch =
        row?.visitor_name?.toLowerCase().includes(nameNo.toLowerCase()) ||
        row?.visitor_contact_no?.toString()?.includes(nameNo) ||
        nameNo === ''

      const categoryName = row?.category?.name || ''
      const categoryMatch = !category || categoryName === category

      return otpMatch && nameNoMatch && categoryMatch
    })
  }, [data, globalFilter, nameNo, category])

  // Table Columns
  const columns = useMemo(
    () => [
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
        cell: (info) => <Typography>{info.getValue()}</Typography>
      }),
      columnHelper.accessor('visitor_contact_no', {
        header: 'Visitor No',
        cell: (info) => <Typography>{info.getValue() || '-'}</Typography>
      }),
      columnHelper.accessor('category.name', {
        header: 'Category',
        cell: (info) => <Typography>{info.getValue() || '-'}</Typography>
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
                setVisitorId(row.original._id)
                setVisitorData(row.original)
                setCode(row.original.otp || '')
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            ></i>
          </Typography>
        )
      }),
      columnHelper.accessor('check_in_date', {
        header: 'Visit in date & time',
        cell: ({ row }) => {
          const time1 = formatTimeTo12Hour(row.original.check_in_from_time)
          const time2 = formatTimeTo12Hour(row.original.check_in_to_time)

          return (
            <Typography>
              {row.original.check_in_date || '-'} <br />
              {time1} - {time2}
            </Typography>
          )
        }
      }),
      columnHelper.accessor('gate_in_allow', {
        header: 'Gate in allow',
        cell: ({ row }) => {
          const values = {
            "1": "Invited",
            "2": "Rejected",
            "3": "Expired",
            "4": "Accepted",
          }

          return row.original.visitor_status === "1" ? (
            <Button
              variant="outlined"
              onClick={() => {
                setSelectedVisitorId(row.original._id)
                setConfirmDialog(true)
              }}
            >
              Allow
            </Button>
          ) : (
            values[row.original.visitor_status] || "-"
          )
        },
      }),
      columnHelper.accessor('no_person', {
        header: 'No. Person',
        cell: (info) => <Typography>{info.getValue() || '-'}</Typography>
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: (info) => <Typography>{info.getValue() || '-'}</Typography>
      }),
      columnHelper.accessor('created_at', {
        header: 'Created At',
        cell: ({ row }) => (
          <Typography>{FormatTime(row.original.created_at) || '-'}</Typography>
        )
      }),
      columnHelper.display({
        id: 'action',
        header: 'Action',
        cell: ({ row }) =>
          row.original.status ? null : (
            <i
              className="tabler-edit"
              style={{ cursor: 'pointer', transition: '0.2s' }}
              onClick={() => {
                setVisitorData(row.original)
                setIsOpen(true)
              }}
            ></i>
          )
      })
    ],
    []
  )

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
      <CardContent className="flex justify-between flex-col gap-4 sm:flex-row sm:items-center">
        {/* Filters */}
        <div className="flex items-center gap-2">
          <Typography>Show</Typography>
          <CustomTextField
            select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </CustomTextField>
        </div>

        <div className="flex flex-wrap gap-2">
          <DebouncedInput
            value={globalFilter}
            placeholder="OTP"
            onChange={(value) => setGlobalFilter(String(value))}
          />
          <DebouncedInput
            value={nameNo}
            placeholder="Visitor name/contact no"
            onChange={(value) => setNameNo(String(value))}
          />
          <CustomTextField
            select
            className="w-[250px]"
            value={category}
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

          {permissions?.['hasVisitorAddPermission'] && (
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={table.getVisibleFlatColumns().length}
                  className="text-center"
                >
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

      {/* Visitor Add/Edit Modal */}
      <VisitorModal
        open={isOpen}
        setIsOpen={setIsOpen}
        fetchVisitors={fetchVisitors}
        datass={visitorData}
        setVisitorData={setVisitorData}
        createData={createData}
      />

      {/* OTP Modal */}
      <OTPCodeModal
        open={openDialog}
        setOpenDialog={setOpenDialog}
        code={code}
        id={visitorId}
        data={visitorData}
      />

      {/* Step 1: Accept/Reject */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Allow Visitor</DialogTitle>
        <DialogContent>
          <Typography>Do you want to accept or reject this visitor?</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setSelectedAction('accept')
              setConfirmDialog(false)
              setSubmitDialog(true)
            }}
          >
            Accept
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              setSelectedAction('reject')
              setConfirmDialog(false)
              setSubmitDialog(true)
            }}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Step 2: Confirm Submit */}
      <Dialog open={submitDialog} onClose={() => setSubmitDialog(false)}>
        <DialogTitle>Confirm Submission</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to{' '}
            {selectedAction === 'accept' ? 'accept' : 'reject'} this visitor?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button onClick={() => setSubmitDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color={selectedAction === 'accept' ? 'success' : 'error'}
            onClick={handleFinalSubmit}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}


export default VisitorTable
