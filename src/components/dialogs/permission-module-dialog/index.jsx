// MUI Imports

import { useEffect, useState } from 'react'

import { useSession } from 'next-auth/react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import RadioGroup from '@mui/material/RadioGroup'
import Radio from '@mui/material/Radio'
import FormControlLabel from '@mui/material/FormControlLabel'
import Alert from '@mui/material/Alert'

// React Hook Form
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'

// Valibot schema
import { object, string, minLength, pipe, maxLength, boolean, regex } from 'valibot'

// Component Imports

import { toast } from 'react-toastify'

import DialogCloseButton from '../DialogCloseButton'

import CustomTextField from '@core/components/mui/TextField'



const schema = object({
  name: pipe(
    string(),
    minLength(1, 'Name is required'),
    maxLength(255, 'Name can be maximum of 255 characters'),
    regex(/^[A-Za-z\s]+$/, 'Only alphabets and spaces are allowed')
  ),
  status: boolean()
})

const AddContent = ({ control, errors }) => (
  <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
    <div className="flex items-end gap-4 mbe-2">
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <CustomTextField
            {...field}
            required
            fullWidth
            size="small"
            variant="outlined"
            label="Permission Module Name"
            placeholder="Enter Permission Module Name"
            onKeyDown={(e) => {
              const key = e.key;
              const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', ' ']; // include space

              // Allow A-Z, a-z, and space
              if (!/^[a-zA-Z ]$/.test(key) && !allowedKeys.includes(key)) {
                e.preventDefault();
              }
            }}

            onPaste={(e) => {
              const paste = e.clipboardData.getData('text');

              // Allow paste if it only contains letters and spaces
              if (!/^[a-zA-Z ]+$/.test(paste)) {
                e.preventDefault();
              }
            }}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        )}
      />
    </div>

    <Typography variant="h6" className="mbe-2">Status <span>*</span></Typography>
    <FormControl component="fieldset" error={!!errors.status}>
      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <RadioGroup
            row
            value={field.value?.toString()}
            onChange={(e) => field.onChange(e.target.value === "true")}
          >
            <FormControlLabel value="true" control={<Radio />} label="Active" />
            <FormControlLabel value="false" control={<Radio />} label="Inactive" />
          </RadioGroup>
        )}
      />
      {errors?.status && <Alert severity="error">{errors?.status?.message}</Alert>}
    </FormControl>
  </DialogContent>
)

const EditContent = ({ control, errors }) => (
  <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
    <div className="flex items-end gap-4 mbe-2">
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <CustomTextField
            {...field}
            fullWidth
            required
            size="small"
            variant="outlined"
            label="Permission Module Name"
            placeholder="Enter Permission Module Name"
            onKeyDown={(e) => {
              const key = e.key;
              const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', ' ']; // include space

              // Allow A-Z, a-z, and space
              if (!/^[a-zA-Z ]$/.test(key) && !allowedKeys.includes(key)) {
                e.preventDefault();
              }
            }}

            onPaste={(e) => {
              const paste = e.clipboardData.getData('text');

              // Allow paste if it only contains letters and spaces
              if (!/^[a-zA-Z ]+$/.test(paste)) {
                e.preventDefault();
              }
            }}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        )}
      />
    </div>

    <Typography variant="h6" className="mbe-2">Status <span>*</span></Typography>
    <FormControl component="fieldset" error={!!errors.status}>
      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <RadioGroup
            row
            value={field.value?.toString()}
            onChange={(e) => field.onChange(e.target.value === "true")}
          >
            <FormControlLabel value="true" control={<Radio />} label="Active" />
            <FormControlLabel value="false" control={<Radio />} label="Inactive" />
          </RadioGroup>
        )}
      />
      {errors?.status && <Alert severity="error">{errors?.status?.message}</Alert>}
    </FormControl>
  </DialogContent>
)

const PermissionDialog = ({ open, setOpen, data, fetchPermissionModule, nameData }) => {

  const URL = process.env.NEXT_PUBLIC_API_URL
  const { data: session } = useSession() || {}
  const token = session?.user?.token
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: valibotResolver(schema),
    mode: 'onChange',
    defaultValues: {
      name: data?.name || '',
      status: data?.status ?? false
    }
  })

  const handleClose = () => {
    setOpen(false)
    reset({
      name: "",
      status: false
    })
  }


  useEffect(() => {
    if (data) {
      reset({
        name: data.name || '',
        status: data.status ?? false
      })
    }
  }, [data, reset])

  const submitData = async (VALUE) => {
    setLoading(true);

    try {
      const response = await fetch(data ? `${URL}/admin/permission-module/${data?._id}` : `${URL}/admin/permission-module`,
        {
          method: data ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(VALUE)
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        setLoading(false);
        fetchPermissionModule();
        toast.success(`Permission module ${data ? "updated" : "added"} successfully!`, {
          autoClose: 700, // in milliseconds
        });
        handleClose()
      }
    } catch (error) {
      setLoading(false);
      console.log("Error", error);
    } finally {
      setLoading(false);
    }

  }

  const onSubmit = (values) => {

    if (!data) {
      const exist = nameData.find(item => item.name.trim().toLowerCase() === values.name.trim().toLowerCase());

      if (exist) {
        setError('name', {
          type: 'manual',
          message: 'This name already exists.'
        });

        return;
      }
    } else {
      const exist = nameData.find(item =>
        item._id.toString() !== data._id.toString() && item.name.trim().toLowerCase() === values.name.trim().toLowerCase()
      );

      if (exist) {
        setError('name', {
          type: 'manual',
          message: 'This name already exists.'
        });

        return;
      }
    }

    submitData(values);
    setOpen(false)

    // handle API or logic here
  }

  return (
    <Dialog
    fullWidth
      open={open}
      onClose={handleClose}
      closeAfterTransition={false}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogCloseButton onClick={handleClose} disableRipple>
          <i className='tabler-x' />
        </DialogCloseButton>

        <DialogTitle
          variant='h4'
          className='flex flex-col gap-2 text-center sm:pbs-16 sm:pbe-6 sm:pli-16'
        >
          {data ? 'Edit Permission Module' : 'Add New Permission Module'}
        </DialogTitle>

        {data ? (
          <EditContent control={control} errors={errors} />
        ) : (
          <AddContent control={control} errors={errors} />
        )}

        <DialogActions className='flex max-sm:flex-col max-sm:items-center max-sm:gap-2 justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button
            type='submit'
            variant='contained'
            disabled={loading}

            // fullWidth
            sx={{ height: 40, position: 'relative' }}
          >
            {loading ? (
              <CircularProgress
                size={24}
                sx={{
                  color: 'white',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
            ) : (
              data ? 'Update' : 'Create'
            )}
          </Button>
          <Button onClick={handleClose} variant='tonal' color='secondary'>
            Discard
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default PermissionDialog
