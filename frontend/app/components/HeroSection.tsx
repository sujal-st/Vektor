import React from 'react'
import { NavLink } from 'react-router'
import Carousel from '~/components/carousel'

function HeroSection() {
    const src = ['nvidia', 'logitech', 'rog', 'msi', 'intel', 'ryzen', 'gigabyte', 'corsair']
    return (
        <section className="h-full">
            <div className="px-6 py-10 lg:p-20 mx-auto flex flex-col justify-center items-center lg:flex-row gap-10 lg:gap-0">
                <div className="text-center md:text-left w-full lg:w-[40%] flex flex-col justify-center items-center lg:items-start gap-6">
                    <h1 className="title font-bold text-2xl sm:text-3xl lg:text-4xl lg:w-1/2">Build Your Perfect PC</h1>
                    <div className="font-semibold text-sm sm:text-base text-center lg:text-left">
                        The intuitive platform for buying quality PC components with confidence.
                        Browse, compare, and select from a wide range of CPUs, GPUs, RAM, storage, and more — all in one place.
                    </div>
                    <div className="flex gap-3 justify-center md:justify-start">
                        <NavLink to="/signup" >
                            <button className="btn-primary cursor-pointer" >Get Started</button>
                        </NavLink>
                        <NavLink to="products" >
                            <button className="btn-secondary cursor-pointer" >View Components</button>
                        </NavLink>
                    </div>
                </div>

                <div className="hero-right w-full md:w-[60%] flex justify-center md:justify-end items-center">
                    <div className="container-rt w-full">
                        <Carousel />
                    </div>
                </div>
            </div>

            {/* logo slider */}
            <div className="overflow-hidden bg-gray-300 py-3 md:py-4 logo-slider1">
                <div className="flex w-max gap-8 md:gap-16 logo-slider">
                    {[...Array(2)].map((_, i) => (
                        <React.Fragment key={i}>
                            {src.map((s) => (
                                <img
                                    key={s}
                                    src={`/assets/${s}.png`}
                                    alt={s}
                                    className={s === 'corsair' ? 'h-6 md:h-10' : 'h-8 md:h-16'}
                                />
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default HeroSection