import React, { useState } from 'react'
import { FaPlus, FaMinus } from 'react-icons/fa'
import type { ProductType } from '~/types'

function QuantityRange({handleDecrease, handleIncrease,quantity,productStock}:{handleDecrease:()=>void;handleIncrease:()=>void;quantity:number;productStock:number}) {
    
    return (
        <section className='w-fit flex gap-4 items-center'>
            <button className={`rounded-sm p-4 ${quantity===0?'bg-gray-100 shadow-sm':' bg-white shadow-lg cursor-pointer text-black'}`} onClick={handleDecrease} disabled={quantity>0?false:true}><FaMinus /></button>
            <div>{quantity}</div>
            <button className={`rounded-sm p-4 ${quantity===productStock?'bg-gray-100 shadow-sm':' bg-white shadow-lg cursor-pointer text-black'}`} onClick={handleIncrease} disabled={quantity<productStock?false:true}><FaPlus /></button>
        </section>
    )
}

export default QuantityRange
