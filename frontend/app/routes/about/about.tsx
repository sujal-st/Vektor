import React from 'react'

const milestones = [
    { id: 1, year: "2018", cl: "storyicon1", caption: "Founded as a small local PC parts shop in Kathmandu" },
    { id: 2, year: "2021", cl: "storyicon2", caption: "Expanded online — 10,000+ orders shipped nationwide" },
    { id: 3, year: "2024", cl: "storyicon3", caption: "Now serving 50,000+ PC builders across Nepal" }
]

function MilestoneCard({ year, cl, caption }: { year: string, cl: string, caption: string }) {
    return (
        <div className="storycard flex flex-col items-center px-4 md:px-6 py-6 w-full md:min-h-[300px]">
            <div className={`${cl} mb-3`}></div>
            <div className="text-[#ECE2CD] text-xl md:text-2xl font-bold mb-1">{year}</div>
            <div className="text-[#ECE2CD] text-sm md:text-base font-semibold text-center px-2 w-full md:w-auto">{caption}</div>
        </div>
    )
}

export default function About() {
    return (
        <>
            {/* Hero Section */}
            <section className='mt-10 md:mt-[80px] flex flex-col gap-5 items-center px-4 w-[95vw] md:w-[80vw] mx-auto'>
                <div className='text-center w-full'>
                    <h1 className='text-3xl sm:text-4xl md:text-[3.5rem] font-bold text-center'>About Vektor</h1>
                    <div className="text-center text-base md:text-[1.2rem] mt-2">
                        Your trusted source for premium PC components, custom builds, and expert tech advice — since 2018.
                    </div>
                </div>

                {/* Desktop Gallery */}
                <div className="hidden md:grid gallery-frame w-full h-auto">
                    <div className='grid-frm grid-icon-1'></div>
                    <div className='grid-frm grid-icon-4'></div>
                    <div className='grid-frm grid-icon-2'></div>
                    <div className='grid-frm grid-icon-3'></div>
                </div>

                {/* Mobile Gallery */}
                <div className="md:hidden grid grid-cols-2 gap-3 w-full">
                    {[
                        { img: 'img1.png' },
                        { img: 'img4.png' },
                        { img: 'img2.png' },
                        { img: 'img3.png' },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className={`rounded-lg ${i === 0 || i === 1 ? 'h-40' : 'h-28'}`}
                            style={{
                                background: `linear-gradient(0deg, rgba(111,60,0,0.20) 0%, rgba(111,60,0,0.20) 100%), url("/assets/${item.img}") center/cover no-repeat`
                            }}
                        />
                    ))}
                </div>
            </section>

            {/* Mission Section */}
            <section className='flex flex-col items-start gap-6 md:gap-[1.5rem] w-[90vw] md:w-[80vw] mx-auto my-10'>
                <div className="w-full md:w-auto">
                    <img src="/assets/img5.png" className='rounded-lg w-full object-cover' alt="PC Build station" />
                </div>
                <div className="w-full flex flex-col items-center gap-4">
                    <div>
                        <h2 className='text-2xl sm:text-3xl md:text-[3rem] font-semibold'>Our Mission</h2>
                        <h2 className='text-[#AB2320] text-2xl sm:text-3xl md:text-[3rem] font-semibold'>(Why We Exist)</h2>
                    </div>
                    <div className="text-sm sm:text-base md:text-[1.2rem]">
                        At Vektor, we believe every builder deserves access to genuine, high-performance components at fair prices. Our mission is simple: <span className="highlight">"bring the world's best PC hardware to every builder in Nepal"</span> — whether you're a first-time builder, a competitive gamer, or a professional content creator pushing the limits of your rig.
                    </div>
                </div>
            </section>

            {/* Timeline / Journey Section */}
            <section className='mt-10 md:mt-[5rem] mx-4 md:mx-[80px] flex flex-col justify-center items-center gap-6 md:gap-8'>
                <div className="text-center">
                    <h2 className='text-2xl sm:text-3xl md:text-[3rem] font-semibold'>The</h2>
                    <h2 className='text-2xl sm:text-3xl md:text-[3rem] font-semibold'>Vektor Journey</h2>
                </div>
                <div className="text-sm md:text-base text-[#262626] font-medium w-full md:w-[75%] text-center px-4 md:px-0">
                    Since opening, <span className="highlight">Vektor</span> has grown into a community of
                    <span className="highlight"> 50,000+ PC builders</span> nationwide, supported by
                    <span className="highlight"> 50+ certified tech specialists</span>. With a
                    <span className="highlight"> 4.9-star average rating</span> and over
                    <span className="highlight"> 10,000 five-star reviews</span>, we're proud to power
                    builds that don't just run — they dominate.
                </div>
                {/* Desktop — horizontal */}
                <div className="hidden md:flex flex-row justify-center items-center gap-3 mx-auto">
                    {milestones.map((e, index) => (
                        <React.Fragment key={e.id}>
                            <MilestoneCard {...e} />
                            {index !== milestones.length - 1 && <div className='line'></div>}
                        </React.Fragment>
                    ))}
                </div>

                {/* Mobile — vertical */}
                <div className="md:hidden grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                    {milestones.map((e, index) => (
                        <React.Fragment key={e.id}>
                            <MilestoneCard {...e} />
                            {index !== milestones.length - 1 && (
                                <div className="w-0.5 h-8 border-l-4 border-dotted border-[#055D62] mx-auto" />
                            )}
                        </React.Fragment>
                    ))}
                </div>


            </section>

            {/* Why Choose Us Section */}
            <section className='w-[90vw] mx-auto mb-10 md:mb-[5rem] mt-10'>
                <div className="text-center">
                    <h2 className='text-2xl sm:text-3xl md:text-[3rem] font-semibold'>Why Choose</h2>
                    <h2 className='text-2xl sm:text-3xl md:text-[3rem] font-semibold'>Vektor?</h2>
                    <div className='text-sm md:text-base lg:text-[1.2rem] font-semibold w-full md:w-[75%] mx-auto text-center mt-3'>
                        From AMD to Intel, RTX to RX — we stock only authentic, warranty-backed components.
                        Our in-house build team, free compatibility checks, and lifetime after-sales support
                        make us the go-to for serious builders across Nepal.
                    </div>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-2 lg:flex lg:flex-wrap justify-center gap-4 md:gap-6 mt-8 md:mt-[3rem]">
                    {[
                        { icon: "🔒", title: "100% Authentic", desc: "Every product is sourced directly from authorized distributors with full warranty." },
                        { icon: "🛠️", title: "Free Build Support", desc: "Our tech team helps you pick compatible parts and troubleshoot any issue." },
                        { icon: "🚚", title: "Nationwide Delivery", desc: "Fast, insured shipping to all districts — your parts arrive safe and on time." },
                        { icon: "🔄", title: "Hassle-Free Returns", desc: "Dead on arrival? We replace it, no questions asked, within 7 days." },
                    ].map((card) => (
                        <div
                            key={card.title}
                            className="flex flex-col items-center text-center bg-[#f9f5ef] border border-gray-200 rounded-xl p-4 md:p-6 lg:w-[220px] shadow-sm hover:shadow-md transition"
                        >
                            <div className="text-3xl md:text-4xl mb-2 md:mb-3">{card.icon}</div>
                            <h3 className="font-bold text-sm md:text-lg mb-1 md:mb-2 text-[#AB2320]">{card.title}</h3>
                            <p className="text-xs md:text-sm text-gray-600">{card.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </>
    )
}