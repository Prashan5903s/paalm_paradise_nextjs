// Component Imports
import Role from '@views/apps/role'

// Data Imports
import { getUserData } from '@/app/server/actions'
import PermissionGuard from '@/hocs/PermissionGuard';

export default function RoleApp({ params }) {

  const locale = params.lang;

  return (
    <PermissionGuard locale={locale} element={'hasRolePermission'}>
      <Role />
    </PermissionGuard>
  )

}
