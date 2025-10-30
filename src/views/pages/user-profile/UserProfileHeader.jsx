// MUI Imports
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

const UserProfileHeader = ({ data }) => {

  const frontURL = process.env.NEXT_PUBLIC_ASSETS_URL;

  return (
    <Card>
      <CardMedia image={"/images/pages/profile-banner.png"} className='bs-[250px]' />
      <CardContent className='flex gap-5 justify-center flex-col items-center md:items-end md:flex-row !pt-0 md:justify-start'>
        <div className='flex rounded-bs-md mbs-[-40px] border-[5px] mis-[-5px] border-be-0  border-backgroundPaper bg-backgroundPaper'>
          <img height={120} width={120} src={(!data?.photo || data?.photo == "") ? "/images/avatars/11.png" : `${frontURL}/uploads/images/${data?.photo}` } className='rounded' alt={"Profile image"} />
        </div>
        <div className='flex is-full justify-start self-end flex-col items-center gap-6 sm-gap-0 sm:flex-row sm:justify-between sm:items-end '>
          <div className='flex flex-col items-center sm:items-start gap-2'>
            <Typography variant='h4'>{data?.first_name + " " + data?.last_name}</Typography>
            <div className='flex flex-wrap gap-6 justify-center sm:justify-normal'>
              <div className='flex items-center gap-2'>
                {data?.first_name && <i className={"tabler-user" } />}
                <Typography className='font-medium'>{data?.first_name} {data?.last_name}</Typography>
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
          {/* <Button variant='contained' className='flex gap-2'>
            <i className='tabler-user-check !text-base'></i>
            <span>Connected</span>
          </Button> */}
        </div>
      </CardContent>
    </Card>
  )
}

export default UserProfileHeader
