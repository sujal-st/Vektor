import { useLoaderData, useNavigate } from 'react-router'
import type { Route } from './+types/orderdetails'
import { FaCheckCircle, FaTruck, FaBox, FaClock, FaTimesCircle } from 'react-icons/fa'
import { getImageUrl } from '~/utils/getImageUrl'

type OrderItem = {
    id: string
    title: string
    price: number
    img: string
    category: string
    quantity: number
    admin_id: string | null
    item_status: string
}

type Order = {
    id: string
    user_id: string
    items: OrderItem[]
    shipping_info: {
        full_name: string
        address: string
        city: string
        phone: string
    }
    payment_method: string
    total_price: number
    order_status: string
    created_at: string
}

export async function loader({ request, params }: Route.LoaderArgs) {
    const cookieHeader = request.headers.get('Cookie') ?? '';
    const token = cookieHeader
        .split(';')
        .find(c => c.trim().startsWith('token='))
        ?.split('=')[1];

    if (!token) return { order: null, error: 'Login required' };

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return { order: null, error: 'Order not found' };

    const order = await res.json();
    return { order, error: null };
}

const statusSteps = ['pending', 'confirmed', 'shipped', 'delivered'];

const statusIcon: Record<string, JSX.Element> = {
    pending: <FaClock className='text-yellow-500' size={20} />,
    confirmed: <FaCheckCircle className='text-blue-500' size={20} />,
    shipped: <FaTruck className='text-purple-500' size={20} />,
    delivered: <FaCheckCircle className='text-green-500' size={20} />,
    cancelled: <FaTimesCircle className='text-red-500' size={20} />,
}

const statusColor: Record<string, string> = {
    pending: 'text-yellow-500 bg-yellow-50',
    confirmed: 'text-blue-500 bg-blue-50',
    shipped: 'text-purple-500 bg-purple-50',
    delivered: 'text-green-500 bg-green-50',
    cancelled: 'text-red-500 bg-red-50',
}

