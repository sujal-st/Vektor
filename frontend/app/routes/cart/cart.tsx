import React, { useContext, useEffect, useState } from 'react'
import type { Route } from '../layouts/+types/Main';
import { cartContext } from '~/contexts/cartContext';
import CartCard from '~/components/cartCard';
import { useNavigate } from 'react-router';
import type { CartType } from '~/types';

function Cart() {
    const { cart } = useContext(cartContext);
    const navigate = useNavigate();

    const [selectedItems, setSelectedItems] = useState<string[]>([]);  
    const [totalPrice, setTotalPrice] = useState(0);

    // calculate total only for selected items
    useEffect(() => {
        const total = cart
            .filter(p => selectedItems.includes(p.id))  
            .reduce((sum, p) => sum + p.price * 145 * p.quantity, 0);
        setTotalPrice(Math.ceil(total));
    }, [cart, selectedItems])

    const handleSelect = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)  
                : [...prev, id]               
        )
    }

    const handleSelectAll = () => {
        if (selectedItems.length === cart.length) {
            setSelectedItems([]);  // deselect all
        } else {
            setSelectedItems(cart.map(p => p.id));  // select all
        }
    }

    const handleCheckout = () => {
        if (selectedItems.length === 0) return;

        const itemsToOrder = cart.filter(p => selectedItems.includes(p.id));
        // pass selected items to checkout page via navigation state
        navigate('/checkout', { state: { items: itemsToOrder } });
    }

    return (
        <section className='max-w-3xl mx-auto p-5'>
            <h1 className='text-3xl text-center mb-5 font-bold'>My Cart</h1>

            {cart.length === 0 && (
                <p className='font-semibold text-center text-xl text-gray-500'>No products added!!</p>
            )}

            {cart.length > 0 && (
                <>
                    {/* select all checkbox */}
                    <div className='flex items-center gap-2 mb-3'>
                        <input
                            type='checkbox'
                            id='selectAll'
                            checked={selectedItems.length === cart.length}
                            onChange={handleSelectAll}
                            className='w-4 h-4 cursor-pointer'
                        />
                        <label htmlFor='selectAll' className='cursor-pointer font-semibold'>
                            Select All ({selectedItems.length}/{cart.length})
                        </label>
                    </div>

                    <div className='grid grid-cols-1 gap-2'>
                        {cart.map((p) => (
                            <div key={p.id} className='flex items-center gap-3'>
                                {/* individual checkbox */}
                                <input
                                    type='checkbox'
                                    checked={selectedItems.includes(p.id)}
                                    onChange={() => handleSelect(p.id)}
                                    className='w-4 h-4 cursor-pointer'
                                />
                                <div className='flex flex-col'>
                                    <CartCard product={p} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className='flex justify-between items-center mt-4'>
                        <span className='font-semibold text-xl'>Total Price</span>
                        <span className='font-bold text-[#AB2320]'>Rs. {totalPrice}</span>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={selectedItems.length === 0}
                        className='w-full mt-4 px-4 py-2 bg-[#AB2320] text-white font-bold rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        Checkout ({selectedItems.length} items)
                    </button>
                </>
            )}
        </section>
    )
}

export default Cart