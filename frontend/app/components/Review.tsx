import React from 'react'
import {
    FaStar,
    FaStarHalfAlt,
    FaRegStar
} from "react-icons/fa";

function Review() {
    let rating: number = 3;

    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) stars.push(<FaStar key={i} className="review-star" />);
        else if (rating >= i - 0.5) stars.push(<FaStarHalfAlt key={i} className="review-star" />);
        else stars.push(<FaRegStar key={i} className="review-star" />);
    }

    return (
        <div>
            <section className="review-section px-4 md:px-[80px]">
                <h2 className='section-title text-2xl md:text-3xl text-center font-bold my-8'>
                    User Testimonials
                </h2>

                {/* Desktop grid — uses your existing CSS classes */}
                <div className="hidden lg:grid font-bold">
                    {[
                        { title: "From Old PC to High-Performance Build", className: "grid-card flex flex-col justify-between grid-img1", button: true },
                        { title: "Customer Build Stories", className: "grid-card grid-title flex flex-row items-center text-center" },
                        { title: "Gaming Setup Upgrade", className: "grid-card-1 grid-wide flex flex-col", stars: stars },

                        { title: "Now My Games Run at Ultra Settings", className: "grid-card grid-title flex flex-row items-center text-center" },
                        { title: "How I Built My Dream Gaming PC", className: "grid-card flex flex-col justify-between grid-img2", button: true },
                        { title: "Performance Boost Success", className: "grid-card grid-title flex flex-row items-center text-center" },

                        { title: "More Than Just Components", className: "grid-card flex flex-col justify-between grid-img3", button: true, stars: stars },
                        { title: "Customer Review Spotlight", className: "grid-card-1 grid-wide-1 flex flex-col", stars: stars },

                        { title: "Finally a Store I Can Trust", className: "grid-card flex flex-col justify-between grid-img4", button: true },
                        { title: "Power, Speed & Reliability", className: "grid-card grid-title flex flex-row items-center text-center" }
                    ].map((item, i) => (
                        <div key={i} className={item.className}>
                            <div className="grid-title">{item.title}</div>
                            {item.button && <button className="btn-primary small-btn">Read More</button>}
                            {item.stars && <div className="star flex gap-1">{item.stars}</div>}
                        </div>
                    ))}
                </div>

                {/* Mobile layout — simple stacked cards */}
                <div className="lg:hidden grid grid-cols-1 gap-4 font-bold">
                    {[
                        { title: "From Old PC to High-Performance Build", className: "grid-img1", button: true },
                        { title: "Gaming Setup Upgrade", stars: true, dark: true },
                        { title: "How I Built My Dream Gaming PC", className: "grid-img2", button: true },
                        { title: "More Than Just Components", className: "grid-img3", button: true, stars: true },
                        { title: "Customer Review Spotlight", stars: true, dark: true },
                        { title: "Finally a Store I Can Trust", className: "grid-img4", button: true },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className={`rounded-lg p-5 flex flex-col justify-between gap-3 min-h-[160px] ${
                                item.dark
                                    ? 'bg-[#055D62] text-[#ECE2CD]'
                                    : `grid-card text-[#ECE2CD] ${item.className || ''}`
                            }`}
                        >
                            <div className="font-bold text-base">{item.title}</div>
                            {item.stars && <div className="flex gap-1">{stars}</div>}
                            {item.button && (
                                <button className="btn-primary small-btn self-start px-4">Read More</button>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

export default Review