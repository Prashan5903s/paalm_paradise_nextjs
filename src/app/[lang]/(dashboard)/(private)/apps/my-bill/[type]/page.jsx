'use client'

import { useParams } from "next/navigation";

import {
    Typography
} from '@mui/material'

import Grid from '@mui/material/Grid2';

import Bill from "@views/apps/bill/index"

import PermissionGuard from '@/hocs/PermissionClientGuard'

const BillType = () => {

    const { type, lang: locale } = useParams();

    return (
        <>
            <PermissionGuard locale={locale} element="isCompany">
                <Bill type={type} />
            </PermissionGuard>
        </>
    )
}

export default BillType;
