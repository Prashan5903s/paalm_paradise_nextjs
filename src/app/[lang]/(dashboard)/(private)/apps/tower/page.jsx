// Do NOT add 'use client' here — this is a Server Component

import PermissionGuard from '@/hocs/PermissionGuard';
import Towers from '@views/apps/tower';

export default  function TowerApp({ params }) {
    const locale = params.lang;

    return (
        <PermissionGuard locale={locale} element="isCompany">
            <Towers />
        </PermissionGuard>
    );
}
