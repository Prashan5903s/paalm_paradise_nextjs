'use client'

// React Imports
import { useEffect, useState } from 'react'

// Components
import { useSession } from 'next-auth/react'

// MUI Imports
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    MenuItem,
    Skeleton,
    Checkbox,
    FormGroup,
    Radio,
    Typography,
    RadioGroup,
    FormControlLabel
} from '@mui/material'

import Grid from '@mui/material/Grid2'

// Hook Form + Validation
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, minLength, pipe, optional, number, array, maxLength, minValue, description } from 'valibot'

import { toast } from 'react-toastify'

import CustomTextField from '@core/components/mui/TextField'

import DialogCloseButton from '../DialogCloseButton'

const EventDialog = ({ open, setOpen, selectedZone, fetchZoneData }) => {
    const { data: session } = useSession()
    const token = session?.user?.token
    const API_URL = process.env.NEXT_PUBLIC_API_URL

    // ✅ Validation Schema
    const schema = object({
        event_name: pipe(string(), minLength(1, 'Event name is required')),
        venue: pipe(string(), minLength(1, 'Venue is required')),
        description: pipe(string(), minLength(1, 'Description is required')),
        start_on_date: pipe(string(), minLength(1, 'Start date is required')),
        start_on_time: pipe(string(), minLength(1, 'Start time is required')),
        end_on_date: pipe(string(), minLength(1, 'End date is required')),
        end_on_time: pipe(string(), minLength(1, 'End time is required')),
        status: pipe(string(), minLength(1, 'Status is required')),
        role_or_user: pipe(string(), minLength(1, 'Please select Role or User')),
        role_id: array(string(), minLength(1, 'Please select Role or User'), [
            maxLength(255)
        ]),
        user_id: array(string(), minLength(1, 'Please select Role or User'), [
            maxLength(255)
        ])
    })

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        setError,
        clearErrors,
        formState: { errors }
    } = useForm({
        resolver: valibotResolver(schema),
        defaultValues: {
            event_name: '',
            venue: '',
            description: '',
            start_on_date: '',
            start_on_time: '',
            end_on_date: '',
            end_on_time: '',
            status: '',
            role_or_user: 'user',
            role_id: [],
            user_id: []
        }
    })

    const [loading, setLoading] = useState(false)
    const [roleUser, setRoleUser] = useState('user')
    const [createData, setCreateData] = useState()

    // ✅ Populate form on edit
    useEffect(() => {
        if (open && selectedZone && createData) {
            setRoleUser(selectedZone?.role_id?.length ? "role" : "user");

            reset({
                event_name: selectedZone?.event_name || "",
                venue: selectedZone?.venue || "",
                description: selectedZone?.description || "",
                start_on_date: selectedZone?.start_on_date || "",
                start_on_time: selectedZone?.start_on_time || "",
                end_on_date: selectedZone?.end_on_date || "",
                end_on_time: selectedZone?.end_on_time || "",
                status: selectedZone?.status || "",
                role_or_user: selectedZone?.role_id?.length ? "role" : "user",
                role_id: selectedZone?.role_id || [],
                user_id: selectedZone?.user_id?.map(u => u._id || u) || []
            });
        }
    }, [open, selectedZone, createData, reset]);

    const handleClose = () => {
        reset()
        setOpen(false)
    }

    // ✅ Fetch role/user data
    useEffect(() => {
        let ignore = false
        
        const fetchCreateData = async () => {
            try {
                const response = await fetch(`${API_URL}/company/event/create`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                
                const result = await response.json()
                
                if (response.ok && !ignore) {
                    setCreateData(result?.data)
                }
            } catch (err) {
                console.error(err)
            }
        }
        
        if (API_URL && token) fetchCreateData()
        
            return () => {
            ignore = true
        }
    }, [API_URL, token])

    // ✅ Submit Form
    const submitData = async formData => {
        setLoading(true)
        
        try {
            if (formData.role_or_user === 'role') {
                if (!formData.role_id || formData.role_id.length === 0) {
                    setError('role_id', {
                        type: 'manual',
                        message: 'At least one role is required'
                    })
                    setLoading(false)
                    
                    return
                } else {
                    clearErrors('role_id')
                }
            }

            if (formData.role_or_user === 'user') {
                if (!formData.user_id || formData.user_id.length === 0) {
                    setError('user_id', {
                        type: 'manual',
                        message: 'At least one user is required'
                    })
                    setLoading(false)
                    
                    return
                } else {
                    clearErrors('user_id')
                }
            }

            const url = selectedZone
                ? `${API_URL}/company/event/update/${selectedZone._id}`
                : `${API_URL}/company/event`

            const response = await fetch(url, {
                method: selectedZone ? 'PUT' : 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()
            
            if (response.ok) {
                await fetchZoneData()
                toast.success(
                    `Event ${selectedZone ? 'updated' : 'added'} successfully!`,
                    { autoClose: 700 }
                )
                handleClose()
            } else {
                toast.error(data?.message || 'Something went wrong')
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    // ✅ Keep role_id / user_id clean based on toggle
    useEffect(() => {
        if (roleUser === 'user') {
            setValue('role_id', [])
        } else {
            setValue('user_id', [])
        }
    }, [roleUser, setValue])

    if (!createData) {
        return (
            <Dialog fullWidth maxWidth="md" open={open}>
                <DialogCloseButton onClick={handleClose}>
                    <i className="tabler-x" />
                </DialogCloseButton>
                <DialogTitle>{selectedZone ? 'Edit Event' : 'Add Event'}</DialogTitle>
                <DialogContent>
                    <Skeleton variant="rectangular" height={26} />
                    <Skeleton variant="rectangular" height={26} />
                    <Skeleton variant="rectangular" height={26} />
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog
            fullWidth
            maxWidth="md"
            open={open}
            scroll="body"
            sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
        >
            <DialogCloseButton onClick={handleClose}>
                <i className="tabler-x" />
            </DialogCloseButton>
            <DialogTitle
                variant="h4"
                className="text-center sm:pbs-16 sm:pbe-6 sm:pli-16"
            >
                {selectedZone ? 'Edit Event' : 'Add Event'}
            </DialogTitle>

            <form onSubmit={handleSubmit(submitData)} noValidate>
                <DialogContent>
                    <Grid container spacing={3}>
                        {/* Event Name */}
                        <Grid item size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="event_name"
                                control={control}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        label="Event Name"
                                        fullWidth
                                        required
                                        error={!!errors?.event_name}
                                        helperText={errors?.event_name?.message}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Venue */}
                        <Grid item size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="venue"
                                control={control}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        label="Venue"
                                        fullWidth
                                        required
                                        error={!!errors?.venue}
                                        helperText={errors?.venue?.message}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Description */}
                        <Grid item size={{ xs: 12 }}>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        label="Description"
                                        multiline
                                        rows={3}
                                        fullWidth
                                        required
                                        error={!!errors?.description}
                                        helperText={errors?.description?.message}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Dates + Times */}
                        <Grid item size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="start_on_date"
                                control={control}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        type="date"
                                        label="Starts On Date"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        required
                                        error={!!errors?.start_on_date}
                                        helperText={errors?.start_on_date?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="start_on_time"
                                control={control}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        type="time"
                                        label="Starts On Time"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        required
                                        error={!!errors?.start_on_time}
                                        helperText={errors?.start_on_time?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="end_on_date"
                                control={control}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        type="date"
                                        label="Ends On Date"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        required
                                        error={!!errors?.end_on_date}
                                        helperText={errors?.end_on_date?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="end_on_time"
                                control={control}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        type="time"
                                        label="Ends On Time"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        required
                                        error={!!errors?.end_on_time}
                                        helperText={errors?.end_on_time?.message}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Status */}
                        <Grid item size={{ xs: 12 }}>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        select
                                        fullWidth
                                        label="Status"
                                        required
                                        error={!!errors?.status}
                                        helperText={errors?.status?.message}
                                    >
                                        <MenuItem value="">Select Status</MenuItem>
                                        <MenuItem value="1">Pending</MenuItem>
                                        <MenuItem value="2">Completed</MenuItem>
                                        <MenuItem value="3">Cancelled</MenuItem>
                                    </CustomTextField>
                                )}
                            />
                        </Grid>

                        {/* Role/User Selection */}
                        <Grid item size={{ xs: 12 }}>
                            <Typography variant="subtitle1">Send To</Typography>
                            <Controller
                                name="role_or_user"
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup
                                        row
                                        {...field}
                                        onChange={e => {
                                            field.onChange(e)
                                            setRoleUser(e.target.value)
                                        }}
                                    >
                                        <FormControlLabel
                                            value="role"
                                            control={<Radio />}
                                            label="Role"
                                        />
                                        <FormControlLabel
                                            value="user"
                                            control={<Radio />}
                                            label="User"
                                        />
                                    </RadioGroup>
                                )}
                            />
                        </Grid>

                        {/* Roles */}
                        {roleUser === 'role' && (
                            <Grid item size={{ xs: 12 }}>
                                <label className="font-medium block mb-2">Role *</label>
                                <Controller
                                    name="role_id"
                                    control={control}
                                    render={({ field }) => (
                                        <>
                                            <FormGroup row>
                                                {createData.role.map(role => (
                                                    <FormControlLabel
                                                        key={role._id}
                                                        control={
                                                            <Checkbox
                                                                checked={(() => {
                                                                    return field.value?.includes(role._id);
                                                                })()}
                                                                onChange={e => {
                                                                    let newValue = [...(field.value || [])];
                                                                    
                                                                    if (e.target.checked) {
                                                                        newValue.push(role._id);
                                                                    } else {
                                                                        newValue = newValue.filter(r => r !== role._id);
                                                                    }
                                                                    
                                                                    field.onChange(newValue);
                                                                }}
                                                            />
                                                        }
                                                        label={role.name}
                                                    />

                                                ))}
                                            </FormGroup>
                                            {errors.role_id && (
                                                <p className="text-red-500 text-sm">
                                                    {errors.role_id.message}
                                                </p>
                                            )}
                                        </>
                                    )}
                                />
                            </Grid>
                        )}

                        {/* Users */}
                        {roleUser === 'user' && (
                            <Grid item size={{ xs: 12 }}>
                                <Controller
                                    name="user_id"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomTextField
                                            {...field}
                                            select
                                            fullWidth
                                            label="Select Users*"
                                            SelectProps={{ multiple: true }}
                                        >
                                            {createData.user.map(user => (
                                                <MenuItem key={user._id} value={user._id}>
                                                    {user.first_name} {user.last_name}
                                                </MenuItem>
                                            ))}
                                        </CustomTextField>
                                    )}
                                />
                                {errors.user_id && (
                                    <p className="text-red-500 text-sm">{errors.user_id.message}</p>
                                )}
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>

                <DialogActions
                    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                    <Button variant="contained" type="submit" disabled={loading}>
                        {loading ? (
                            <CircularProgress size={24} sx={{ color: 'white' }} />
                        ) : (
                            'Save'
                        )}
                    </Button>
                    <Button variant="tonal" color="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default EventDialog
