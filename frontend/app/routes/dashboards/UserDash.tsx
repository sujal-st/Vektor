import { useLoaderData, useNavigate } from 'react-router'
import type { Route } from './+types/userDash'
import { FaBox, FaClock, FaCheckCircle, FaTruck, FaTimesCircle, FaUser, FaEnvelope, FaShoppingBag } from 'react-icons/fa'
import { getImageUrl } from '~/utils/getImageUrl'

type OrderItem = {
    id: string
    title: string
    price: number
    img: string
    quantity: number
    item_status: string
}

type Order = {
    id: string
    items: OrderItem[]
    total_price: number
    order_status: string
    payment_method: string
    created_at: string
}

type User = {
    id: string
    userName: string
    email: string
    is_admin: boolean
}

export async function loader({ request }: Route.LoaderArgs) {
    const cookieHeader = request.headers.get('Cookie') ?? '';
    const token = cookieHeader.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
    const userCookie = cookieHeader.split(';').find(c => c.trim().startsWith('user='))?.split('=').slice(1).join('=');

    if (!token || !userCookie) return { user: null, orders: [] };

    const user: User = JSON.parse(decodeURIComponent(userCookie));

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return { user, orders: [] };

    const orders = await res.json();
    return { user, orders };
}

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

function UserDash() {
    const { user, orders } = useLoaderData() as { user: User | null, orders: Order[] }
    const navigate = useNavigate()

    if (!user) {
        return (
            <div className='max-w-3xl mx-auto p-5 text-center mt-10'>
                <h1 className='text-2xl font-bold mb-2'>Not Logged In</h1>
                <p className='text-gray-500 mb-4'>Please login to view your userDash.</p>
                <button
                    onClick={() => navigate('/login')}
                    className='px-4 py-2 bg-[#AB2320] text-white font-bold rounded-md cursor-pointer'
                >
                    Login
                </button>
            </div>
        )
    }

    const totalSpent = orders
        .filter(o => o.order_status !== 'cancelled')
        .reduce((sum, o) => sum + o.total_price, 0)

    const deliveredCount = orders.filter(o => o.order_status === 'delivered').length
    const pendingCount = orders.filter(o => o.order_status === 'pending').length

    return (
        <section className='max-w-5xl mx-auto p-5 mt-5'>
            <h1 className='text-3xl font-bold mb-8'>My UserDash</h1>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>

                {/* left - user info */}
                <div className='flex flex-col gap-4'>

                    {/* profile card */}
                    <div className='bg-white p-6 rounded-lg shadow-sm'>
                        <div className='flex flex-col items-center text-center mb-6'>
                            <div className='w-20 h-20 rounded-full bg-[#AB2320] flex items-center justify-center text-white text-3xl font-bold mb-3'>
                                {user.userName.charAt(0).toUpperCase()}
                            </div>
                            <h2 className='text-xl font-bold'>{user.userName}</h2>
                            {user.is_admin && (
                                <span className='mt-1 text-xs px-2 py-0.5 bg-[#AB2320] text-white rounded-full font-semibold'>
                                    Admin
                                </span>
                            )}
                        </div>

                        <div className='flex flex-col gap-3'>
                            <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                                <FaUser className='text-[#AB2320]' size={14} />
                                <div>
                                    <p className='text-xs text-gray-500'>Username</p>
                                    <p className='font-semibold text-sm'>{user.userName}</p>
                                </div>
                            </div>
                            <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                                <FaEnvelope className='text-[#AB2320]' size={14} />
                                <div>
                                    <p className='text-xs text-gray-500'>Email</p>
                                    <p className='font-semibold text-sm break-all'>{user.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* stats */}
                    <div className='bg-white p-6 rounded-lg shadow-sm'>
                        <h3 className='font-bold mb-4'>Overview</h3>
                        <div className='flex flex-col gap-3'>
                            <div className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'>
                                <div className='flex items-center gap-2'>
                                    <FaShoppingBag className='text-[#AB2320]' size={14} />
                                    <span className='text-sm text-gray-600'>Total Orders</span>
                                </div>
                                <span className='font-bold'>{orders.length}</span>
                            </div>
                            <div className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'>
                                <div className='flex items-center gap-2'>
                                    <FaCheckCircle className='text-green-500' size={14} />
                                    <span className='text-sm text-gray-600'>Delivered</span>
                                </div>
                                <span className='font-bold text-green-600'>{deliveredCount}</span>
                            </div>
                            <div className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'>
                                <div className='flex items-center gap-2'>
                                    <FaClock className='text-yellow-500' size={14} />
                                    <span className='text-sm text-gray-600'>Pending</span>
                                </div>
                                <span className='font-bold text-yellow-600'>{pendingCount}</span>
                            </div>
                            <div className='flex justify-between items-center p-3 bg-[#FFF5F5] rounded-lg'>
                                <span className='text-sm text-gray-600'>Total Spent</span>
                                <span className='font-bold text-[#AB2320]'>Rs. {Math.ceil(totalSpent).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* right - orders */}
                <div className='lg:col-span-2'>
                    <div className='bg-white p-6 rounded-lg shadow-sm'>
                        <div className='flex items-center gap-2 mb-6'>
                            <FaBox className='text-[#AB2320]' />
                            <h2 className='font-bold text-lg'>My Orders</h2>
                            <span className='ml-auto text-sm text-gray-500'>{orders.length} orders</span>
                        </div>

                        {orders.length === 0 ? (
                            <div className='text-center py-12'>
                                <FaShoppingBag className='text-gray-300 mx-auto mb-3' size={48} />
                                <p className='text-gray-500 font-semibold'>No orders yet</p>
                                <button
                                    onClick={() => navigate('/products')}
                                    className='mt-4 px-4 py-2 bg-[#AB2320] text-white font-bold rounded-md cursor-pointer text-sm'
                                >
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            <div className='flex flex-col gap-4'>
                                {orders.map((order) => (
                                    <div
                                        key={order.id}
                                        onClick={() => navigate(`/my-orders/${order.id}`)}
                                        className='border border-gray-100 rounded-lg p-4 hover:border-[#AB2320] hover:shadow-sm transition cursor-pointer'
                                    >
                                        {/* order header */}
                                        <div className='flex items-center justify-between mb-3'>
                                            <div>
                                                <p className='font-semibold text-sm'>#{order.id.slice(-8).toUpperCase()}</p>
                                                <p className='text-gray-500 text-xs'>
                                                    {new Date(order.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric', month: 'short', day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <span className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full font-semibold border capitalize ${statusColor[order.order_status]}`}>
                                                {statusIcon[order.order_status]}
                                                {order.order_status}
                                            </span>
                                        </div>

                                        {/* order items preview */}
                                        <div className='flex items-center gap-2 mb-3'>
                                            {order.items.slice(0, 3).map((item) => (
                                                <img
                                                    key={item.id}
                                                    src={getImageUrl(item.img)}
                                                    alt={item.title}
                                                    className='w-12 h-12 object-contain rounded bg-gray-100 p-1'
                                                />
                                            ))}
                                            {order.items.length > 3 && (
                                                <div className='w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500'>
                                                    +{order.items.length - 3}
                                                </div>
                                            )}
                                            <div className='ml-auto text-right'>
                                                <p className='text-xs text-gray-500'>{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                                                <p className='font-bold text-[#AB2320]'>Rs. {Math.ceil(order.total_price * 145).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {/* payment method */}
                                        <p className='text-xs text-gray-400 capitalize'>
                                            {order.payment_method.replace(/_/g, ' ')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default UserDash