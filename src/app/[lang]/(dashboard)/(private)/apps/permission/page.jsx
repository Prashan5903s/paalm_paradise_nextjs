import PermissionGuardServer from '@/hocs/PermissionGuard';
import Permissions from '@views/apps/permission/page'

export default function PermissionApp({ params }) {

    const locale = params.lang;

    return (
        <PermissionGuardServer locale={locale} element={'isSuperAdmin'}>
            <Permissions />
        </PermissionGuardServer>
    );
}
