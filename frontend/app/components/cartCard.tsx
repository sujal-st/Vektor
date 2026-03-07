import React, { useContext, useState } from 'react'
import type { CartType } from '~/types'
import { FaShoppingCart, FaTrash } from 'react-icons/fa'
import { cartContext } from '~/contexts/cartContext';
import { getToken } from '~/utils/getToken';
import { saveCartTODB } from '~/utils/saveCartToDB';
import QuantityRange from './QuantityRange';
import { getImageUrl } from '~/utils/getImageUrl';

type PropType = {
    product: CartType;
}

function cartCard({ product }: PropType) {
    const { cart, setCart, removeFromCart } = useContext(cartContext);
    const [quantity, setQuantity] = useState(product.quantity)

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        let updatedCart: CartType[];
        const existing = cart.find((p) => p.id === product.id);
        if (existing) {
            updatedCart = cart.filter((p) => p.id != product.id);
        } else {
            updatedCart = [...cart, { ...product, quantity: 1 }]
        }
        setCart(updatedCart)
        await saveCartTODB(updatedCart);
    }

    const updateQuantityInCart = async (newQty: number) => {
        const updatedCart = cart.map(p => p.id === product.id ? { ...p, quantity: newQty } : p);
        setCart(updatedCart);
        await saveCartTODB(updatedCart);
    }

    const handleDecrease = () => {
        if (quantity > 1) {
            const newQty = quantity - 1;
            setQuantity(newQty);
            updateQuantityInCart(newQty);
        }
    }

    const handleIncrease = () => {
        if (quantity < product.stock) {
            const newQty = quantity + 1;
            setQuantity(newQty);
            updateQuantityInCart(newQty);
        }
    }

    const isInCart = cart.some(p => p.id === product.id);

    return (
        <div className='w-full p-4 bg-white rounded-sm shadow-sm flex flex-col gap-4 hover:shadow-md transition duration-200'>

            {/* Top row — image + title + price */}
            <div className='flex items-start gap-3'>
                <div className='w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0'>
                    <img
                        src={getImageUrl(product.img)}
                        alt={product.title}
                        className='w-full h-full object-contain'
                    />
                </div>
                <div className='flex flex-col flex-1 min-w-0 gap-1'>
                    <h3 className='text-base sm:text-lg font-bold line-clamp-1'>{product.title}</h3>
                    <span className='px-2 py-0.5 text-xs text-white font-semibold rounded-sm bg-[#00878f] w-fit'>{product.category}</span>
                    <span className='text-[#AB2320] text-base sm:text-lg font-bold'>
                        Rs. {Math.ceil(product.price * 145 * quantity)}
                    </span>
                </div>
            </div>

            {/* Bottom row — quantity + remove button */}
            <div className='flex items-center justify-between gap-3 flex-wrap'>
                <QuantityRange
                    productStock={product?.stock}
                    handleIncrease={handleIncrease}
                    handleDecrease={handleDecrease}
                    quantity={quantity}
                />
                <button
                    className='flex items-center gap-2 px-3 py-2 bg-[#AB2320] text-[#F6F1E6] font-bold rounded-md cursor-pointer text-sm transition'
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        isInCart ? removeFromCart(product.id, getToken()) : handleAddToCart(e)
                    }}
                >
                    <FaTrash size={12} />
                    <span className='hidden sm:inline'>Remove</span>
                </button>
            </div>
        </div>
    )
}

export default cartCard