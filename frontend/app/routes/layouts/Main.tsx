import React from 'react'
import { Outlet, useLoaderData } from 'react-router'
import type { Route } from './+types/Main'
import { CategoryProvider } from '~/contexts/categoryContext'
import { FilterProvider } from '~/contexts/resetFilterContext'
import { PaginationProvider } from '~/contexts/paginationContext'
import type { CartType } from '~/types'
import NavBar from '~/components/NavBar'

export function meta({ }: Route.MetaArgs) {
  return [
    { title: `Vektor` },
    { name: 'description', content: 'Vektor website' }
  ]
}


function MainLayout() {
  
  return (
    <>
        <NavBar />
        <section>
          <PaginationProvider>
            <CategoryProvider>
              <FilterProvider>
                <Outlet />
              </FilterProvider>
            </CategoryProvider>
          </PaginationProvider>
        </section>
    </>
  )
}

export default MainLayout
