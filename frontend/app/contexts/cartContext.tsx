import React,{useState,createContext, useEffect} from 'react'
import type { CartType, ProductType } from '~/types';

type CartContextType={
    cart: CartType[];
    setCart: React.Dispatch<React.SetStateAction<CartType[]>>;
    removeFromCart: (itemId: string, token: string)=> Promise<void>;
}
const cartContext=createContext<CartContextType>({
    cart:[],
    setCart:()=>{},
    removeFromCart: async()=>{}
});

const CartProvider = ({children,initialCart}:{children: React.ReactNode,initialCart: CartType[]})=>{

    const [cart,setCart]=useState<CartType[]>(initialCart)
    useEffect(()=>{
        setCart(initialCart);
    },[initialCart])

    async function removeFromCart(itemId: string, token: string){
        console.log("Remove token:", token);
        setCart(prev=>prev.filter(item=>item.id!=itemId));

        if(token)
        {
            await fetch(`${import.meta.env.VITE_API_URL}/api/cart/${itemId}`,{
                method: "DELETE",
                headers:{Authorization: `Bearer ${token}`},
            });
        }
    }
    return(
        <cartContext.Provider value={{cart,setCart,removeFromCart}}>
            {children}
        </cartContext.Provider>
    )
}

export {cartContext, CartProvider};