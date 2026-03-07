import { useLoaderData, useNavigate } from 'react-router'
import type { Route } from './+types/sellerdash'
import {
    FaBox, FaClock, FaCheckCircle, FaTruck, FaTimesCircle,
    FaUser, FaEnvelope, FaShoppingBag, FaPlus, FaChartLine,
    FaStore, FaEdit, FaTrash
} from 'react-icons/fa'
import { getImageUrl } from '~/utils/getImageUrl'

type OrderItem = {
    id: string
    title: string
    price: number
    img: string
    quantity: number
    item_status: string
    admin_id: string
}

type SellerOrder = {
    id: string
    user_id: string
    items: OrderItem[]
    shipping_info: {
        full_name: string
        address: string
        city: string
        phone: string
    }
    total_price: number
    order_status: string
    payment_method: string
    created_at: string
}

type Product = {
    id: string
    title: string
    price: number
    img: string
    category: string
    stock: number
    featured: boolean
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

    if (!token || !userCookie) return { user: null, orders: [], products: [] };

    const user: User = JSON.parse(decodeURIComponent(userCookie));

    if (!user.is_admin) return { user, orders: [], products: [] };

    const [ordersRes, productsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/orders/seller/my-orders`, {
            headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/products/my-products`, {
            headers: { Authorization: `Bearer ${token}` }
        })
    ]);

    const orders = ordersRes.ok ? await ordersRes.json() : [];
    const products = productsRes.ok ? await productsRes.json() : [];

    return { user, orders, products };
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const intent = formData.get('intent');

    const cookieHeader = request.headers.get('Cookie') ?? '';
    const token = cookieHeader.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];

    if (!token) return { error: 'Unauthorized' };

    if (intent === 'delete_product') {
        const product_id = formData.get('product_id');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${product_id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return { error: 'Failed to delete product' };
        return { success: 'Product deleted' };
    }

    return null;
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

function SellerDash() {
    const { user, orders, products } = useLoaderData() as {
        user: User | null,
        orders: SellerOrder[],
        products: Product[]
    }
    const navigate = useNavigate()

    if (!user) {
        return (
            <div className='max-w-3xl mx-auto p-5 text-center mt-10'>
                <h1 className='text-2xl font-bold mb-2'>Not Logged In</h1>
                <p className='text-gray-500 mb-4'>Please login to view your dashboard.</p>
                <button onClick={() => navigate('/login')}
                    className='px-4 py-2 bg-[#AB2320] text-white font-bold rounded-md cursor-pointer'>
                    Login
                </button>
            </div>
        )
    }

    if (!user.is_admin) {
        return (
            <div className='max-w-3xl mx-auto p-5 text-center mt-10'>
                <FaTimesCircle className='text-red-500 mx-auto mb-4' size={48} />
                <h1 className='text-2xl font-bold mb-2'>Access Denied</h1>
                <p className='text-gray-500 mb-4'>This page is for sellers only.</p>
                <button onClick={() => navigate('/')}
                    className='px-4 py-2 bg-[#AB2320] text-white font-bold rounded-md cursor-pointer'>
                    Go Home
                </button>
            </div>
        )
    }

    const totalRevenue = orders
        .flatMap(o => o.items)
        .filter(i => i.item_status !== 'cancelled')
        .reduce((sum, i) => sum + i.price * i.quantity, 0)

    const pendingOrders = orders.filter(o =>
        o.items.some(i => i.item_status === 'pending')
    ).length

    const deliveredOrders = orders.filter(o =>
        o.items.every(i => i.item_status === 'delivered')
    ).length

    const lowStockProducts = products.filter(p => p.stock <= 5)

    return (
        <section className='max-w-6xl mx-auto p-5 mt-5'>
            <div className='flex items-center justify-between mb-8'>
                <h1 className='text-3xl font-bold'>Seller Dashboard</h1>
                <button
                    onClick={() => navigate('/seller/add-product')}
                    className='flex items-center gap-2 px-4 py-2 bg-[#AB2320] text-white font-bold rounded-lg cursor-pointer hover:bg-[#8a1b18] transition text-sm'
                >
                    <FaPlus size={12} />
                    Add Product
                </button>
            </div>

            {/* stats row */}
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
                {[
                    { label: 'Total Products', value: products.length, icon: <FaBox className='text-blue-500' />, bg: 'bg-blue-50' },
                    { label: 'Total Orders', value: orders.length, icon: <FaShoppingBag className='text-purple-500' />, bg: 'bg-purple-50' },
                    { label: 'Pending Orders', value: pendingOrders, icon: <FaClock className='text-yellow-500' />, bg: 'bg-yellow-50' },
                    { label: 'Total Revenue', value: `Rs. ${Math.ceil(totalRevenue).toLocaleString()}`, icon: <FaChartLine className='text-green-500' />, bg: 'bg-green-50' },
                ].map((stat) => (
                    <div key={stat.label} className='bg-white p-5 rounded-lg shadow-sm'>
                        <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                            {stat.icon}
                        </div>
                        <p className='text-2xl font-bold'>{stat.value}</p>
                        <p className='text-gray-500 text-sm'>{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>

                {/* left col - profile + low stock */}
                <div className='flex flex-col gap-4'>

                    {/* profile */}
                    <div className='bg-white p-6 rounded-lg shadow-sm'>
                        <div className='flex flex-col items-center text-center mb-4'>
                            <div className='w-16 h-16 rounded-full bg-[#AB2320] flex items-center justify-center text-white text-2xl font-bold mb-2'>
                                {user.userName.charAt(0).toUpperCase()}
                            </div>
                            <h2 className='text-lg font-bold'>{user.userName}</h2>
                            <span className='mt-1 text-xs px-2 py-0.5 bg-[#AB2320] text-white rounded-full font-semibold'>
                                Seller
                            </span>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                                <FaUser className='text-[#AB2320]' size={13} />
                                <div>
                                    <p className='text-xs text-gray-500'>Username</p>
                                    <p className='font-semibold text-sm'>{user.userName}</p>
                                </div>
                            </div>
                            <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                                <FaEnvelope className='text-[#AB2320]' size={13} />
                                <div>
                                    <p className='text-xs text-gray-500'>Email</p>
                                    <p className='font-semibold text-sm break-all'>{user.email}</p>
                                </div>
                            </div>
                            <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                                <FaStore className='text-[#AB2320]' size={13} />
                                <div>
                                    <p className='text-xs text-gray-500'>Products Listed</p>
                                    <p className='font-semibold text-sm'>{products.length} products</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* low stock warning */}
                    {lowStockProducts.length > 0 && (
                        <div className='bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-400'>
                            <h3 className='font-bold mb-3 text-yellow-600'>⚠ Low Stock Alert</h3>
                            <div className='flex flex-col gap-2'>
                                {lowStockProducts.map(p => (
                                    <div key={p.id} className='flex items-center justify-between text-sm'>
                                        <span className='text-gray-600 line-clamp-1 flex-1'>{p.title}</span>
                                        <span className='font-bold text-red-500 ml-2'>{p.stock} left</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* right - products + orders */}
                <div className='lg:col-span-2 flex flex-col gap-6'>

                    {/* my products */}
                    <div className='bg-white p-6 rounded-lg shadow-sm'>
                        <div className='flex items-center justify-between mb-4'>
                            <div className='flex items-center gap-2'>
                                <FaStore className='text-[#AB2320]' />
                                <h2 className='font-bold text-lg'>My Products</h2>
                            </div>
                            <span className='text-sm text-gray-500'>{products.length} listed</span>
                        </div>

                        {products.length === 0 ? (
                            <div className='text-center py-8'>
                                <FaBox className='text-gray-300 mx-auto mb-3' size={36} />
                                <p className='text-gray-500 font-semibold text-sm'>No products listed yet</p>
                                <button
                                    onClick={() => navigate('/seller/add-product')}
                                    className='mt-3 px-4 py-2 bg-[#AB2320] text-white font-bold rounded-md cursor-pointer text-sm'
                                >
                                    Add Your First Product
                                </button>
                            </div>
                        ) : (
                            <div className='flex flex-col gap-3 max-h-72 overflow-y-auto pr-1'>
                                {products.map((product) => (
                                    <div key={product.id} className='flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:border-gray-300 transition'>
                                        <img
                                            src={getImageUrl(product.img)}
                                            alt={product.title}
                                            className='w-12 h-12 object-contain rounded bg-gray-100 p-1'
                                        />
                                        <div className='flex-1 min-w-0'>
                                            <p className='font-semibold text-sm line-clamp-1'>{product.title}</p>
                                            <p className='text-gray-500 text-xs capitalize'>{product.category}</p>
                                            <div className='flex items-center gap-2 mt-0.5'>
                                                <span className='text-[#AB2320] font-bold text-xs'>
                                                    Rs. {Math.ceil(product.price)}
                                                </span>
                                                <span className={`text-xs font-semibold ${product.stock <= 5 ? 'text-red-500' : 'text-green-600'}`}>
                                                    {product.stock} in stock
                                                </span>
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <button
                                                onClick={() => navigate(`/seller/edit-product/${product.id}`)}
                                                className='p-2 text-gray-400 hover:text-blue-500 transition cursor-pointer'
                                            >
                                                <FaEdit size={14} />
                                            </button>
                                            <form method='post'>
                                                <input type='hidden' name='intent' value='delete_product' />
                                                <input type='hidden' name='product_id' value={product.id} />
                                                <button
                                                    type='submit'
                                                    className='p-2 text-gray-400 hover:text-red-500 transition cursor-pointer'
                                                    onClick={(e) => {
                                                        if (!confirm('Delete this product?')) e.preventDefault()
                                                    }}
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* seller orders */}
                    <div className='bg-white p-6 rounded-lg shadow-sm'>
                        <div className='flex items-center gap-2 mb-4'>
                            <FaShoppingBag className='text-[#AB2320]' />
                            <h2 className='font-bold text-lg'>Orders for My Products</h2>
                            <span className='ml-auto text-sm text-gray-500'>{orders.length} orders</span>
                        </div>

                        {orders.length === 0 ? (
                            <div className='text-center py-8'>
                                <FaShoppingBag className='text-gray-300 mx-auto mb-3' size={36} />
                                <p className='text-gray-500 font-semibold text-sm'>No orders yet</p>
                            </div>
                        ) : (
                            <div className='flex flex-col gap-3 max-h-96 overflow-y-auto pr-1'>
                                {orders.map((order) => (
                                    <div
                                        key={order.id}
                                        onClick={() => navigate(`/seller/orders/${order.id}`)}
                                        className='border border-gray-100 rounded-lg p-4 hover:border-[#AB2320] hover:shadow-sm transition cursor-pointer'
                                    >
                                        <div className='flex items-center justify-between mb-2'>
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

                                        {/* only show seller's items */}
                                        <div className='flex items-center gap-2 mb-2'>
                                            {order.items.slice(0, 3).map((item) => (
                                                <img
                                                    key={item.id}
                                                    src={getImageUrl(item.img)}
                                                    alt={item.title}
                                                    className='w-10 h-10 object-contain rounded bg-gray-100 p-1'
                                                />
                                            ))}
                                            {order.items.length > 3 && (
                                                <div className='w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500'>
                                                    +{order.items.length - 3}
                                                </div>
                                            )}
                                            <div className='ml-auto text-right'>
                                                <p className='text-xs text-gray-500'>{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                                            </div>
                                        </div>

                                        <div className='flex items-center justify-between'>
                                            <p className='text-xs text-gray-400'>
                                                Customer: {order.shipping_info.full_name}
                                            </p>
                                            <p className='text-xs capitalize text-gray-400'>
                                                {order.payment_method.replace(/_/g, ' ')}
                                            </p>
                                        </div>
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

export default SellerDash