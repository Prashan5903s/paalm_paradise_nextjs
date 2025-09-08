// Component Imports
import PermissionGuard from '@/hocs/PermissionGuard'
import UserList from '@/views/apps/user/list'

export default function UserListApp({ params }) {

  const locale = params.lang;

  return (
    <PermissionGuard locale={locale} element={'hasUserPermission'}>
      <UserList />
    </PermissionGuard>
  )

}
