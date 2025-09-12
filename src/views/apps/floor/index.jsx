// MUI Imports

'use client'

import { useState, useEffect } from 'react'

import { useParams } from 'next/navigation'

import { useSession } from 'next-auth/react'

import Typography from '@mui/material/Typography'

import Grid from '@mui/material/Grid2'

import FloorTable from './FloorTable'

import FloorCard from './FloorCards'

import SkeletonTableComponent from '@/components/skeleton/table/page'

const Floors = () => {

  const [zoneData, setZoneData] = useState();
  const [loading, setLoading] = useState(false);

  const URL = process.env.NEXT_PUBLIC_API_URL;

  const { data: session } = useSession() || {};

  const { lang: locale } = useParams()

  const token = session && session.user && session?.user?.token;

  async function fetchZoneData() {

    try {
      const response = await fetch(`${URL}/company/floor`,
        {
          method: "GET",
          headers: {
            // "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        })

      const datas = await response.json();

      if (response.ok) {
        setLoading(true);
        setZoneData(datas?.data);
      } else {

      }

    } catch (error) {
      throw new Error(error);
    } finally {
      setLoading(true);
    }
  }

  useEffect(() => {
    if (URL && token) {
      fetchZoneData();
    }
  }, [token])

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' className='mbe-1'>
          Floor List
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <FloorCard fetchZoneData={fetchZoneData} tableData={zoneData} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        {zoneData ? (
          <FloorTable tableData={zoneData} fetchZoneData={fetchZoneData} />
        )
          : (
            <SkeletonTableComponent />
          )
        }
      </Grid>
    </Grid>
  )
}

export default Floors
