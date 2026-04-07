import React from 'react'
import { NavLink } from 'react-router'

function CTA() {
    return (
        <section className="CTA flex flex-col items-center">
            <div

                className="text-center"
            >
                <h2 className="text-2xl md:text-3xl font-bold my-3">
                    Upgrade Your Performance Today
                </h2>
                <p className="my-4">
                    Discover reliable PC components designed to boost speed, power, and efficiency.
                </p>

                <div className="flex gap-3 justify-center">
                    <NavLink to="/">
                        <button className="btn-primary cursor-pointer">Get Started</button>

                    </NavLink>
                    <NavLink to="/signup">
                    <button className="btn-secondary cursor-pointer">Sign Up For Free</button>
                    </NavLink>
                </div>
            </div>
        </section>
    )
}

export default CTA
