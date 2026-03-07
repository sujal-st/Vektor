import { useLoaderData, useNavigate, useFetcher } from 'react-router'
import type { Route } from './+types/SellerOrderDetails'
import {
    FaBox, FaTruck, FaClock, FaCheckCircle,
    FaTimesCircle, FaUser, FaPhone, FaMapMarkerAlt, FaArrowLeft
} from 'react-icons/fa'
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
    const token = cookieHeader.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
    const userCookie = cookieHeader.split(';').find(c => c.trim().startsWith('user='))?.split('=').slice(1).join('=');

    if (!token || !userCookie) return { order: null, error: 'Login required', sellerId: null };

    const user = JSON.parse(decodeURIComponent(userCookie));
    if (!user.is_admin) return { order: null, error: 'Access denied', sellerId: null };

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/seller/${params.id}`, {
       
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return { order: null, error: 'Order not found', sellerId: user.id };

    const order = await res.json();
    return { order, error: null, sellerId: user.id };
}

export async function action({ request, params }: Route.ActionArgs) {
    const formData = await request.formData();
    const item_id = formData.get('item_id') as string;
    const status = formData.get('status') as string;

    const cookieHeader = request.headers.get('Cookie') ?? '';
    const token = cookieHeader.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];

    if (!token) return { error: 'Unauthorized' };

    const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/${params.id}/item/${item_id}?status=${status}`,
        {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` }
        }
    );

    const data = await res.json();
    if (!res.ok) return { error: data.detail };
    return { success: true };
}

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

const statusColor: Record<string, string> = {
    pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    confirmed: 'text-blue-600 bg-blue-50 border-blue-200',
    shipped: 'text-purple-600 bg-purple-50 border-purple-200',
    delivered: 'text-green-600 bg-green-50 border-green-200',
    cancelled: 'text-red-600 bg-red-50 border-red-200',
}

const statusIcon: Record<string, JSX.Element> = {
    pending: <FaClock size={12} />,
    confirmed: <FaCheckCircle size={12} />,
    shipped: <FaTruck size={12} />,
    delivered: <FaCheckCircle size={12} />,
    cancelled: <FaTimesCircle size={12} />,
}

// individual item row with its own fetcher for instant updates
function OrderItemRow({ item, orderId }: { item: OrderItem, orderId: string }) {
    const fetcher = useFetcher()

    const currentStatus = fetcher.formData
        ? (fetcher.formData.get('status') as string)
        : item.item_status

    const isUpdating = fetcher.state !== 'idle'

    return (
        <div className='flex items-center gap-4 p-4 border border-gray-100 rounded-lg'>
            <img
                src={getImageUrl(item.img)}
                alt={item.title}
                className='w-16 h-16 object-contain rounded bg-gray-100 p-1 flex-shrink-0'
            />

            <div className='flex-1 min-w-0'>
                <p className='font-semibold line-clamp-1'>{item.title}</p>
                <p className='text-gray-500 text-sm capitalize'>{item.category}</p>
                <div className='flex items-center gap-3 mt-1'>
                    <span className='text-[#AB2320] font-bold text-sm'>
                        Rs. {Math.ceil(item.price * item.quantity)}
                    </span>
                    <span className='text-gray-400 text-xs'>Qty: {item.quantity}</span>
                </div>
            </div>

            {/* status updater */}
            <div className='flex flex-col items-end gap-2'>
                <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold border capitalize ${statusColor[currentStatus]}`}>
                    {statusIcon[currentStatus]}
                    {currentStatus}
                </span>

                <fetcher.Form method='post'>
                    <input type='hidden' name='item_id' value={item.id} />
                    <div className='flex items-center gap-2'>
                        <select
                            name='status'
                            defaultValue={currentStatus}
                            className='text-xs border-2 border-gray-200 rounded px-2 py-1 focus:border-[#AB2320] outline-none cursor-pointer'
                            onChange={(e) => {
                                fetcher.submit(
                                    { item_id: item.id, status: e.target.value },
                                    { method: 'post' }
                                )
                            }}
                        >
                            {STATUS_OPTIONS.map(s => (
                                <option key={s} value={s} className='capitalize'>{s}</option>
                            ))}
                        </select>
                        {isUpdating && (
                            <span className='text-xs text-gray-400 animate-pulse'>saving...</span>
                        )}
                    </div>
                </fetcher.Form>
            </div>
        </div>
    )
}