function OrderDetails() {
    const { order, error } = useLoaderData() as { order: Order | null, error: string | null };
    const navigate = useNavigate();

    if (error || !order) {
        return (
            <div className='max-w-3xl mx-auto p-5 text-center mt-10'>
                <FaTimesCircle className='text-red-500 mx-auto mb-4' size={48} />
                <h1 className='text-2xl font-bold mb-2'>Order Not Found</h1>
                <p className='text-gray-500 mb-4'>{error}</p>
                <button
                    onClick={() => navigate('/orders/my-orders')}
                    className='px-4 py-2 bg-[#AB2320] text-white font-bold rounded-md cursor-pointer'
                >
                    Back to My Orders
                </button>
            </div>
        )
    }

    const currentStep = statusSteps.indexOf(order.order_status);

    return (
        <section className='max-w-4xl mx-auto p-5 mt-5'>

            {/* header */}
            <div className='flex items-center justify-between mb-8'>
                <div>
                    <h1 className='text-3xl font-bold'>Order Details</h1>
                    <p className='text-gray-500 text-sm mt-1'>Order ID: #{order.id}</p>
                    <p className='text-gray-500 text-sm'>
                        Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric'
                        })}
                    </p>
                </div>
                <span className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm capitalize ${statusColor[order.order_status]}`}>
                    {statusIcon[order.order_status]}
                    {order.order_status}
                </span>
            </div>

            {/* order status tracker (hidden if cancelled) */}
            {order.order_status !== 'cancelled' && (
                <div className='bg-white p-6 rounded-lg shadow-sm mb-6'>
                    <h2 className='font-bold text-lg mb-6'>Order Progress</h2>
                    <div className='flex items-center justify-between relative'>
                        {/* progress line */}
                        <div className='absolute top-5 left-0 right-0 h-1 bg-gray-200 z-0'>
                            <div
                                className='h-full bg-[#AB2320] transition-all duration-500'
                                style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
                            />
                        </div>

                        {statusSteps.map((step, index) => (
                            <div key={step} className='flex flex-col items-center z-10 gap-2'>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all
                                    ${index <= currentStep
                                        ? 'bg-[#AB2320] border-[#AB2320] text-white'
                                        : 'bg-white border-gray-300 text-gray-400'
                                    }`}
                                >
                                    {index < currentStep ? '✓' : index + 1}
                                </div>
                                <span className={`text-xs font-semibold capitalize ${index <= currentStep ? 'text-[#AB2320]' : 'text-gray-400'}`}>
                                    {step}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>

                {/* left - items */}
                <div className='lg:col-span-2 flex flex-col gap-4'>
                    <div className='bg-white p-6 rounded-lg shadow-sm'>
                        <div className='flex items-center gap-2 mb-4'>
                            <FaBox className='text-[#AB2320]' />
                            <h2 className='font-bold text-lg'>Items Ordered</h2>
                        </div>

                        <div className='flex flex-col gap-4'>
                            {order.items.map((item) => (
                                <div key={item.id} className='flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0'>
                                    <img
                                        src={getImageUrl(item.img)}
                                        alt={item.title}
                                        className='w-16 h-16 object-contain rounded bg-gray-100 p-1'
                                    />
                                    <div className='flex-1'>
                                        <p className='font-semibold'>{item.title}</p>
                                        <p className='text-gray-500 text-sm capitalize'>{item.category}</p>
                                        <div className='flex items-center gap-2 mt-1'>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${statusColor[item.item_status]}`}>
                                                {item.item_status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className='text-right'>
                                        <p className='font-bold text-[#AB2320]'>
                                            Rs. {Math.ceil(item.price * 145 * item.quantity)}
                                        </p>
                                        <p className='text-gray-500 text-sm'>Qty: {item.quantity}</p>
                                        <p className='text-gray-400 text-xs'>
                                            Rs. {Math.ceil(item.price * 145)} each
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* total */}
                        <div className='mt-4 pt-4 border-t flex flex-col gap-2'>
                            <div className='flex justify-between text-gray-500'>
                                <span>Subtotal</span>
                                <span>Rs. {Math.ceil(order.total_price * 145)}</span>
                            </div>
                            <div className='flex justify-between text-gray-500'>
                                <span>Shipping</span>
                                <span className='text-green-500 font-semibold'>Free</span>
                            </div>
                            <div className='flex justify-between font-bold text-lg'>
                                <span>Total</span>
                                <span className='text-[#AB2320]'>Rs. {Math.ceil(order.total_price * 145)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* right - shipping + payment */}
                <div className='flex flex-col gap-4'>
                    <div className='bg-white p-6 rounded-lg shadow-sm'>
                        <div className='flex items-center gap-2 mb-4'>
                            <FaTruck className='text-[#AB2320]' />
                            <h2 className='font-bold text-lg'>Shipping Info</h2>
                        </div>
                        <div className='flex flex-col gap-2 text-sm'>
                            <div>
                                <p className='text-gray-500'>Full Name</p>
                                <p className='font-semibold'>{order.shipping_info.full_name}</p>
                            </div>
                            <div>
                                <p className='text-gray-500'>Address</p>
                                <p className='font-semibold'>{order.shipping_info.address}</p>
                            </div>
                            <div>
                                <p className='text-gray-500'>City</p>
                                <p className='font-semibold'>{order.shipping_info.city}</p>
                            </div>
                            <div>
                                <p className='text-gray-500'>Phone</p>
                                <p className='font-semibold'>{order.shipping_info.phone}</p>
                            </div>
                        </div>
                    </div>

                    <div className='bg-white p-6 rounded-lg shadow-sm'>
                        <h2 className='font-bold text-lg mb-4'>Payment</h2>
                        <p className='text-sm text-gray-500'>Method</p>
                        <p className='font-semibold capitalize'>
                            {order.payment_method.replace(/_/g, ' ')}
                        </p>
                    </div>

                    <button
                        onClick={() => navigate(-1)}
                        className='w-full py-2 border-2 border-[#AB2320] text-[#AB2320] font-bold rounded-lg hover:bg-[#AB2320] hover:text-white transition cursor-pointer'
                    >
                        Back
                    </button>
                </div>
            </div>
        </section>
    )
}

export default OrderDetails