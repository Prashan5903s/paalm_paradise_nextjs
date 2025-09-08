import PermissionGuardServer from '@/hocs/PermissionGuard'
import Channel from '@views/apps/channel'

export default async function ChannelApp({ params }) {

    const locale = params.lang;

    return (
        <PermissionGuardServer locale={locale} element={'hasDepartmentPermission'}>
            <Channel />
        </PermissionGuardServer>
    )

}
