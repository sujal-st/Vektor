import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useActionData,
  useRevalidator,
} from "react-router";
import type { Route } from "./+types/root";
import { useContext, useState } from "react";
import "./app.css";
import "./routes/about/about.css"
import { cartContext, CartProvider } from "./contexts/cartContext";
import type { CartType } from "./types";
import { useLoaderData } from "react-router";
import { useEffect } from "react";
import { cookieContext, CookieProvider } from "./contexts/cookieContext";
import { Toaster } from 'sonner'


export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export async function loader({ request }: Route.LoaderArgs) {

  const cookieHeader = request.headers.get('Cookie') ?? '';
  console.log("cookies:",cookieHeader);
  const token = cookieHeader.split(";").find(c => c.trim().startsWith("token="))?.split("=")[1];
  console.log("token:",token);

  if (!token) return { cart: [] }

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    return { cart: data.items || [] };
  }
  catch {
    return { cart: [] };
  }
}

// export async function action({ request }: Route.ActionArgs) {

//   const cookies = document.cookie.split(";");
//   const user = cookies.find(row => row.startsWith("user"));
//   console.log(user)

//   try {
//     const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`);
//     if (!res.ok)
//       throw new Error("Failed to fetch");

//     const data = res.json()
//     console.log("Data of cart: ", data)
//     return { cart: data }
//   }
//   catch (e) {
//     console.error("failed to fetch cart data")
//   }
// }

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <main>
          {children}
        </main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { cart } = useLoaderData() as { cart: CartType[] };

 
  return (
    <CookieProvider>
    <CartProvider initialCart={cart} >
      <AppInner />
      <Toaster position='top-right' theme='light'/>
    </CartProvider>
    </CookieProvider>
  );
}
function AppInner(){
  const {user}=useContext(cookieContext);
  const {setCart}= useContext(cartContext);
  const revalidator = useRevalidator();

  useEffect(()=>{
    if(!user)
    {
      setCart([]);
    }else{
      revalidator.revalidate();
    }
  },[user])
  return <Outlet/>
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
