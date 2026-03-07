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

    const cards = [
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
    ]

    return (
        <div>
            <section className="review-section px-4 md:px-0">
                <h2 className='section-title text-2xl md:text-3xl text-center font-bold my-8'>
                    User Testimonials
                </h2>

                {/* Desktop grid layout */}
                <div className="hidden md:block">
                    <div className="review-frame font-bold md:hidden">
                        {cards.map((item, i) => (
                            <div key={i} className={item.className}>
                                <div className="grid-title">{item.title}</div>
                                {item.button && <button className="btn-primary small-btn">Read More</button>}
                                {item.stars && <div className="star flex gap-1">{item.stars}</div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile card layout */}
                <div className="md:hidden flex flex-col gap-4 font-bold">
                    {cards.filter(item => item.button || item.stars).map((item, i) => (
                        <div key={i} className="rounded-xl p-5 bg-white shadow flex flex-col gap-3 justify-between min-h-[140px]">
                            <div className="font-bold text-base">{item.title}</div>
                            {item.stars && <div className="flex gap-1">{item.stars}</div>}
                            {item.button && <button className="btn-primary small-btn self-start">Read More</button>}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

export default Review