import { useLoaderData, useNavigate } from 'react-router'
import type { Route } from './+types/Orders'
import {
    FaShoppingBag, FaSearch, FaFilter, FaChevronDown,
    FaClock, FaCheckCircle, FaTruck, FaTimesCircle, FaTag
} from 'react-icons/fa'
import { getImageUrl } from '~/utils/getImageUrl'
import { useState, useMemo } from 'react'
import type { User } from './SellerDash'

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

export async function loader({ request }: Route.LoaderArgs) {
    const cookieHeader = request.headers.get('Cookie') ?? ''
    const token = cookieHeader.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]
    const userCookie = cookieHeader
        .split(';')
        .find(c => c.trim().startsWith('user='))
        ?.split('=')
        .slice(1)
        .join('=')

    if (!token || !userCookie) return { user: null, orders: [] }

    const user: User = JSON.parse(decodeURIComponent(userCookie))
    if (!user.is_admin) return { user, orders: [] }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/seller/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    const orders: SellerOrder[] = res.ok ? await res.json() : []
    return { user, orders }
}

const statusColor: Record<string, string> = {
    pending:   'text-yellow-600 bg-yellow-50 border-yellow-200',
    confirmed: 'text-blue-600 bg-blue-50 border-blue-200',
    shipped:   'text-purple-600 bg-purple-50 border-purple-200',
    delivered: 'text-green-600 bg-green-50 border-green-200',
    cancelled: 'text-red-600 bg-red-50 border-red-200',
}

const statusIcon: Record<string, React.ReactNode> = {
    pending:   <FaClock size={11} />,
    confirmed: <FaCheckCircle size={11} />,
    shipped:   <FaTruck size={11} />,
    delivered: <FaCheckCircle size={11} />,
    cancelled: <FaTimesCircle size={11} />,
}

const STATUS_OPTIONS = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

type SortOption = 'newest' | 'oldest' | 'revenue_desc' | 'revenue_asc'
const SORT_LABELS: Record<SortOption, string> = {
    newest:       'Newest First',
    oldest:       'Oldest First',
    revenue_desc: 'Revenue: High → Low',
    revenue_asc:  'Revenue: Low → High',
}

