import PermissionGuardServer from '@/hocs/PermissionGuard'
import Permissions from '@views/apps/permission-module/index'

export default async function PermissionApp({ params }) {

  const locale = params.lang;

  return (
    <PermissionGuardServer locale={locale} element={'isSuperAdmin'}>
      <Permissions />
    </PermissionGuardServer>
  )

}
