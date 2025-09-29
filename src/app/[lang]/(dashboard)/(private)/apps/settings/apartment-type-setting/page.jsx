import PermissionGuard from '@/hocs/PermissionGuard';
import ApartmentType from '@views/apps/settings/apartment-type-setting/index';

export default function TowerApp({ params }) {
    const locale = params.lang;

    return (
        <PermissionGuard locale={locale} element="isCompany">
            <ApartmentType />
        </PermissionGuard>
    );
}
