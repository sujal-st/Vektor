import React, { useState, useContext, useEffect, lazy, Suspense } from 'react'
import 'react-range-slider-input/dist/style.css';
import { categoryContext } from '~/contexts/categoryContext';
import { filterContext } from '~/contexts/resetFilterContext';

const RangeSlider = lazy(() => import('react-range-slider-input'));

function PriceFilter() {
    const [isOpen, setIsOpen] = useState(false);
    const { setCat } = useContext(categoryContext);
    const { priceRange, setPriceRange } = useContext(filterContext);

    const handleReset = () => {
        setPriceRange([0, 200000]);
    }

    return (
        <>
            {/* Mobile toggle button */}
            <button
                className='md:hidden sticky top-10 h-fit w-full rounded-sm px-4 py-2 font-semibold bg-white border border-gray-200 flex justify-between items-center'
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>Filter By Price</span>
                <span>{isOpen ? '▲' : '▼'}</span>
            </button>

            {/* Filter panel */}
            <div className={`
                md:py-12 md:px-5 md:rounded-sm md:bg-white md:min-w-[20%] md:max-h-fit 
                md:flex md:flex-col md:items-start md:space-y-5 md:sticky md:top-20
                ${isOpen ? 'flex' : 'hidden'} md:flex
                flex-col items-start gap-4 py-4 px-4 bg-white rounded-sm w-full
            `}>
                <h3 className='font-bold text-lg hidden md:block'>Filter By Price</h3>
                <Suspense fallback={<div>Loading...</div>}>
                    <RangeSlider
                        min={0}
                        max={200000}
                        value={[priceRange[0], priceRange[1]]}
                        onInput={(values) => setPriceRange(values)}
                        ariaLabel={['Min', 'Max']}
                    />
                </Suspense>
                <div className='text-sm md:text-lg'>
                    <span className='text-gray-600'>Price: </span>
                    <span className='font-medium text-[#055D62]'>Rs {priceRange[0]} - Rs {priceRange[1]}</span>
                </div>
                <button
                    className='min-w-full rounded-sm px-4 py-1 font-semibold border border-[#AB2320] text-[#AB2320] cursor-pointer hover:scale-101 transition'
                    onClick={handleReset}
                >
                    Reset Price
                </button>
                <button
                    className='min-w-full rounded-sm px-4 py-1 font-semibold bg-[#AB2320] text-[#F6F1E6] cursor-pointer hover:scale-101 transition'
                    onClick={() => {
                        handleReset();
                        setCat('All');
                    }}
                >
                    Reset All
                </button>
            </div>
        </>
    )
}

export default PriceFilter