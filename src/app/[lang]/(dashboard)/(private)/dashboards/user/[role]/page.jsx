'use client'

import LogisticsDashboard from '../../../apps/dashboard/page'
import PermissionGuard from '@/hocs/PermissionClientGuard';

export default async function UserDashboard() {

    const { lang: locale } = useParams();

    return (
        <>
            <PermissionGuard locale={locale} element={'isUser'}>
                <LogisticsDashboard />
            </PermissionGuard>
        </>
    )

}
