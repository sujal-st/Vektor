

import { FaPlus, FaMinus } from 'react-icons/fa'
import React, { useState } from 'react'


function FAQ() {
    const [hiddenStatus, setHiddenStatus] = useState([true, true, true, true, true])

    const questions = [
        {
            id: 1,
            title: "Do the products come with a warranty?",
            answer: "Yes! All our PC components come with official manufacturer warranties. Warranty duration varies by product and brand, and full details are provided on each product page. You can also contact our support team for assistance with warranty claims.",
            status: hiddenStatus
        },

        {
            id: 2,
            title: "How long does shipping take?",
            answer: "Shipping times depend on your location and the selected delivery method. Standard delivery typically takes 3–7 business days, while express shipping options are available for faster delivery. You’ll receive tracking details once your order is shipped.",
            status: hiddenStatus
        },

        {
            id: 3,
            title: "Are the components compatible with my PC?",
            answer: "Each product page includes detailed specifications to help you check compatibility. You can compare socket types, RAM support, PSU requirements, and other technical details. If you're unsure, our support team is happy to help you choose the right components.",
            status: hiddenStatus
        },

        {
            id: 4,
            title: "Do you offer pre-built PCs or only individual components?",
            answer: "We offer both! You can purchase individual components like CPUs, GPUs, RAM, and storage devices, or choose from our professionally assembled pre-built PCs designed for gaming, productivity, and content creation.",
            status: hiddenStatus
        },

        {
            id: 5,
            title: "What is your return and refund policy?",
            answer: "We provide a 7-day return policy for eligible products. If your item arrives damaged, defective, or doesn’t meet your expectations, you can request a return or replacement. Please ensure the product is in its original condition and packaging.",
            status: hiddenStatus
        }
    ]



    const toggle = (i: number) => {
        const newstate = [...hiddenStatus]
        newstate[i] = !newstate[i]
        setHiddenStatus(newstate)
    }
    return (
        <div className='fAQ-section my-20 mx-auto flex max-w-fit flex-col gap-5 justify-center'>

            <h2 className='section-title text-2xl md:text-3xl text-center font-bold'>Frequently Asked Questions</h2>
            <div className="description-fAQ text-center w-1/2 mx-auto">Have questions before you start learning? Here are the answers to the most common things learners ask us. If you don’t find what you’re looking for, feel free to reach out to our support team.</div>

            <div className='flex flex-row items-center justify-center gap-2.5 m-x-auto  fAQ-main-frame'>

                <div className="FAQ-frame flex flex-col justify-center items-stretch gap-5">
                    {questions.map((q, key = q.id) => {
                        return (

                            <div className='bg-[#055D62] text-[#ECE2CD] w-[90%] self-center rounded-sm flex flex-col justify-center gap-1' key={key}>

                                <div className='my-2 mx-4 flex items-center justify-between gap-3 px-1 transition'>
                                    <div className='font-semibold'>
                                        {q.title}
                                    </div>
                                    {hiddenStatus[key] ?
                                        <FaPlus className='cursor-pointer' onClick={() => { toggle(key) }} />
                                        :
                                        <FaMinus className='cursor-pointer' onClick={() => { toggle(key) }} />
                                    }
                                </div>

                                <div className={`px-4 overflow-hidden transition-transform duration-500 ease-in-out ${hiddenStatus[key] ? 'max-h-0 opacity-0' : 'max-h-250 opacity-100'}`}>{q.answer}</div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default FAQ
