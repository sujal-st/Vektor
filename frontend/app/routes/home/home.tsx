import type { Route } from "./+types/home";
import FAQ from "~/components/FAQ";
import CTA from "~/components/CTA";
import Review from "~/components/Review";
import Stats from "~/components/Stats";
import FeaturedProduct from "~/components/FeaturedProduct";
import HeroSection from "~/components/HeroSection";
import type { ProductType } from "~/types";
import { useLoaderData } from "react-router";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: 'Vektor' },
    { name: "description", content: "Welcome to Vektor!" },
  ];
}

export async function loader() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
    const products: ProductType[] = await res.json();
    const featured = products.filter(p => p.featured === true);
    return { featured };
  } catch {
    return { featured: [] };
  }
}


export default function Home() {

  const {featured}= useLoaderData() as {featured: ProductType[]}
  return (
    <section>
      <HeroSection/>
      <FeaturedProduct products={featured}/>
      <Stats/>
      <Review/>
      <CTA />
      <FAQ />
    </section>
  )
}
