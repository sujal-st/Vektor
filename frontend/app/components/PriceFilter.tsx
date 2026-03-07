import React, { useState, useContext, useEffect, lazy, Suspense } from 'react'
import 'react-range-slider-input/dist/style.css';
import { categoryContext } from '~/contexts/categoryContext';
import { filterContext } from '~/contexts/resetFilterContext';

const RangeSlider = lazy(() => import('react-range-slider-input'));

function PriceFilter() {
    const { setCat } = useContext(categoryContext);
    const { priceRange, setPriceRange } = useContext(filterContext);

    const handleReset = () => {
        setPriceRange([0, 200000]);
    }

    return (
        <div className='py-12 px-5 rounded-sm bg-white min-w-[20%] max-h-fit flex flex-col items-start space-y-5 sticky top-20'>
            <h3 className='font-bold text-lg'>Filter By Price</h3>
            <Suspense fallback={<div>Loading...</div>}>
                <RangeSlider
                    min={0}
                    max={200000}
                    value={[priceRange[0], priceRange[1]]}
                    onInput={(values) => setPriceRange(values)}
                    ariaLabel={['Min', 'Max']}
                />
            </Suspense>
            <div className='text-lg'>
                <span className='text-gray-600'>Price: </span>
                <span className='font-medium text-[#055D62]'>Rs {priceRange[0]} - Rs {priceRange[1]}</span>
            </div>
            <button className='min-w-full rounded-sm px-4 py-1 font-semibold border border-[#AB2320] text-[#AB2320] cursor-pointer hover:scale-101 transition' onClick={handleReset}>Reset Price</button>
            <button className='min-w-full rounded-sm px-4 py-1 font-semibold bg-[#AB2320] text-[#F6F1E6] cursor-pointer hover:scale-101 transition' onClick={() => {
                handleReset();
                setCat('All');
            }}>Reset All</button>
        </div>
    )
}

export default PriceFilter