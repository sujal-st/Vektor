import React, { useState } from 'react'
import { useLocation, useNavigate, redirect, useActionData } from 'react-router'
import type { Route } from './+types/checkout'
import type { CartType } from '~/types'
import { FaTruck, FaLock, FaChevronDown, FaChevronUp } from 'react-icons/fa'

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();

    const cookieHeader = request.headers.get('Cookie') ?? '';
    const token = cookieHeader
        .split(';')
        .find(c => c.trim().startsWith('token='))
        ?.split('=')[1];

    if (!token) return { error: 'Login required to place an order' };

    const rawItems = JSON.parse(formData.get('items') as string);

    // strip extra fields to match OrderItem backend model
    const items = rawItems.map((item: any) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        img: item.img,
        category: item.category,
        quantity: item.quantity,
        admin_id: item.admin_id ?? null
    }));

    const shipping_info = {
        full_name: formData.get('full_name'),
        address: formData.get('address'),  // ← matches backend ShippingInfo
        city: formData.get('city'),
        phone: formData.get('phone'),
    };

    const payment_method = formData.get('payment_method');

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ items, shipping_info, payment_method })
    });

    const data = await res.json();
    console.log("order response:", data);  // ← add for debugging

    if (!res.ok) {
        return { error: data.detail }
    }

    return redirect(`/my-orders/${data.order.id}`);
}

