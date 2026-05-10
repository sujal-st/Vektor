import { useLoaderData, useNavigate } from 'react-router'
import type { Route } from './+types/Myproducts'
import {
    FaBox, FaPlus, FaStore, FaSearch, FaFilter,
    FaTimesCircle, FaExclamationTriangle, FaChevronDown,
    FaStar, FaTag
} from 'react-icons/fa'
import ProductCard from '~/components/SellerDash/ProductCard'
import { useState, useMemo } from 'react'
import type { User } from './SellerDash'

type Product = {
    id: string
    title: string
    price: number
    img: string
    category: string
    stock: number
    featured: boolean
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

    if (!token || !userCookie) return { user: null, products: [] }

    const user: User = JSON.parse(decodeURIComponent(userCookie))
    if (!user.is_admin) return { user, products: [] }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/my-products`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    const products: Product[] = res.ok ? await res.json() : []
    return { user, products }
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData()
    const intent = formData.get('intent')

    const cookieHeader = request.headers.get('Cookie') ?? ''
    const token = cookieHeader.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]

    if (!token) return { error: 'Unauthorized' }

    if (intent === 'delete_product') {
        const product_id = formData.get('product_id')
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${product_id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return { error: 'Failed to delete product' }
        return { success: 'Product deleted' }
    }

    return null
}

type StockFilter = 'all' | 'low' | 'out'
type SortOption = 'default' | 'price_asc' | 'price_desc' | 'stock_asc' | 'stock_desc' | 'name_asc'

const SORT_LABELS: Record<SortOption, string> = {
    default: 'Default',
    price_asc: 'Price: Low → High',
    price_desc: 'Price: High → Low',
    stock_asc: 'Stock: Low → High',
    stock_desc: 'Stock: High → Low',
    name_asc: 'Name: A → Z',
}

function Myproducts() {
    const { user, products } = useLoaderData() as {
        user: User | null
        products: Product[]
    }
    const navigate = useNavigate()

    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('all')
    const [stockFilter, setStockFilter] = useState<StockFilter>('all')
    const [sort, setSort] = useState<SortOption>('default')

    /* ─── derived ─── */
    const categories = useMemo(
        () => ['all', ...Array.from(new Set(products.map(p => p.category)))],
        [products]
    )

    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length
    const outOfStockCount = products.filter(p => p.stock === 0).length
    const featuredCount = products.filter(p => p.featured).length

    const filtered = useMemo(() => {
        let list = [...products]

        if (search.trim()) {
            const q = search.toLowerCase()
            list = list.filter(
                p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
            )
        }
        if (category !== 'all') list = list.filter(p => p.category === category)
        if (stockFilter === 'low') list = list.filter(p => p.stock > 0 && p.stock <= 5)
        if (stockFilter === 'out') list = list.filter(p => p.stock === 0)

        switch (sort) {
            case 'price_asc':  list.sort((a, b) => a.price - b.price); break
            case 'price_desc': list.sort((a, b) => b.price - a.price); break
            case 'stock_asc':  list.sort((a, b) => a.stock - b.stock); break
            case 'stock_desc': list.sort((a, b) => b.stock - a.stock); break
            case 'name_asc':   list.sort((a, b) => a.title.localeCompare(b.title)); break
        }

        return list
    }, [products, search, category, stockFilter, sort])

    const hasActiveFilters = search || category !== 'all' || stockFilter !== 'all'

    const clearAll = () => {
        setSearch('')
        setCategory('all')
        setStockFilter('all')
        setSort('default')
    }

    /* ─── guards ─── */
    if (!user) {
        return (
            <div className='max-w-3xl mx-auto p-5 text-center mt-10'>
                <h1 className='text-2xl font-bold mb-2'>Not Logged In</h1>
                <p className='text-gray-500 mb-4'>Please login to view your products.</p>
                <button
                    onClick={() => navigate('/login')}
                    className='px-4 py-2 bg-[#AB2320] text-white font-bold rounded-md cursor-pointer'
                >
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
                <button
                    onClick={() => navigate('/')}
                    className='px-4 py-2 bg-[#AB2320] text-white font-bold rounded-md cursor-pointer'
                >
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
                        <span className='text-gray-600 font-medium'>My Products</span>
                    </div>
                    <h1 className='text-3xl font-bold flex items-center gap-2'>
                        <FaStore className='text-[#AB2320]' size={22} />
                        My Products
                    </h1>
                </div>
                <button
                    onClick={() => navigate('/seller/add-product')}
                    className='flex items-center gap-2 px-4 py-2 bg-[#AB2320] text-white font-bold rounded-lg cursor-pointer hover:bg-[#8a1b18] transition text-sm'
                >
                    <FaPlus size={12} />
                    Add Product
                </button>
            </div>

            {/* stat pills */}
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5'>
                {[
                    { label: 'Total Listed',  value: products.length,  icon: <FaBox className='text-blue-500' />,   bg: 'bg-blue-50'   },
                    { label: 'Featured',      value: featuredCount,     icon: <FaStar className='text-yellow-500' />, bg: 'bg-yellow-50' },
                    { label: 'Low Stock',     value: lowStockCount,     icon: <FaExclamationTriangle className='text-orange-500' />, bg: 'bg-orange-50' },
                    { label: 'Out of Stock',  value: outOfStockCount,   icon: <FaTimesCircle className='text-red-500' />, bg: 'bg-red-50' },
                ].map(stat => (
                    <div key={stat.label} className='bg-white rounded-lg shadow-sm p-4 flex items-center gap-3'>
                        <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center shrink-0`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className='text-xl font-bold leading-none'>{stat.value}</p>
                            <p className='text-gray-400 text-xs mt-0.5'>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* alert banners */}
            {(outOfStockCount > 0 || lowStockCount > 0) && (
                <div className='flex flex-col sm:flex-row gap-3 mb-5'>
                    {outOfStockCount > 0 && (
                        <button
                            onClick={() => setStockFilter(stockFilter === 'out' ? 'all' : 'out')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 border-red-500 text-left transition flex-1 ${
                                stockFilter === 'out' ? 'bg-red-50 ring-1 ring-red-200' : 'bg-white'
                            }`}
                        >
                            <FaTimesCircle className='text-red-500 shrink-0' size={16} />
                            <div>
                                <p className='font-bold text-red-600 text-sm'>
                                    {outOfStockCount} product{outOfStockCount > 1 ? 's' : ''} out of stock
                                </p>
                                <p className='text-xs text-gray-400'>
                                    Click to {stockFilter === 'out' ? 'clear filter' : 'filter'}
                                </p>
                            </div>
                        </button>
                    )}
                    {lowStockCount > 0 && (
                        <button
                            onClick={() => setStockFilter(stockFilter === 'low' ? 'all' : 'low')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 border-yellow-400 text-left transition flex-1 ${
                                stockFilter === 'low' ? 'bg-yellow-50 ring-1 ring-yellow-200' : 'bg-white'
                            }`}
                        >
                            <FaExclamationTriangle className='text-yellow-500 shrink-0' size={16} />
                            <div>
                                <p className='font-bold text-yellow-600 text-sm'>
                                    {lowStockCount} product{lowStockCount > 1 ? 's' : ''} running low
                                </p>
                                <p className='text-xs text-gray-400'>
                                    Click to {stockFilter === 'low' ? 'clear filter' : 'filter'}
                                </p>
                            </div>
                        </button>
                    )}
                </div>
            )}

            {/* filter bar */}
            <div className='bg-white rounded-lg shadow-sm p-4 mb-4'>
                <div className='flex flex-col sm:flex-row gap-3'>

                    {/* search */}
                    <div className='relative flex-1'>
                        <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-300' size={13} />
                        <input
                            type='text'
                            placeholder='Search by name or category…'
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className='w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#AB2320] transition'
                        />
                    </div>

                    {/* category */}
                    <div className='relative'>
                        <FaTag className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-300' size={12} />
                        <select
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className='pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#AB2320] transition appearance-none bg-white cursor-pointer capitalize'
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat} className='capitalize'>
                                    {cat === 'all' ? 'All Categories' : cat}
                                </option>
                            ))}
                        </select>
                        <FaChevronDown className='absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none' size={10} />
                    </div>

                    {/* sort */}
                    <div className='relative'>
                        <FaFilter className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-300' size={11} />
                        <select
                            value={sort}
                            onChange={e => setSort(e.target.value as SortOption)}
                            className='pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#AB2320] transition appearance-none bg-white cursor-pointer'
                        >
                            {(Object.keys(SORT_LABELS) as SortOption[]).map(key => (
                                <option key={key} value={key}>{SORT_LABELS[key]}</option>
                            ))}
                        </select>
                        <FaChevronDown className='absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none' size={10} />
                    </div>
                </div>

                {/* active filter chips */}
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
                        {category !== 'all' && (
                            <span
                                onClick={() => setCategory('all')}
                                className='flex items-center gap-1 text-xs px-2.5 py-1 bg-gray-100 rounded-full cursor-pointer hover:bg-red-50 hover:text-red-500 transition capitalize'
                            >
                                {category} ×
                            </span>
                        )}
                        {stockFilter !== 'all' && (
                            <span
                                onClick={() => setStockFilter('all')}
                                className='flex items-center gap-1 text-xs px-2.5 py-1 bg-gray-100 rounded-full cursor-pointer hover:bg-red-50 hover:text-red-500 transition'
                            >
                                {stockFilter === 'low' ? 'Low Stock' : 'Out of Stock'} ×
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
                Showing{' '}
                <span className='font-semibold text-gray-600'>{filtered.length}</span> of {products.length} products
            </p>

            {/* product list */}
            {products.length === 0 ? (
                <div className='bg-white rounded-lg shadow-sm p-16 text-center'>
                    <FaBox className='text-gray-200 mx-auto mb-4' size={52} />
                    <h2 className='text-xl font-bold text-gray-700 mb-1'>No products yet</h2>
                    <p className='text-gray-400 text-sm mb-5'>Add your first product to start selling.</p>
                    <button
                        onClick={() => navigate('/seller/add-product')}
                        className='px-5 py-2.5 bg-[#AB2320] text-white font-bold rounded-lg cursor-pointer hover:bg-[#8a1b18] transition text-sm'
                    >
                        Add Your First Product
                    </button>
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
                        {filtered.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            )}
        </section>
    )
}

export default Myproducts