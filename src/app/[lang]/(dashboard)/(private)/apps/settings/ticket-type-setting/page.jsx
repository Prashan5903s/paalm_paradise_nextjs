import PermissionGuard from '@/hocs/PermissionGuard';
import TicketType from '@views/apps/settings/ticket-type-setting/index';

export default function TowerApp({ params }) {
    const locale = params.lang;

    return (
        <PermissionGuard locale={locale} element="isCompany">
            <TicketType />
        </PermissionGuard>
    );
}
