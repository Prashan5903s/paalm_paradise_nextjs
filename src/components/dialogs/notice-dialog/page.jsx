'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    FormControlLabel,
    FormGroup,
    Skeleton,
    Checkbox,
} from '@mui/material'

import Grid from '@mui/material/Grid2'

// Hook Form + Validation
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, minLength, pipe, array, maxLength } from 'valibot'

// Components
import { useSession } from 'next-auth/react'

import { toast } from 'react-toastify'

import CustomTextField from '@core/components/mui/TextField'

import DialogCloseButton from '../DialogCloseButton'

const NoticeDialog = ({ open, setOpen, selectedZone, fetchZoneData, type }) => {
    const { data: session } = useSession()
    const token = session?.user?.token
    const API_URL = process.env.NEXT_PUBLIC_API_URL

    const [createData, setCreateData] = useState()
    const [loading, setLoading] = useState(false)

    const {
        control,
        handleSubmit,
        reset,
        setError,
        clearErrors,
        formState: { errors }
    } = useForm({
        defaultValues: {
            title: '',
            description: '',
            role_id: []
        }
    })

    useEffect(() => {
        if (open && selectedZone) {
            reset({
                title: selectedZone?.title?.toString() || '',
                description: selectedZone?.description?.toString() || '',
                
                // Extract only the IDs from role objects
                role_id: selectedZone?.role_id?.map(role => role._id) || []
            });
        }
    }, [open, selectedZone, reset]);

    const handleClose = () => {
        reset()
        setOpen(false)
    }

    // Fetch roles
    useEffect(() => {
        let ignore = false
        
        const fetchCreateData = async () => {
            try {
                const response = await fetch(`${API_URL}/company/notice/create`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                
                const result = await response.json()
                
                if (response.ok && !ignore) setCreateData(result?.data)
            } catch (err) {
                console.error(err)
            }
        }
        
        if (API_URL && token) fetchCreateData()
        
            return () => { ignore = true }
    }, [API_URL, token])

    const submitData = async formData => {
        // ✅ Manual validation for role_id
        if (!formData.role_id || formData.role_id.length === 0) {
            setError('role_id', { type: 'manual', message: 'At least one role is required' })
            
            return
        } else {
            clearErrors('role_id')
        }

        setLoading(true)
        
        try {
            const url = selectedZone
                ? `${API_URL}/company/notice/update/${selectedZone._id}`
                : `${API_URL}/company/notice`

            const response = await fetch(url, {
                method: selectedZone ? 'PUT' : 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await response.json()
            
            if (response.ok) {
                fetchZoneData()
                toast.success(`Notice ${selectedZone ? 'updated' : 'added'} successfully!`, { autoClose: 700 })
                handleClose()
            } else {
                toast.error(data?.message || 'Something went wrong')
            }
        } catch (err) {
            toast.error('Failed to save notice')
        } finally {
            setLoading(false)
        }
    }

    if (!createData) {
        return (
            <Dialog fullWidth maxWidth="md" open={open}>
                <DialogCloseButton onClick={handleClose}><i className="tabler-x" /></DialogCloseButton>
                <DialogTitle>{selectedZone ? 'Edit Notice' : 'Add Notice'}</DialogTitle>
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
            <DialogTitle variant="h4" className="text-center sm:pbs-16 sm:pbe-6 sm:pli-16">
                {selectedZone ? 'Edit Notice' : 'Add Notice'}
            </DialogTitle>

            <form onSubmit={handleSubmit(submitData)} noValidate>
                <DialogContent className="overflow-visible flex flex-col gap-6 sm:pli-16">
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name="title"
                                control={control}
                                rules={{ required: 'Title is required' }}
                                render={({ field }) => (
                                    <CustomTextField fullWidth {...field} label="Title" error={!!errors.title} helperText={errors.title?.message} />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name="description"
                                control={control}
                                rules={{ required: 'Description is required' }}
                                render={({ field }) => (
                                    <CustomTextField
                                        fullWidth
                                        {...field}
                                        label="Description" multiline rows={4} error={!!errors.description} helperText={errors.description?.message} />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <label className="font-medium block mb-2">Role *</label>
                            <Controller
                                name="role_id"
                                control={control}
                                render={({ field }) => (
                                    <>
                                        <FormGroup row>
                                            {createData.map(role => (
                                                <FormControlLabel
                                                    key={role._id}
                                                    control={
                                                        <Checkbox
                                                            checked={field.value?.includes(role._id)}
                                                            onChange={e => {
                                                                const newValue = e.target.checked
                                                                    ? [...(field.value || []), role._id]
                                                                    : (field.value || []).filter(r => r !== role._id)
                                                                
                                                                    field.onChange(newValue)
                                                            }}
                                                        />
                                                    }
                                                    label={role.name}
                                                />
                                            ))}
                                        </FormGroup>
                                        {errors.role_id && <p className="text-red-500 text-sm">{errors.role_id.message}</p>}
                                    </>
                                )}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions className="justify-center sm:pbe-16 sm:pli-16">
                    <Button variant="contained" type="submit" disabled={loading} color="primary">
                        {loading ? (
                            <CircularProgress
                                size={24}
                                sx={{ color: 'white', position: 'absolute', mt: '-12px', ml: '-12px' }}
                            />
                        ) : (
                            'Save'
                        )}
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default NoticeDialog