function Checkout() {
    const location = useLocation();
    const navigate = useNavigate();
    const items: CartType[] = location.state?.items ?? [];
    const actionData = useActionData() as { error?:string }

    const [orderSummaryOpen, setOrderSummaryOpen] = useState(true);

    if (items.length === 0) {
        return (
            <div className='max-w-3xl mx-auto p-5 text-center'>
                <h1 className='text-3xl font-bold mb-4'>Checkout</h1>
                <p className='text-gray-500 font-semibold'>No items selected for checkout.</p>
                <button
                    onClick={() => navigate('/cart')}
                    className='mt-4 px-4 py-2 bg-[#AB2320] text-white font-bold rounded-md cursor-pointer'
                >
                    Back to Cart
                </button>
            </div>
        )
    }

    const totalPrice = Math.ceil(
        items.reduce((sum, p) => sum + p.price * 145 * p.quantity, 0)
    );

    return (
        <section className='max-w-5xl mx-auto p-5 mt-5'>
            <h1 className='text-3xl font-bold mb-8'>Checkout</h1>
            {actionData?.error && (
                <p className='text-red-500 font-semibold text-center mb-4'>{actionData.error}</p>
            )}
            <div className='flex flex-col lg:flex-row gap-8'>

                {/* left - form */}
                <div className='flex-1'>
                    <form method='post' className='flex flex-col gap-6'>

                        {/* hidden items field */}
                        <input type='hidden' name='items' value={JSON.stringify(items)} />

                        {/* shipping info */}
                        <div className='bg-white p-6 rounded-lg shadow-sm flex flex-col gap-4'>
                            <div className='flex items-center gap-2 mb-2'>
                                <FaTruck className='text-[#AB2320]' size={20} />
                                <h2 className='font-bold text-xl'>Shipping Information</h2>
                            </div>

                            <div className='flex flex-col gap-1'>
                                <label className='font-semibold text-sm'>Full Name</label>
                                <input
                                    type='text'
                                    name='full_name'
                                    required
                                    placeholder='John Doe'
                                    className='border-[3px] border-white rounded bg-[#FAF8F4] shadow py-2 px-4 focus:border-[#AB2320] outline-none'
                                />
                            </div>

                            <div className='flex flex-col gap-1'>
                                <label className='font-semibold text-sm'>Address</label>
                                <input
                                    type='text'
                                    name='address'
                                    required
                                    placeholder='123 Main Street'
                                    className='border-[3px] border-white rounded bg-[#FAF8F4] shadow py-2 px-4 focus:border-[#AB2320] outline-none'
                                />
                            </div>

                            <div className='flex gap-4'>
                                <div className='flex flex-col gap-1 flex-1'>
                                    <label className='font-semibold text-sm'>City</label>
                                    <input
                                        type='text'
                                        name='city'
                                        required
                                        placeholder='Kathmandu'
                                        className='border-[3px] border-white rounded bg-[#FAF8F4] shadow py-2 px-4 focus:border-[#AB2320] outline-none'
                                    />
                                </div>
                                <div className='flex flex-col gap-1 flex-1'>
                                    <label className='font-semibold text-sm'>Phone</label>
                                    <input
                                        type='tel'
                                        name='phone'
                                        required
                                        placeholder='98XXXXXXXX'
                                        className='border-[3px] border-white rounded bg-[#FAF8F4] shadow py-2 px-4 focus:border-[#AB2320] outline-none'
                                    />
                                </div>
                            </div>
                        </div>

                        {/* payment method */}
                        <div className='bg-white p-6 rounded-lg shadow-sm flex flex-col gap-4'>
                            <div className='flex items-center gap-2 mb-2'>
                                <FaLock className='text-[#AB2320]' size={20} />
                                <h2 className='font-bold text-xl'>Payment Method</h2>
                            </div>

                            <div className='flex flex-col gap-3'>
                                {[
                                    { value: 'cash_on_delivery', label: 'Cash on Delivery' },
                                    { value: 'esewa', label: 'eSewa' },
                                    { value: 'khalti', label: 'Khalti' },
                                ].map((method) => (
                                    <label
                                        key={method.value}
                                        className='flex items-center gap-3 p-3 border-2 border-gray-100 rounded-lg cursor-pointer hover:border-[#AB2320] transition'
                                    >
                                        <input
                                            type='radio'
                                            name='payment_method'
                                            value={method.value}
                                            required
                                            className='accent-[#AB2320] w-4 h-4'
                                        />
                                        <span className='font-semibold'>{method.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            type='submit'
                            className='w-full py-3 bg-[#AB2320] text-white font-bold rounded-lg cursor-pointer hover:bg-[#8a1b18] transition text-lg'
                        >
                            Place Order · Rs. {totalPrice}
                        </button>
                    </form>
                </div>

                {/* right - order summary */}
                <div className='lg:w-96'>
                    <div className='bg-white p-6 rounded-lg shadow-sm sticky top-20'>
                        <button
                            onClick={() => setOrderSummaryOpen(prev => !prev)}
                            className='w-full flex items-center justify-between mb-4 cursor-pointer'
                        >
                            <h2 className='font-bold text-xl'>
                                Order Summary ({items.length} items)
                            </h2>
                            {orderSummaryOpen ? <FaChevronUp /> : <FaChevronDown />}
                        </button>

                        {orderSummaryOpen && (
                            <div className='flex flex-col gap-3 mb-4'>
                                {items.map((item) => (
                                    <div key={item.id} className='flex items-center gap-3'>
                                        <img
                                            src={`${import.meta.env.VITE_API_URL}${item.img}`}
                                            alt={item.title}
                                            className='w-14 h-14 object-contain rounded bg-gray-100 p-1'
                                        />
                                        <div className='flex-1'>
                                            <p className='font-semibold text-sm line-clamp-1'>{item.title}</p>
                                            <p className='text-gray-500 text-sm'>Qty: {item.quantity}</p>
                                        </div>
                                        <span className='font-bold text-[#AB2320] text-sm'>
                                            Rs. {Math.ceil(item.price * 145 * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className='border-t pt-4 flex flex-col gap-2'>
                            <div className='flex justify-between text-gray-500'>
                                <span>Subtotal</span>
                                <span>Rs. {totalPrice}</span>
                            </div>
                            <div className='flex justify-between text-gray-500'>
                                <span>Shipping</span>
                                <span className='text-green-500 font-semibold'>Free</span>
                            </div>
                            <div className='flex justify-between font-bold text-lg mt-2'>
                                <span>Total</span>
                                <span className='text-[#AB2320]'>Rs. {totalPrice}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Checkout