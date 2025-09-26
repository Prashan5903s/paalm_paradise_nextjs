'use client'

// Next Imports
import { useEffect, useState } from 'react'

import { useParams } from 'next/navigation'

import { useSession } from 'next-auth/react'

// MUI Imports
import { useTheme } from '@mui/material/styles'
import { Skeleton } from '@mui/material'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'
import CustomChip from '@core/components/mui/Chip'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports

import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ dictionary, scrollMenu }) => {
  
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const params = useParams()
  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const { lang: locale, role: role } = params

  const [permissArray, setPermissArray] = useState()

  const { data: session } = useSession()
  const token = session?.user?.token
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const fetchPermissionList = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/role/allow/permission`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        setPermissArray(data?.data || [])
      } else {
        console.error('Failed to fetch permissions:', data?.message)
      }
    } catch (error) {
      console.error('Error fetching permissions:', error)
    }
  }

  useEffect(() => {
    if (API_URL && token) {
      fetchPermissionList()
    }
  }, [API_URL, token])

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  if (!permissArray) {
    return <Skeleton variant="rectangular" height={400} />
  }

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
          className: 'bs-full overflow-y-auto overflow-x-hidden',
          onScroll: container => scrollMenu(container, false),
        }
        : {
          options: { wheelPropagation: false, suppressScrollX: true },
          onScrollY: container => scrollMenu(container, true),
        })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => (
          <RenderExpandIcon open={open} transitionDuration={transitionDuration} />
        )}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <SubMenu
          label="Dashboards"
          icon={<i className='tabler-smart-home' />}
        >
          {(permissArray?.notUser) && (
            <MenuItem href={`/${locale}/dashboards/society`}>Society</MenuItem>
          )}

          {permissArray?.isUser && (
            <MenuItem href={`/${locale}/dashboards/user/owner`}>Owner</MenuItem>
          )}
        </SubMenu>
        <MenuSection label="App Pages">
          {permissArray?.isSuperAdmin && (
            <SubMenu label="Role & Permission" icon={<i className="tabler-lock" />}>
              <MenuItem key="Role" href={`/${locale}/apps/roles`}>Roles</MenuItem>
              <MenuItem key="PermissionModule" href={`/${locale}/apps/permission-module`}>Permission module</MenuItem>
              <MenuItem key="Permission" href={`/${locale}/apps/permission`}>Permission</MenuItem>
              <MenuItem key="PackageType" href={`/${locale}/apps/package-type`}>Package type</MenuItem>
              <MenuItem key="Package" href={`/${locale}/apps/package`}>Package</MenuItem>
            </SubMenu>
          )}
          {permissArray?.isUser && (
            <>
              {permissArray?.isUser && permissArray?.hasBillingPermission && (
                <SubMenu label={"Bills"} icon={<i className='tabler-receipt' />}>
                  <MenuItem href={`/${locale}/apps/my-bill/utilityBills`}>{"Utility Bills"}</MenuItem>
                  <MenuItem href={`/${locale}/apps/my-bill/common-area-bill`}>{"Comman Area Bill"}</MenuItem>
                  <MenuItem href={`/${locale}/apps/my-bill/maintenance`}>{"Maintenance"}</MenuItem>
                </SubMenu>
              )}

              {permissArray?.isUser && permissArray?.['hasComplainPermission'] && (
                <MenuItem key="Complain" href={`/${locale}/apps/my-complain`}>
                  <i className="tabler-report" style={{ marginRight: 8, fontSize: '1.2rem' }} />
                  Complains
                </MenuItem>
              )}


              {permissArray?.isUser && permissArray?.['hasTicketPermission'] && (
                <MenuItem key="Complain resolved" href={`/${locale}/apps/ticket`}>
                  <i className="tabler-ticket" style={{ marginRight: 8, fontSize: '1.2rem' }} />
                  Tickets
                </MenuItem>
              )}

              {permissArray && permissArray?.['isUser'] && permissArray?.['hasCameraPermission'] && (
                <MenuItem key="camera" href={`/${locale}/apps/camera`}>
                  <i className="tabler-camera" style={{ marginRight: 8, fontSize: '1.2rem' }} />
                  Camera
                </MenuItem>
              )}

              {permissArray && permissArray?.['isUser'] && permissArray?.['hasVisitorPermission'] && (
                <MenuItem key="visitors" href={`/${locale}/apps/visitor`}>
                  <i className="tabler-users" style={{ marginRight: 8, fontSize: '1.2rem' }} />
                  Visitors
                </MenuItem>
              )}
            </>
          )}
          {permissArray?.isCompany && permissArray?.['hasRolePermission'] && (
            <SubMenu label="Role & Permission" icon={<i className="tabler-lock" />}>
              <MenuItem key="Role" href={`/${locale}/apps/role`}>Roles</MenuItem>
            </SubMenu>
          )}
          {(permissArray?.isCompany) && (permissArray?.['hasFloorPermission'] || permissArray?.['hasTowerPermission'] || permissArray?.['hasApartmentPermission']) && (
            <SubMenu label={"Apartments"} icon={<i className="tabler-building" />}>
              {permissArray && permissArray?.['hasTowerPermission'] && (
                <MenuItem href={`/${locale}/apps/tower`}>
                  Towers
                </MenuItem>
              )}
              {permissArray && permissArray?.['hasFloorPermission'] && (
                <MenuItem href={`/${locale}/apps/floor`}>
                  Floors
                </MenuItem>
              )}
              {permissArray && permissArray?.['hasApartmentPermission'] && (
                <MenuItem href={`/${locale}/apps/apartment`}>
                  Apartments
                </MenuItem>
              )}
            </SubMenu>
          )}
          {permissArray?.isSuperAdmin && (
            <SubMenu label={"Society"} icon={<i className='tabler-user' />}>
              <MenuItem href={`/${locale}/apps/society/list`}>List</MenuItem>
            </SubMenu>
          )}
          {permissArray?.isCompany && permissArray?.['hasUserPermission'] && (
            <SubMenu label={"Users"} icon={<i className='tabler-user' />}>
              <MenuItem href={`/${locale}/apps/user/list`}>{"View Users"}</MenuItem>
            </SubMenu>
          )}
          {permissArray?.isCompany && permissArray?.hasBillingPermission && (
            <SubMenu label={"Bills"} icon={<i className='tabler-receipt' />}>
              <MenuItem href={`/${locale}/apps/bill/utilityBills`}>{"Utility Bills"}</MenuItem>
              <MenuItem href={`/${locale}/apps/bill/common-area-bill`}>{"Comman Area Bill"}</MenuItem>
              <MenuItem href={`/${locale}/apps/bill/maintenance`}>{"Maintenance"}</MenuItem>
            </SubMenu>
          )}
          {permissArray?.isCompany && (
            <MenuItem
              key="Notice"
              href={`/${locale}/apps/notice`}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <i className="tabler-notes" style={{ marginRight: 8, fontSize: '1.2rem' }} />
              Notice Board
            </MenuItem>
          )}
          {permissArray?.isCompany && (
            <MenuItem
              key="Events"
              href={`/${locale}/apps/event`}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <i className="tabler-calendar-event" style={{ marginRight: 8, fontSize: '1.2rem' }} />
              Events
            </MenuItem>
          )}
          {permissArray?.isCompany && permissArray?.hasComplainPermission && (
            <MenuItem key="Complain" href={`/${locale}/apps/complain`}>
              <i className="tabler-report" style={{ marginRight: 8, fontSize: '1.2rem' }} />
              Complains
            </MenuItem>
          )}
        </MenuSection>
      </Menu>
    </ScrollWrapper >
  )
}

export default VerticalMenu
