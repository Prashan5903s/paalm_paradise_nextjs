// Do NOT add 'use client' here — this is a Server Component

'use client'

import PermissionGuard from '@/hocs/PermissionClientGuard';
import Apartment from '@views/apps/apartment';
import { useParams } from 'next/navigation';


export default async function ApartmentApp() {

    const { lang: locale } = useParams();

    return (
        <PermissionGuard locale={locale} element="isCompany">
            <Apartment />
        </PermissionGuard>
    );
}
