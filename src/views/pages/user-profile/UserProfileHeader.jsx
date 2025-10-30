// MUI Imports
import { useRef, useState } from 'react'

import { useSession } from 'next-auth/react'

import {
  CircularProgress,
  IconButton,
  Typography,
  CardContent,
  CardMedia,
  Card
} from '@mui/material'

import { toast } from 'react-toastify'


const UserProfileHeader = ({ data, onImageUpload }) => {

  const frontURL = process.env.NEXT_PUBLIC_ASSETS_URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const { data: session } = useSession()
  const token = session?.user?.token

  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)

  // Handle file select
  const handleFileChange = async (event) => {
    const file = event.target.files[0]

    if (!file) return

    // Optional: show preview
    setPreview(URL.createObjectURL(file))

    setUploading(true)

    try {

      // send file to backend

      const formData = new FormData()

      formData.append('photo', file)

      const res = await fetch(`${API_URL}/user/profile/user/data`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      })

      const result = await res.json()

      if (res.ok && onImageUpload) {

        onImageUpload(result.photo) // callback to update parent

        toast.success("Image uploded successfully", {
          autoClose: 1000
        })
      }
    } catch (error) {
      console.error('Upload failed', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardMedia image={"/images/pages/profile-banner.png"} className='bs-[250px]' />
      <CardContent className='flex gap-5 justify-center flex-col items-center md:items-end md:flex-row !pt-0 md:justify-start'>
        <div className='relative flex rounded-bs-md mbs-[-40px] border-[5px] mis-[-5px] border-be-0 border-backgroundPaper bg-backgroundPaper'>
          <img
            height={120}
            width={120}
            src={
              preview
                ? preview
                : (!data?.photo || data?.photo == "")
                  ? "/images/avatars/11.png"
                  : `${frontURL}/uploads/images/${data?.photo}`
            }
            className='rounded'
            alt={"Profile image"}
          />

          {/* Pen Icon Overlay */}
          <IconButton
            size='small'
            className='absolute bottom-2 right-2 bg-white shadow-md hover:bg-gray-100'
            onClick={() => fileInputRef.current.click()}
          >
            {uploading ? <CircularProgress size={20} /> : <i className='tabler-edit'></i>}
          </IconButton>

          {/* Hidden File Input */}
          <input
            type='file'
            accept='image/*'
            ref={fileInputRef}
            className='hidden'
            onChange={handleFileChange}
          />
        </div>

        <div className='flex is-full justify-start self-end flex-col items-center gap-6 sm-gap-0 sm:flex-row sm:justify-between sm:items-end '>
          <div className='flex flex-col items-center sm:items-start gap-2'>
            <Typography variant='h4'>
              {data?.first_name + " " + data?.last_name}
            </Typography>
            <div className='flex flex-wrap gap-6 justify-center sm:justify-normal'>
              <div className='flex items-center gap-2'>
                {data?.first_name && <i className={"tabler-user"} />}
                <Typography className='font-medium'>
                  {data?.first_name} {data?.last_name}
                </Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='tabler-map-pin' />
                <Typography className='font-medium'>{data?.phone}</Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='tabler-calendar' />
                <Typography className='font-medium'>{data?.address}</Typography>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserProfileHeader
