import React, { useContext, useEffect, useState } from 'react'
import { cartContext } from '~/contexts/cartContext';
import CartCard from '~/components/cartCard';
import { useNavigate } from 'react-router';
import type { CartType } from '~/types';

function Cart() {
    const { cart } = useContext(cartContext);
    const navigate = useNavigate();

    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        const total = cart
            .filter(p => selectedItems.includes(p.id))
            .reduce((sum, p) => sum + p.price * 145 * p.quantity, 0);
        setTotalPrice(Math.ceil(total));
    }, [cart, selectedItems])

    const handleSelect = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const handleSelectAll = () => {
        if (selectedItems.length === cart.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cart.map(p => p.id));
        }
    }

    const handleCheckout = () => {
        if (selectedItems.length === 0) return;
        const itemsToOrder = cart.filter(p => selectedItems.includes(p.id));
        navigate('/checkout', { state: { items: itemsToOrder } });
    }

    return (
        <section className='max-w-3xl mx-auto px-4 py-6 md:p-5'>
            <h1 className='text-2xl md:text-3xl text-center mb-5 font-bold'>My Cart</h1>

            {cart.length === 0 && (
                <p className='font-semibold text-center text-lg md:text-xl text-gray-500'>
                    No products added!
                </p>
            )}

            {cart.length > 0 && (
                <>
                    {/* select all */}
                    <div className='flex items-center gap-2 mb-3 px-1'>
                        <input
                            type='checkbox'
                            id='selectAll'
                            checked={selectedItems.length === cart.length}
                            onChange={handleSelectAll}
                            className='w-4 h-4 cursor-pointer'
                        />
                        <label htmlFor='selectAll' className='cursor-pointer font-semibold text-sm md:text-base'>
                            Select All ({selectedItems.length}/{cart.length})
                        </label>
                    </div>

                    <div className='flex flex-col gap-3'>
                        {cart.map((p) => (
                            <div key={p.id} className='flex items-start gap-2 md:gap-3'>
                                <input
                                    type='checkbox'
                                    checked={selectedItems.includes(p.id)}
                                    onChange={() => handleSelect(p.id)}
                                    className='w-4 h-4 cursor-pointer bg-[#AB2320] mt-5 flex-shrink-0'
                                />
                                <div className='flex-1 min-w-0'>
                                    <CartCard product={p} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* total + checkout sticky on mobile */}
                    <div className='sticky bottom-0 bg-[#F6F1E6] pt-3 pb-4 mt-4 border-t border-gray-200'>
                        <div className='flex justify-between items-center mb-3 px-1'>
                            <span className='font-semibold text-base md:text-xl'>Total Price</span>
                            <span className='font-bold text-[#AB2320] text-base md:text-xl'>
                                Rs. {totalPrice}
                            </span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={selectedItems.length === 0}
                            className='w-full px-4 py-3 bg-[#AB2320] text-white font-bold rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base'
                        >
                            Checkout ({selectedItems.length} items)
                        </button>
                    </div>
                </>
            )}
        </section>
    )
}

export default Cart