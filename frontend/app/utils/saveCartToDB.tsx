import type { CartType } from "~/types";

export async function saveCartTODB(updatedCart: CartType[]){
    const token = document.cookie.split(";").find(c=>c.trim().startsWith("token="))?.split("=")[1];

    console.log("token", token)
    console.log("cart:", updatedCart)

    if (!token) return;

    await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ items: updatedCart })
    });
}