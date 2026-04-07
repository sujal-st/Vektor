import React from 'react'
import { useNavigate } from 'react-router'
import { FaEdit, FaTrash } from 'react-icons/fa'
import { getImageUrl } from '~/utils/getImageUrl'
import { Link } from 'react-router'

type Product = {
    id: string
    title: string
    price: number
    img: string
    category: string
    stock: number
}

type ProductCardProps = {
    product: Product
}

function ProductCard({ product }: ProductCardProps) {
    const navigate = useNavigate()

    return (
        <Link to={`products-analysis/${product.id}`} className='flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:border-gray-300 transition'>
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
        </Link>
    )
}

export default ProductCard
