// MUI Imports

import Grid from '@mui/material/Grid2'

import UserFormLayout from '@/components/company-form/page';

import PermissionGuard from '@/hocs/PermissionGuard'

export default function UserFormLayouts({ params }) {

  const locale = params.lang;

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
