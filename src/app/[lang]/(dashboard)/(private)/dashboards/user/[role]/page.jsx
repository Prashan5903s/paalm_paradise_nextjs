import LogisticsDashboard from '../../../apps/dashboard/page'
import PermissionGuard from '@/hocs/PermissionGuard';

export default function UserDashboard({ params }) {

    const { lang: locale } = params;
    

    return (
        <>
            <PermissionGuard locale={locale} element={'isUser'}>
                <LogisticsDashboard />
            </PermissionGuard>
        </>
    )

}
