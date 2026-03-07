import React, { useContext} from 'react'
import type { CartType, ProductType } from '~/types'
import { FaShoppingCart } from 'react-icons/fa'
import { cartContext } from '~/contexts/cartContext';
import { getToken } from '~/utils/getToken';
import { saveCartTODB } from '~/utils/saveCartToDB';
import { getImageUrl } from '~/utils/getImageUrl';

type PropType = {
    product: ProductType;
}
function Product({ product }: PropType) {
    const { cart, setCart } = useContext(cartContext);
    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        let updatedCart: CartType[];

        const existing = cart.find((p) => p.id === product.id ? true : false);
        if (existing) {
            updatedCart = cart.filter((p) => p.id != product.id);
        }
        else {
            updatedCart = [
                ...cart,
                { ...product, quantity: 1 }
            ]
        }
        setCart(updatedCart)
        await saveCartTODB(updatedCart);
    }

    const isInCart = cart.some(p => p.id === product.id);
    const { removeFromCart } = useContext(cartContext);
    return (
        <div className='min-w-20 p-5 min-h-50 bg-white rounded-sm shadow-sm flex flex-col justify-between gap-5 hover:scale-105 transition duration-200'>
            <div className='h-48 w-full overflow-hidden rounded-sm'>
                <img src={getImageUrl(product.img)} alt={product.title} className='w-full h-full object-contain' />
            </div>
            <div className='flex flex-col space-y-5'>

                <h3 className='text-lg font-bold line-clamp-1 '>{product.title}</h3>
                <p className='text-md text-gray-500 line-clamp-2'>{product.description}</p>
                <div className='flex justify-between'>
                    <span className='px-2 py-1 text-sm text-white font-semibold rounded-sm bg-[#00878f]'>{product.category}</span>
                    <span className='rounded-sm text-[#AB2320] text-lg font-bold'>Rs. {Math.ceil(product.price)}</span>
                </div>
                <button className='px-4 py-2 bg-[#AB2320] text-[#F6F1E6] font-bold flex justify-center items-center gap-2 rounded-md cursor-pointer transition'
                    onClick={
                        (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            isInCart? 
                            removeFromCart(product.id, getToken())
                            : handleAddToCart(e)
                        }}>
                    <FaShoppingCart />
                    {isInCart ? 'Remove From Cart' : 'Add To Cart'}
                </button>
            </div>
        </div>
    )
}

export default Product