function Orders() {
    const { user, orders } = useLoaderData() as {
        user: User | null
        orders: SellerOrder[]
    }
    const navigate = useNavigate()

    const [search, setSearch]           = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [paymentFilter, setPaymentFilter] = useState('all')
    const [sort, setSort]               = useState<SortOption>('newest')

    /* ─── derived stats ─── */
    const totalRevenue = orders
        .flatMap(o => o.items)
        .filter(i => i.item_status !== 'cancelled')
        .reduce((sum, i) => sum + i.price * i.quantity, 0)

    const byStatus = (s: string) => orders.filter(o => o.order_status === s).length

    const paymentMethods = useMemo(
        () => ['all', ...Array.from(new Set(orders.map(o => o.payment_method)))],
        [orders]
    )

    /* ─── filtered list ─── */
    const filtered = useMemo(() => {
        let list = [...orders]

        if (search.trim()) {
            const q = search.toLowerCase()
            list = list.filter(o =>
                o.id.toLowerCase().includes(q) ||
                o.shipping_info.full_name.toLowerCase().includes(q) ||
                o.shipping_info.city.toLowerCase().includes(q) ||
                o.items.some(i => i.title.toLowerCase().includes(q))
            )
        }

        if (statusFilter !== 'all') list = list.filter(o => o.order_status === statusFilter)
        if (paymentFilter !== 'all') list = list.filter(o => o.payment_method === paymentFilter)

        switch (sort) {
            case 'oldest':       list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); break
            case 'newest':       list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break
            case 'revenue_desc': list.sort((a, b) => b.total_price - a.total_price); break
            case 'revenue_asc':  list.sort((a, b) => a.total_price - b.total_price); break
        }

        return list
    }, [orders, search, statusFilter, paymentFilter, sort])

    const hasActiveFilters = search || statusFilter !== 'all' || paymentFilter !== 'all'

    const clearAll = () => {
        setSearch('')
        setStatusFilter('all')
        setPaymentFilter('all')
        setSort('newest')
    }

    /* ─── guards ─── */
    if (!user) {
        return (
            <div className='max-w-3xl mx-auto p-5 text-center mt-10'>
                <h1 className='text-2xl font-bold mb-2'>Not Logged In</h1>
                <p className='text-gray-500 mb-4'>Please login to view your orders.</p>
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

    /* ─── main ─── */
    return (
        <section className='max-w-6xl mx-auto p-5 mt-5'>

            {/* header */}
            <div className='flex items-center justify-between mb-6'>
                <div>
                    <div className='flex items-center gap-1.5 text-xs text-gray-400 mb-1'>
                        <span
                            className='cursor-pointer hover:text-[#AB2320] transition'
                            onClick={() => navigate('/seller/dashboard')}
                        >
                            Dashboard
                        </span>
                        <span>/</span>
                        <span className='text-gray-600 font-medium'>My Orders</span>
                    </div>
                    <h1 className='text-3xl font-bold flex items-center gap-2'>
                        <FaShoppingBag className='text-[#AB2320]' size={22} />
                        My Orders
                    </h1>
                </div>
            </div>

            {/* stat pills */}
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5'>
                {STATUS_OPTIONS.filter(s => s !== 'all').map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
                        className={`rounded-lg shadow-sm p-3 text-left transition border ${
                            statusFilter === s
                                ? `${statusColor[s]} border-current ring-1 ring-current`
                                : 'bg-white border-transparent hover:border-gray-200'
                        }`}
                    >
                        <p className='text-lg font-bold leading-none mb-0.5'>{byStatus(s)}</p>
                        <p className='text-xs capitalize text-gray-500 flex items-center gap-1'>
                            {statusIcon[s]}
                            {s}
                        </p>
                    </button>
                ))}
                <div className='bg-white rounded-lg shadow-sm p-3 border border-transparent'>
                    <p className='text-lg font-bold leading-none mb-0.5 text-green-600'>
                        Rs. {Math.ceil(totalRevenue).toLocaleString()}
                    </p>
                    <p className='text-xs text-gray-500'>Total Revenue</p>
                </div>
            </div>

            {/* filter bar */}
            <div className='bg-white rounded-lg shadow-sm p-4 mb-4'>
                <div className='flex flex-col sm:flex-row gap-3'>

                    {/* search */}
                    <div className='relative flex-1'>
                        <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-300' size={13} />
                        <input
                            type='text'
                            placeholder='Search by order ID, customer, city, or product…'
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className='w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#AB2320] transition'
                        />
                    </div>

                    {/* status */}
                    <div className='relative'>
                        <FaFilter className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-300' size={11} />
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className='pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#AB2320] transition appearance-none bg-white cursor-pointer capitalize'
                        >
                            {STATUS_OPTIONS.map(s => (
                                <option key={s} value={s} className='capitalize'>
                                    {s === 'all' ? 'All Statuses' : s}
                                </option>
                            ))}
                        </select>
                        <FaChevronDown className='absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none' size={10} />
                    </div>

                    {/* payment method */}
                    <div className='relative'>
                        <FaTag className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-300' size={11} />
                        <select
                            value={paymentFilter}
                            onChange={e => setPaymentFilter(e.target.value)}
                            className='pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#AB2320] transition appearance-none bg-white cursor-pointer'
                        >
                            {paymentMethods.map(m => (
                                <option key={m} value={m}>
                                    {m === 'all' ? 'All Payments' : m.replace(/_/g, ' ')}
                                </option>
                            ))}
                        </select>
                        <FaChevronDown className='absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none' size={10} />
                    </div>

                    {/* sort */}
                    <div className='relative'>
                        <select
                            value={sort}
                            onChange={e => setSort(e.target.value as SortOption)}
                            className='pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#AB2320] transition appearance-none bg-white cursor-pointer'
                        >
                            {(Object.keys(SORT_LABELS) as SortOption[]).map(key => (
                                <option key={key} value={key}>{SORT_LABELS[key]}</option>
                            ))}
                        </select>
                        <FaChevronDown className='absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none' size={10} />
                    </div>
                </div>

                {/* active chips */}
                {hasActiveFilters && (
                    <div className='flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100'>
                        <span className='text-xs text-gray-400'>Active:</span>
                        {search && (
                            <span
                                onClick={() => setSearch('')}
                                className='flex items-center gap-1 text-xs px-2.5 py-1 bg-gray-100 rounded-full cursor-pointer hover:bg-red-50 hover:text-red-500 transition'
                            >
                                "{search}" ×
                            </span>
                        )}
                        {statusFilter !== 'all' && (
                            <span
                                onClick={() => setStatusFilter('all')}
                                className='flex items-center gap-1 text-xs px-2.5 py-1 bg-gray-100 rounded-full cursor-pointer hover:bg-red-50 hover:text-red-500 transition capitalize'
                            >
                                {statusFilter} ×
                            </span>
                        )}
                        {paymentFilter !== 'all' && (
                            <span
                                onClick={() => setPaymentFilter('all')}
                                className='flex items-center gap-1 text-xs px-2.5 py-1 bg-gray-100 rounded-full cursor-pointer hover:bg-red-50 hover:text-red-500 transition capitalize'
                            >
                                {paymentFilter.replace(/_/g, ' ')} ×
                            </span>
                        )}
                        <button
                            onClick={clearAll}
                            className='ml-1 text-xs text-[#AB2320] font-semibold hover:underline cursor-pointer'
                        >
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            {/* result count */}
            <p className='text-sm text-gray-400 mb-3 px-1'>
                Showing <span className='font-semibold text-gray-600'>{filtered.length}</span> of {orders.length} orders
            </p>

            {/* order list */}
            {orders.length === 0 ? (
                <div className='bg-white rounded-lg shadow-sm p-16 text-center'>
                    <FaShoppingBag className='text-gray-200 mx-auto mb-4' size={52} />
                    <h2 className='text-xl font-bold text-gray-700 mb-1'>No orders yet</h2>
                    <p className='text-gray-400 text-sm'>Orders for your products will appear here.</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className='bg-white rounded-lg shadow-sm p-16 text-center'>
                    <FaSearch className='text-gray-200 mx-auto mb-4' size={44} />
                    <h2 className='text-xl font-bold text-gray-700 mb-1'>No results found</h2>
                    <p className='text-gray-400 text-sm mb-4'>Try different search terms or filters.</p>
                    <button
                        onClick={clearAll}
                        className='text-[#AB2320] font-semibold text-sm hover:underline cursor-pointer'
                    >
                        Clear all filters
                    </button>
                </div>
            ) : (
                <div className='bg-white rounded-lg shadow-sm p-4'>
                    <div className='flex flex-col gap-3'>
                        {filtered.map(order => (
                            <div
                                key={order.id}
                                onClick={() => navigate(`/seller/orders/${order.id}`)}
                                className='border border-gray-100 rounded-lg p-4 hover:border-[#AB2320] hover:shadow-sm transition cursor-pointer'
                            >
                                <div className='flex items-center justify-between mb-2'>
                                    <div>
                                        <p className='font-semibold text-sm'>
                                            #{order.id.slice(-8).toUpperCase()}
                                        </p>
                                        <p className='text-gray-400 text-xs'>
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

                                {/* item thumbnails */}
                                <div className='flex items-center gap-2 mb-2'>
                                    {order.items.slice(0, 4).map(item => (
                                        <img
                                            key={item.id}
                                            src={getImageUrl(item.img)}
                                            alt={item.title}
                                            className='w-10 h-10 object-contain rounded bg-gray-100 p-1'
                                        />
                                    ))}
                                    {order.items.length > 4 && (
                                        <div className='w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500'>
                                            +{order.items.length - 4}
                                        </div>
                                    )}
                                    <div className='ml-auto text-right'>
                                        <p className='text-xs text-gray-400'>
                                            {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                        </p>
                                        <p className='text-sm font-bold text-gray-700'>
                                            Rs. {Math.ceil(order.total_price).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className='flex items-center justify-between pt-2 border-t border-gray-50'>
                                    <p className='text-xs text-gray-400'>
                                        {order.shipping_info.full_name} · {order.shipping_info.city}
                                    </p>
                                    <p className='text-xs text-gray-400 capitalize'>
                                        {order.payment_method.replace(/_/g, ' ')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    )
}

export default Orders