import React from 'react'
import {
    FaUsers,
    FaThumbsUp,
    FaStar,
    FaMicrochip
} from "react-icons/fa";
function Stats() {
    const stats = [
        {
            id: 1,
            icon: <FaUsers />,
            value: "20K+",
            label: "Happy Customers"
        },

        {
            id: 2,
            icon: <FaThumbsUp />,   // Better than check circle for rating
            value: "98%",
            label: "Positive Customer Rating"
        },

        {
            id: 3,
            icon: <FaStar />,
            value: "25K+",
            label: "5-Star Reviews"
        },

        {
            id: 4,
            icon: <FaMicrochip />,  // More relevant for PC components
            value: "500+",
            label: "Premium PC Components Available"
        }
    ];
    return (
        <section className="py-16 text-center font-bold display">
            <h2

                className="text-2xl md:text-3xl font-bold mb-12"
            >
                Powering Thousands of Builds
            </h2>

            <div

                className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto"
            >
                {stats.map(stat => (
                    <div
                        key={stat.id}
                        className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center gap-3 hover:scale-105 transition"
                    >
                        <div className="text-4xl icon-color">{stat.icon}</div>
                        <h3 className="text-2xl font-extrabold">{stat.value}</h3>
                        <p className="text-gray-600">{stat.label}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default Stats