function SellerOrderDetails() {
    const { order, error, sellerId } = useLoaderData() as {
        order: Order | null,
        error: string | null,
        sellerId: string | null
    }
    const navigate = useNavigate()

    if (error || !order) {
        return (
            <div className='max-w-3xl mx-auto p-5 text-center mt-10'>
                <FaTimesCircle className='text-red-500 mx-auto mb-4' size={48} />
                <h1 className='text-2xl font-bold mb-2'>Order Not Found</h1>
                <p className='text-gray-500 mb-4'>{error}</p>
                <button
                    onClick={() => navigate('/seller/dashboard')}
                    className='px-4 py-2 bg-[#AB2320] text-white font-bold rounded-md cursor-pointer'
                >
                    Back to Dashboard
                </button>
            </div>
        )
    }

    // only show items belonging to this seller
    const myItems = order.items.filter(i => i.admin_id === sellerId)

    const myRevenue = myItems
        .filter(i => i.item_status !== 'cancelled')
        .reduce((sum, i) => sum + i.price * i.quantity, 0)

    return (
        <section className='max-w-4xl mx-auto p-5 mt-5'>

            {/* header */}
            <div className='flex items-center gap-4 mb-8'>
                <button
                    onClick={() => navigate('/seller/dashboard')}
                    className='p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer'
                >
                    <FaArrowLeft className='text-gray-600' />
                </button>
                <div>
                    <h1 className='text-3xl font-bold'>Order #{order.id.slice(-8).toUpperCase()}</h1>
                    <p className='text-gray-500 text-sm mt-1'>
                        Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric'
                        })}
                    </p>
                </div>
                <span className={`ml-auto flex items-center gap-1 text-sm px-3 py-1.5 rounded-full font-semibold border capitalize ${statusColor[order.order_status]}`}>
                    {statusIcon[order.order_status]}
                    {order.order_status}
                </span>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>

                {/* left - items */}
                <div className='lg:col-span-2 flex flex-col gap-4'>
                    <div className='bg-white p-6 rounded-lg shadow-sm'>
                        <div className='flex items-center gap-2 mb-4'>
                            <FaBox className='text-[#AB2320]' />
                            <h2 className='font-bold text-lg'>Your Items in This Order</h2>
                            <span className='ml-auto text-sm text-gray-500'>{myItems.length} item{myItems.length > 1 ? 's' : ''}</span>
                        </div>

                        <div className='flex flex-col gap-3'>
                            {myItems.map(item => (
                                <OrderItemRow key={item.id} item={item} orderId={order.id} />
                            ))}
                        </div>

                        {/* revenue from this order */}
                        <div className='mt-4 pt-4 border-t flex justify-between items-center'>
                            <span className='text-gray-500 font-semibold'>Your Revenue</span>
                            <span className='text-[#AB2320] font-bold text-lg'>
                                Rs. {Math.ceil(myRevenue).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* right - customer info */}
                <div className='flex flex-col gap-4'>

                    {/* customer details */}
                    <div className='bg-white p-6 rounded-lg shadow-sm'>
                        <div className='flex items-center gap-2 mb-4'>
                            <FaUser className='text-[#AB2320]' size={14} />
                            <h2 className='font-bold text-lg'>Customer Info</h2>
                        </div>
                        <div className='flex flex-col gap-3'>
                            <div className='flex items-start gap-3 p-3 bg-gray-50 rounded-lg'>
                                <FaUser className='text-gray-400 mt-0.5' size={13} />
                                <div>
                                    <p className='text-xs text-gray-500'>Full Name</p>
                                    <p className='font-semibold text-sm'>{order.shipping_info.full_name}</p>
                                </div>
                            </div>
                            <div className='flex items-start gap-3 p-3 bg-gray-50 rounded-lg'>
                                <FaMapMarkerAlt className='text-gray-400 mt-0.5' size={13} />
                                <div>
                                    <p className='text-xs text-gray-500'>Address</p>
                                    <p className='font-semibold text-sm'>{order.shipping_info.address}</p>
                                    <p className='text-sm text-gray-600'>{order.shipping_info.city}</p>
                                </div>
                            </div>
                            <div className='flex items-start gap-3 p-3 bg-gray-50 rounded-lg'>
                                <FaPhone className='text-gray-400 mt-0.5' size={13} />
                                <div>
                                    <p className='text-xs text-gray-500'>Phone</p>
                                    <p className='font-semibold text-sm'>{order.shipping_info.phone}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* payment */}
                    <div className='bg-white p-6 rounded-lg shadow-sm'>
                        <h2 className='font-bold text-lg mb-3'>Payment</h2>
                        <div className='p-3 bg-gray-50 rounded-lg'>
                            <p className='text-xs text-gray-500'>Method</p>
                            <p className='font-semibold text-sm capitalize'>
                                {order.payment_method.replace(/_/g, ' ')}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/seller/dashboard')}
                        className='w-full py-2 border-2 border-[#AB2320] text-[#AB2320] font-bold rounded-lg hover:bg-[#AB2320] hover:text-white transition cursor-pointer'
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </section>
    )
}

export default SellerOrderDetails