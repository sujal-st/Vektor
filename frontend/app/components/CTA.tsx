import React from 'react'

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
                        <button className="btn-primary">Get Started</button>
                        <button className="btn-secondary">Sign Up For Free</button>
                    </div>
                </div>
            </section>
  )
}

export default CTA
