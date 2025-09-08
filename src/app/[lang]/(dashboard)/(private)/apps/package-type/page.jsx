import PermissionGuardServer from '@/hocs/PermissionGuard'
import PackageType from '@views/apps/package-type'

export default async function PackageTypeApp({ params }) {

  const locale = await params?.lang

  return (
    <PermissionGuardServer locale={locale} element={'isSuperAdmin'}>
      <PackageType />
    </PermissionGuardServer>
  )
}
