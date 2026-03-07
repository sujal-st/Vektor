import React, { useState } from 'react'
import Product from './Product';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import type { ProductType } from '~/types';

type Props = {
  products: ProductType[]
}

function FeaturedProduct({ products }: Props) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);

  // Responsive products per page based on screen width
  const getProductsPerPage = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 1;
      if (window.innerWidth < 780) return 2;
    }
    return 4;
  }

  const [productsPerPage, setProductsPerPage] = useState(getProductsPerPage);

  React.useEffect(() => {
    const handleResize = () => {
      setProductsPerPage(getProductsPerPage());
      setCurrentSlide(1);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const featuredProducts = products.filter((p) => p.featured == true)
  const totalPages = Math.ceil(featuredProducts.length / productsPerPage);
  const indexOfLast = currentSlide * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;

  const currentProducts = () => {
    const totalProductsInSlide = featuredProducts.slice(indexOfFirst, indexOfLast)
    if (totalProductsInSlide.length < productsPerPage) {
      const needed = productsPerPage - totalProductsInSlide.length;
      const fillers = featuredProducts.slice(0, needed);
      return [...totalProductsInSlide, ...fillers]
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
    <section className='mt-5 max-w-7xl mx-auto px-4'>
      <h2 className='font-bold mb-5 text-lg md:text-xl'>Featured Products</h2>
      <div className={`flex flex-row items-center gap-1 md:gap-2 transition-opacity duration-200 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>

        <FaChevronLeft
          size={30}
          className={`flex-shrink-0 ${currentSlide === 1 ? 'invisible' : 'hover:text-gray-300 cursor-pointer'}`}
          onClick={handlePrevSlide}
        />

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mx-1 md:mx-2 flex-1 min-w-0'>
          {currentProducts().map((p) => (
            <Product key={p.id} product={p} />
          ))}
        </div>

        <FaChevronRight
          size={30}
          className={`flex-shrink-0 ${currentSlide >= totalPages ? 'invisible' : 'hover:text-gray-300 cursor-pointer'}`}
          onClick={handleNextSlide}
        />
      </div>
    </section>
  )
}

export default FeaturedProduct