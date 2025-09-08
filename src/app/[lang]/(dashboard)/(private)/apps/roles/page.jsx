// Component Imports
import Roles from '@views/apps/roles'

// Data Imports
import { getUserData } from '@/app/server/actions'
import PermissionGuard from '@/hocs/PermissionGuard';

export default function RoleApp({ params }) {

  const locale = params.lang;

  return (
    <PermissionGuard locale={locale} element={'isSuperAdmin'}>
      <Roles />
    </PermissionGuard>
  )

}
