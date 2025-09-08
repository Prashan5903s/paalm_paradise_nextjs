import LogisticsDashboard from '../../../apps/dashboard/page'
import PermissionGuard from '@/hocs/PermissionGuard';

export default async function UserDashboard({ params }) {

    const locale = await params?.lang;

    return (
        <>
            <PermissionGuard locale={locale} element={'isUser'}>
                <LogisticsDashboard />
            </PermissionGuard>
        </>
    )

}
