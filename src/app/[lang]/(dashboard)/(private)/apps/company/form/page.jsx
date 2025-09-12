"use client"

import Grid from '@mui/material/Grid2'

// Component Imports
import UserFormLayout from '@/components/company-form/page';

import PermissionGuard from '@/hocs/PermissionClientGuard'
import { useParams } from 'next/navigation';

export default function UserFormLayouts() {

  const { lang: locale } = useParams();

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <PermissionGuard locale={locale} element={'isSuperAdmin'}>
          <UserFormLayout />
        </PermissionGuard>
      </Grid>
    </Grid>
  )
}
