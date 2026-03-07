import React, { useContext, useEffect, useState } from 'react'
import Product from './Product';
import PaginationButon from './PaginationButon';
import { categoryContext } from '~/contexts/categoryContext';
import { filterContext } from '~/contexts/resetFilterContext';
import { paginationContext } from '~/contexts/paginationContext';
import { NavLink } from 'react-router';
import type { ProductType } from '~/types';

type Props = {
  products: ProductType[]
}



function ProductMenu({ products }: Props) {

  const { cat } = useContext(categoryContext);
  const { priceRange } = useContext(filterContext);

  const filteredProducts = products
    .filter((p) => cat === 'All' || p.category.toLowerCase() === cat.toLowerCase())
    .filter((p) => p.price * 145 >= priceRange[0] && p.price * 145 <= priceRange[1])


  const { currentPage, setCurrentPage } = useContext(paginationContext);
  const productsPerPage = 9;

  const totalpages = Math.ceil(filteredProducts.length / productsPerPage);
  // console.log(filteredProducts)
  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;

  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  // console.log(cat + ':' + currentProducts.length)

  useEffect(() => {
    setCurrentPage(1)
  }, [cat])

  return (
    <div className='flex flex-col gap-2'>
      {currentProducts.length === 0 ? (<h2 className='font-bold text-2xl text-center mx-auto'>No Products Found</h2>) : (

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-2'>
          {currentProducts.map((product) => (
            <NavLink key={product.id} to={`/products/${product.id}`}>
              <Product product={product} />
            </NavLink>
          ))}
        </div>
      )
      }
      {currentProducts.length > 0 &&
        <PaginationButon currentPage={currentPage} totalPages={totalpages} onCurrentPage={setCurrentPage} />
      }
    </div>
  )
}

export default ProductMenu
