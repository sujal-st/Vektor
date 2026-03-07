import React from 'react'
import Categories from '~/components/Categories'
import PriceFilter from '~/components/PriceFilter'
import ProductMenu from '~/components/ProductMenu'
import type { Route } from './+types/products'
import type { ProductType } from '~/types';

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
    if (!res.ok) throw new Error("Failed to fetch data");
    const data: ProductType[]= await res.json();
    console.log("data"+data)
    return { products: data };
  } catch (err) {
    return { products: [] as ProductType[] };
  }
}

function products({loaderData}:Route.ComponentProps) {
  // console.log("loaderdata:"+typeof(loaderData))
  const products = loaderData?.products ?? [];
  return (
    <section>
      <Categories />
      <div className='mt-4 flex flex-col md:flex-row gap-5'>
        <PriceFilter />
        <ProductMenu products={products}/>
      </div>
    </section>
  )
}

export default products
