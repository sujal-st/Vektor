import React, { useContext, useState } from 'react'
import type { Route } from './+types/productdetails'
import type { ProductType } from '~/types';
import { FaShoppingCart, FaTruck, FaSyncAlt, FaShieldAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa"
import QuantityRange from '~/components/QuantityRange';
import Product from '~/components/Product';
import { cartContext } from '~/contexts/cartContext';
import type { CartType } from '~/types';
import { getToken } from '~/utils/getToken';
import { saveCartTODB } from '~/utils/saveCartToDB';
import ReviewComponent from '~/components/ReviewComponent';
import { getImageUrl } from '~/utils/getImageUrl';




// in loader, also fetch user's orders to check if they purchased
export async function loader({ params, request }: Route.LoaderArgs) {
  const id = params.id;
  try {
    const cookieHeader = request.headers.get('Cookie') ?? '';
    const token = cookieHeader.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];

    const [productRes, similarRes, reviewRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`),
      fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}/similar`),
      fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${id}`)
    ]);

    const data: ProductType = await productRes.json();
    const similarProducts: ProductType[] = await similarRes.json();
    const reviewData = await reviewRes.json();

    // check if user has purchased this product
    let hasPurchased = false;
    if (token) {
      const ordersRes = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (ordersRes.ok) {
        const orders = await ordersRes.json();
        hasPurchased = orders.some((order: any) =>
          order.items.some((item: any) => item.id === id)
        );
      }
    }

    return { data, similarProducts, reviewData, hasPurchased };
  } catch (err) {
    return { product: null, similarProducts: [], reviewData: [], hasPurchased: false };
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'review') {
    const token = request.headers.get('Cookie')
      ?.split(';')
      .find(c => c.trim().startsWith('token='))
      ?.split('=')[1];

    if (!token) return { error: 'Login required to post a review' };

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        product_id: formData.get('product_id'),
        text: formData.get('review'),
        rating: Number(formData.get('rating'))
      })
    });

    const data = await res.json();

    if (!res.ok) {
      return { reviewError: data.detail }
    }

    return { reviewSuccess: true }
  }

  return null;
}

function productdetails({ loaderData }: Route.ComponentProps) {
  const product: ProductType | undefined = loaderData?.data;
  const similarProducts = loaderData?.similarProducts ?? [];
  const reviewData = loaderData?.reviewData;

  const shippingRules = [{ icon: <FaTruck size={20} />, text: 'Free Shipping', }, { icon: <FaSyncAlt size={20} />, text: '30 days return', }, { icon: <FaShieldAlt size={20} />, text: '2 years warranty', },]


  const [isAnimating, setIsAnimating] = useState(false);

  const [currentSlide, setCurrentSlide] = useState(1);
  const productsPerPage = 4;



  const totalPages = Math.ceil(similarProducts.length / productsPerPage);

  const indexOfLast = currentSlide * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;


  const currentProducts = () => {
    const totalProductsInSlide = similarProducts.slice(indexOfFirst, indexOfLast)

    return totalProductsInSlide;
  }
  const handleNextSlide = () => {
    if (currentSlide < totalPages) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentSlide((prev) => prev + 1);
        setIsAnimating(false);
      }, 200)
    }
  }
  const handlePrevSlide = () => {
    if (currentSlide > 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide((prev) => prev - 1);
        setIsAnimating(false);
      }, 200)
    }
  }

  const { cart, setCart } = useContext(cartContext);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    let updatedCart: CartType[];

    const existing = cart.find((p) => p.id === product.id ? true : false);
    if (existing) {
      updatedCart = cart.filter((p) => p.id != product.id);
    }
    else {
      updatedCart = [
        ...cart,
        { ...product, quantity: quantity }
      ]
    }
    setCart(updatedCart)
    await saveCartTODB(updatedCart)
  }

  const isInCart = cart.some(p => p.id === product.id);


  const [quantity, setQuantity] = useState(1)

  const handleDecrease = () => {
    if (quantity > 0) {
      setQuantity((prev) => prev - 1)
    }
  }
  const handleIncrease = () => {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1)
    }
  }

  // const { user } = useContext(cookieContext);
  const { removeFromCart } = useContext(cartContext);
  const hasPurchased = loaderData?.hasPurchased ?? false;
  return (
    <>
      <p className='p-5 text-gray-500'>Home / Products / <b>{product.title}</b></p>
      <section className='max-w-full mx-auto mt-10 p-4 md:p-5 flex flex-col md:flex-row items-start gap-8 md:gap-16'>

        <div className='w-full md:w-1/2'>
          <img src={getImageUrl(product.img)} alt={product.title} className='w-full h-full rounded-lg object-contain' />
        </div>

        <div className='w-full flex flex-col justify-evenly gap-5 md:gap-7'>

          <div className='flex flex-col gap-2'>
            <h1 className='font-semibold text-2xl md:text-4xl'>{product.title}</h1>
            <p className='text-base md:text-xl text-gray-500 line-clamp-2 md:line-clamp-1'>{product.description}</p>
          </div>

          <p className='text-[#AB2320] font-semibold text-xl md:text-2xl'>Rs {Math.ceil(product.price)}</p>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-5'>
            <button
              className='px-4 py-2 bg-[#AB2320] text-[#F6F1E6] font-bold rounded-md cursor-pointer flex items-center justify-center gap-4'
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                isInCart ? removeFromCart(product.id, getToken()) : handleAddToCart(e)
              }}
            >
              <FaShoppingCart />
              {isInCart ? 'Remove From Cart' : 'Add To Cart'}
            </button>
          </div>

          <div className='flex flex-wrap items-start gap-4'>
            <div>
              <p className='font-semibold mb-2'>Total Stock:</p>
              <p className='w-fit rounded-sm p-3 bg-white'>{product.stock}</p>
            </div>
            <div>
              <p className='font-semibold mb-2'>Quantity:</p>
              <QuantityRange
                productStock={product?.stock}
                handleIncrease={handleIncrease}
                handleDecrease={handleDecrease}
                quantity={quantity}
              />
            </div>
          </div>

          <div className='border-t border-b grid grid-cols-3 gap-2 md:gap-4 px-2 md:px-8 py-2 max-w-full'>
            {shippingRules.map((r) => (
              <div key={r.text} className='p-2 md:p-3 flex flex-col items-center rounded-lg self-center text-gray-600 text-xs md:text-sm text-center'>
                {r.icon}
                {r.text}
              </div>
            ))}
          </div>

        </div>
      </section>

      <section className='p-5 bg-white m-5 rounded-lg'>
        <h2 className="font-bold mb-5">Description</h2>
        <p>
          {product?.description}
        </p>
      </section>

      <ReviewComponent reviews={reviewData} productId={product.id} hasPurchased={hasPurchased} />

      <section className='p-5'>
        <h2 className="font-bold mb-5">You may also like</h2>

        <div className={`flex flex-row items-center gap-2 transition-opacity duration-200 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>

          <FaChevronLeft size={50} className={`${currentSlide === 1 ? 'invisible' : 'hover:text-gray-300 cursor-pointer'}`} onClick={handlePrevSlide} />

          {similarProducts.length >= 1 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mx-2 justify-items-start'>
              {currentProducts().map((p) => (
                <Product key={p.id} product={p} />
              ))}
            </div>
          ) :
            (
              <div className='text-center font-semibold text-gray-500'>No similar products found</div>
            )}



          <FaChevronRight size={50} className={`${currentSlide >= totalPages ? 'invisible' : 'hover:text-gray-300 cursor-pointer'}`} onClick={handleNextSlide} />

        </div>
      </section>
    </>

  )
}

export default productdetails
