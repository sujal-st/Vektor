import React, { useState, useContext } from 'react'
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { categoryContext } from '~/contexts/categoryContext';
import { paginationContext } from '~/contexts/paginationContext';

function Categories() {
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(1);
    const categories = [
        { img: 'gpu.jpg', title: 'GPU' },
        { img: 'RAM.jpg', title: 'RAM' },
        { img: 'processor.png', title: 'CPU' },
        { img: 'motherboard.jpg', title: 'Motherboard' },
        { img: 'AIO.jpg', title: 'Cooling' },
        { img: 'monitor.jpg', title: 'Monitor' },
        { img: 'storage.png', title: 'Storage' },
        { img: 'case.png', title: 'Case' },
        { img: 'fan.png', title: 'PSU' },
    ];

    const getCatPerSlide = () => {
        if (typeof window !== 'undefined') {
            if (window.innerWidth < 640) return 4;
            if (window.innerWidth < 1024) return 4;
        }
        return 7;
    }

    const [catPerSlide, setCatPerSlide] = useState(getCatPerSlide);

    React.useEffect(() => {
        const handleResize = () => setCatPerSlide(getCatPerSlide());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const totalSlides = Math.ceil(categories.length / catPerSlide);
    const indexOfLast = currentSlide * catPerSlide;
    const indexOfFirst = indexOfLast - catPerSlide;
    const currentCat = categories.slice(indexOfFirst, indexOfLast);

    const handleNext = () => {
        if (currentSlide < totalSlides) {
            setIsAnimating(true)
            setTimeout(() => {
                setCurrentSlide((prev) => prev + 1);
                setIsAnimating(false);
            }, 200)
        }
    }

    const handlePrev = () => {
        if (currentSlide > 1) {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentSlide((prev) => prev - 1);
                setIsAnimating(false);
            }, 200)
        }
    }

    const { cat, setCat } = useContext(categoryContext);
    const { setCurrentPage } = useContext(paginationContext);

    return (
        <div className='max-w-full bg-gray-50'>
            <h1 className='font-bold px-4 md:px-8 pt-4 text-lg'>Categories</h1>
            <div className={`rounded-sm px-2 md:px-4 py-4 md:py-5 flex justify-center items-center gap-2 md:gap-4 transition-opacity duration-200 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>

                <FaArrowLeft
                    size={20}
                    className={`flex-shrink-0 hover:text-gray-600 cursor-pointer ${indexOfFirst === 0 ? 'invisible' : ''}`}
                    onClick={handlePrev}
                />

                {currentCat.map((c) => (
                    <div
                        key={c.title}
                        className={`p-2 md:p-5 rounded min-w-[60px] md:min-w-30 flex flex-col items-center gap-1 md:gap-2 cursor-pointer transition ${cat === c.title.toLowerCase() ? 'bg-gray-300' : 'bg-white'}`}
                        onClick={() => {
                            setCurrentPage(1);
                            setCat(c.title.toLowerCase());
                        }}
                    >
                        <img
                            src={`/assets/${c.img}`}
                            alt={c.title}
                            className='h-12 sm:h-20 md:h-32 hover:scale-110 transition'
                        />
                        <h4 className='font-semibold text-xs sm:text-sm md:text-lg text-center'>{c.title}</h4>
                    </div>
                ))}

                <FaArrowRight
                    size={20}
                    className={`flex-shrink-0 hover:text-gray-600 cursor-pointer ${indexOfLast >= categories.length ? 'invisible' : ''}`}
                    onClick={handleNext}
                />
            </div>
        </div>
    )
}

export default Categories