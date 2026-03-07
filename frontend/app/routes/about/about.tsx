import React from 'react'

const milestones = [
    { id: 1, year: "2012", cl: "storyicon1", caption: "Founded as a small local PC parts shop in Manila" },
    { id: 2, year: "2018", cl: "storyicon2", caption: "Expanded online — 50,000+ orders shipped nationwide" },
    { id: 3, year: "2024", cl: "storyicon3", caption: "Now serving 500,000+ PC builders across Southeast Asia" }
]

function MilestoneCard({ year, cl, caption }: { year: string, cl: string, caption: string }) {
    return (
        <div className="storycard flex flex-col items-center px-6 py-6 min-w-[180px]">
            <div className={`${cl} mb-3`}></div>
            <div className="text-[#ECE2CD] text-2xl font-bold mb-1">{year}</div>
            <div className="story-caption">{caption}</div>
        </div>
    )
}

export default function About() {
    return (
        <>
            {/* Hero Section */}
            <section className='mt-[80px] about-section flex flex-col gap-[1.25rem] items-center'>
                <div className='h-[20%]'>
                    <h1 className='text-[3.5rem] font-bold text-center'>About Shopify PH</h1>
                    <div className="abt-label text-center text-[1.2rem]">
                        Your trusted source for premium PC components, custom builds, and expert tech advice — since 2012.
                    </div>
                </div>
                <div className="gallery-frame grid w-full h-auto">
                    <div className='grid-frm grid-icon-1'></div>
                    <div className='grid-frm grid-icon-4'></div>
                    <div className='grid-frm grid-icon-2'></div>
                    <div className='grid-frm grid-icon-3'></div>
                </div>
            </section>

            {/* Mission Section */}
            <section className='flex flex-row items-start second-section gap-[1.5rem]'>
                <div className="left-img">
                    <img src="assets/img5.png" className='rounded-[8px]' alt="PC Build station" />
                </div>
                <div className="right-txt flex flex-col justify-center gap-[2rem]">
                    <div className="sub-section">
                        <h2 className='text-[3rem] font-semibold'>Our Mission</h2>
                        <h2 className='text-[#AB2320] text-[3rem] font-semibold'>(Why We Exist)</h2>
                    </div>
                    <div className="sec-body text-[1.2rem]">
                        At Shopify PH, we believe every builder deserves access to genuine, high-performance components at fair prices. Our mission is simple: <span className="highlight">"bring the world's best PC hardware to every builder in the Philippines"</span> — whether you're a first-time builder, a competitive gamer, or a professional content creator pushing the limits of your rig.
                    </div>
                </div>
            </section>

            {/* Timeline / Journey Section */}
            <section className='story-section mt-[5rem]'>
                <div className="section-title text-center">
                    <h2 className='text-[3rem] font-semibold'>The</h2>
                    <h2 className='text-[3rem] font-semibold'>Shopify Journey</h2>
                </div>
                <div className="story-frame flex flex-row justify-center items-center">
                    {milestones.map((e, index) => (
                        <React.Fragment key={e.id}>
                            <MilestoneCard {...e} />
                            {index !== milestones.length - 1 && <div className='line'></div>}
                        </React.Fragment>
                    ))}
                </div>
                <div className="subbody">
                    Since opening, <span className="highlight">Shopify PH</span> has grown into a community of
                    <span className="highlight"> 500,000+ PC builders</span> nationwide, supported by
                    <span className="highlight"> 200+ certified tech specialists</span>. With a
                    <span className="highlight"> 4.9-star average rating</span> and over
                    <span className="highlight"> 80,000 five-star reviews</span>, we're proud to power
                    builds that don't just run — they dominate.
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className='team-section mb-[5rem]'>
                <div className="section-title text-center">
                    <h2 className='text-[3rem] font-semibold'>Why Choose</h2>
                    <h2 className='text-[3rem] font-semibold'>Shopify PH?</h2>
                    <div className='team-subtitle'>
                        From AMD to Intel, RTX to RX — we stock only authentic, warranty-backed components.
                        Our in-house build team, free compatibility checks, and lifetime after-sales support
                        make us the go-to for serious builders across Southeast Asia.
                    </div>
                </div>

                {/* Feature Cards */}
                <div className="flex flex-wrap justify-center gap-6 mt-[3rem]">
                    {[
                        { icon: "🔒", title: "100% Authentic", desc: "Every product is sourced directly from authorized distributors with full warranty." },
                        { icon: "🛠️", title: "Free Build Support", desc: "Our tech team helps you pick compatible parts and troubleshoot any issue." },
                        { icon: "🚚", title: "Nationwide Delivery", desc: "Fast, insured shipping to all provinces — your parts arrive safe and on time." },
                        { icon: "🔄", title: "Hassle-Free Returns", desc: "Dead on arrival? We replace it, no questions asked, within 7 days." },
                    ].map((card) => (
                        <div
                            key={card.title}
                            className="flex flex-col items-center text-center bg-[#f9f5ef] border border-gray-200 rounded-xl p-6 w-[220px] shadow-sm hover:shadow-md transition"
                        >
                            <div className="text-4xl mb-3">{card.icon}</div>
                            <h3 className="font-bold text-lg mb-2 text-[#AB2320]">{card.title}</h3>
                            <p className="text-sm text-gray-600">{card.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </>
    )
}