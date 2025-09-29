import PermissionGuard from '@/hocs/PermissionGuard';
import VisitorType from '@views/apps/settings/visitor-type-setting/index';

export default function TowerApp({ params }) {
    const locale = params.lang;

    return (
        <PermissionGuard locale={locale} element="isCompany">
            <VisitorType />
        </PermissionGuard>
    );
}
