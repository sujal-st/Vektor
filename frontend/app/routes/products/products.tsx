import React from 'react'
import Categories from '~/components/Categories'
import PriceFilter from '~/components/PriceFilter'
import ProductMenu from '~/components/ProductMenu'
import type { Route } from './+types/products'
import type { ProductType } from '~/types';

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || process.env.VITE_API_URL;
    if (!apiUrl) throw new Error("API URL not configured");
    const res = await fetch(`${apiUrl}/api/products`);
    if (!res.ok) throw new Error("Failed to fetch data");
    const data: ProductType[] = await res.json();
    return { products: data };
  } catch (err) {
    console.error("Products loader error:", err);
    return { products: [] as ProductType[] };
  }
}

function products({loaderData}:Route.ComponentProps) {
  // console.log("loaderdata:"+typeof(loaderData))
  const products = loaderData?.products ?? [];
  return (
    <section>
      <Categories />
      <div className='mt-4 flex flex-col lg:flex-row gap-5'>
        <PriceFilter />
        <ProductMenu products={products}/>
      </div>
    </section>
  )
}

export default products