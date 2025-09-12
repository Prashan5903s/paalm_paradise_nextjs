'use client'

// Component Imports
import PermissionGuard from '@/hocs/PermissionClientGuard'
import UserList from '@/views/apps/user/list'
import { useParams } from 'next/navigation';

export default function () {

  const { lang: locale } = useParams();

  return (
    <PermissionGuard locale={locale} element={'isCompany'}>
      <UserList />
    </PermissionGuard>
  )

}
