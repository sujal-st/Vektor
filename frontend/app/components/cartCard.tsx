import React, { useContext, useState } from 'react'
import type { CartType } from '~/types'
import { FaShoppingCart } from 'react-icons/fa'
import { cartContext } from '~/contexts/cartContext';
import { getToken } from '~/utils/getToken';
import { saveCartTODB } from '~/utils/saveCartToDB';
import QuantityRange from './QuantityRange';

type PropType = {
    product: CartType;
}
function cartCard({ product }: PropType) {
    const { cart, setCart } = useContext(cartContext);
    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        let updatedCart: CartType[];

        const existing = cart.find((p) => p.id === product.id ? true : false);
        if (existing) {
            updatedCart = cart.filter((p) => p.id != product.id);
        }
        else {
            updatedCart = [
                ...cart,
                { ...product, quantity: 1 }
            ]
        }
        setCart(updatedCart)
        await saveCartTODB(updatedCart);
    }
    const [quantity, setQuantity] = useState(product.quantity)

    const updateQuantityInCart= async (newQty: number)=>{
        const updatedCart = cart.map(p=>p.id ===product.id? {...p, quantity: newQty}: p);

        setCart(updatedCart);
        await saveCartTODB(updatedCart);
    }

    const handleDecrease = () => {
        if (quantity > 1) {
            const newQty = quantity-1;
            setQuantity(newQty);
            updateQuantityInCart(newQty);
        }
    }
    const handleIncrease = () => {
        if (quantity < product.stock) {
            const newQty= quantity+1;
            setQuantity(newQty);
            updateQuantityInCart(newQty);
        }
    }

    const isInCart = cart.some(p => p.id === product.id);
    const { removeFromCart } = useContext(cartContext);



    return (
        <div className='min-w-20 p-5 min-h-50 bg-white rounded-sm shadow-sm flex flex-col justify-between gap-5 hover:scale-105 transition duration-200'>
            <div className='flex flex-col space-y-5'>


                <div className='flex items-start gap-5'>
                    <div className='w-20 h-20'>
                        <img src={`http://localhost:8000${product.img}`} alt={product.title} className='w-full h-full object-contain' />
                    </div>
                    <div>
                    <h3 className='text-lg font-bold line-clamp-1 '>{product.title}</h3>
                    <p className='text-md text-gray-500 line-clamp-2'>{product.description}</p>
                    </div>
                </div>
                    <div className='flex justify-between'>
                        <span className='px-2 py-1 text-sm text-white font-semibold rounded-sm bg-[#00878f]'>{product.category}</span>
                        <span className='rounded-sm text-[#AB2320] text-lg font-bold'>Rs. {Math.ceil(product.price * 145 * quantity)}</span>
                    </div>
                <div className='flex justify-between'>

                    <button className='px-4 py-2 bg-[#AB2320] text-[#F6F1E6] font-bold flex justify-center items-center gap-2 rounded-md cursor-pointer transition'
                        onClick={
                            (e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                isInCart ?
                                    removeFromCart(product.id, getToken())
                                    : handleAddToCart(e)
                            }}>
                        <FaShoppingCart />
                        {isInCart ? 'Remove From Cart' : 'Add To Cart'}
                    </button>
                    <QuantityRange productStock={product?.stock} handleIncrease={handleIncrease} handleDecrease={handleDecrease} quantity={quantity} />
                </div>

            </div>
        </div>
    )
}

export default cartCard
