// Do NOT add 'use client' here — this is a Server Component

import PermissionGuard from '@/hocs/PermissionGuard';
import Floor from '@views/apps/floor';

export default  function FloorApp({ params }) {
    const locale = params.lang;

    return (
        <PermissionGuard locale={locale} element="hasFloorPermission">
            <Floor />
        </PermissionGuard>
    );
}
