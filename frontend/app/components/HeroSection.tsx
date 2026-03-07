import React from 'react'
import { NavLink } from 'react-router'
import Carousel from '~/components/carousel'
function HeroSection() {
    const src=['nvidia','logitech','rog','msi','intel','ryzen','gigabyte','corsair']
    return (
        <section className="h-full">
            <div className="p-20 mx-auto flex flex-col md:w-full md:flex-row ">
                <div

                    className="text-center md:text-left md:w-[40%] flex flex-col justify-center items-start gap-6"
                >
                    <h1 className="title font-bold">Build Your Perfect PC</h1>
                    <div className="font-semibold">
                        The intuitive platform for buying quality PC components with confidence.
                        Browse, compare, and select from a wide range of CPUs, GPUs, RAM, storage, and more — all in one place.
                    </div>

                    <div className="flex flex-col gap-4">


                        <div className="flex gap-3">
                            <NavLink to="/signup" className='hover:cursor-pointer'>
                                <button className="btn-primary">Get Started</button>
                            </NavLink>
                            <NavLink to="products" className='cursor-pointer'>
                                <button className="btn-secondary">View Components</button>
                            </NavLink>
                        </div>
                    </div>
                </div>

                <div
                    className="hero-right"
                >
                    <div className="container-rt">
                        <Carousel />
                    </div>
                </div>
            </div>

            {/* logo silder */}
            <div className="overflow-hidden bg-gray-300 py-4 logo-slider1">
                    <div className="flex w-max gap-16 logo-slider">
                        {[...Array(2)].map((_, i) => (
                            <React.Fragment key={i}>
                                {src.map((s)=>(
                                    <img key={s} src={`/assets/${s}.png`} alt={s} className={s==='corsair'?'h-10':'h-16'}/>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
        </section>
    )
}

export default HeroSection
