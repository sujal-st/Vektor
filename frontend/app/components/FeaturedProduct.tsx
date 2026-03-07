import React, { useState } from 'react'
import Product from './Product';
import { FaChevronLeft } from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa";
import type { ProductType } from '~/types';

type Props={
  products: ProductType[]
}
function FeaturedProduct({products}: Props) {
  
  const [isAnimating, setIsAnimating] = useState(false);

  const [currentSlide, setCurrentSlide] = useState(1);
  const productsPerPage = 4;

  const featuredProducts = products.filter((p) => p.featured == true)

  const totalPages = Math.ceil(featuredProducts.length / productsPerPage);

  const indexOfLast = currentSlide * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;


  const currentProducts = () => {
    const totalProductsInSlide = featuredProducts.slice(indexOfFirst, indexOfLast)
    if (totalProductsInSlide.length < productsPerPage) {
      const needed = productsPerPage - totalProductsInSlide.length;
      const fillers = featuredProducts.slice(0, needed);
      return [...totalProductsInSlide,...fillers]
    }
    return totalProductsInSlide;
  }
  const handleNextSlide = () => {
    if (currentSlide < totalPages) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentSlide((prev) => prev + 1);
        setIsAnimating(false);
      }, 200)
    }
  }
  const handlePrevSlide = () => {
    if (currentSlide > 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide((prev) => prev - 1);
        setIsAnimating(false);
      }, 200)
    }
  }
  return (
    <section className='mt-5 max-w-7xl mx-auto'>
      <h2 className='font-bold mb-5'>Featured Products</h2>
      <div className={`flex flex-row items-center gap-2 transition-opacity duration-200 ${isAnimating?'opacity-0':'opacity-100'}`}>

        <FaChevronLeft size={50} className={`${currentSlide === 1 ? 'invisible' : 'hover:text-gray-300 cursor-pointer'}`} onClick={handlePrevSlide} />

        <div className='grid grid-cols-4 gap-5 mx-2 justify-items-start'>
          {currentProducts().map((p) => (
            <Product key={p.id} product={p} />
          ))}
        </div>
        {currentSlide < totalPages &&
          <FaChevronRight size={50} className={`${currentSlide > totalPages ? 'invisible' : 'hover:text-gray-300 cursor-pointer'}`} onClick={handleNextSlide} />
        }
      </div>

    </section>
  )
}

export default FeaturedProduct
