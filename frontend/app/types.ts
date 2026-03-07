export type ProductType={
    title:string;
    description:string;
    price: number;
    category: string;
    stock: number,
    featured: boolean;
    img:string;
    admin_id: string
    id:string;
}
export type UserType={
    id: string;
    username: string;
    email: string;
    password: string;
    is_admin: boolean;
}
export type AdminType={
    id:string;
    name:string;
    password:string;
}
export type CartType={
    id:string
    title:string;
    img:string;
    price:number;
    quantity:number;
    description:string;
    category: string
    stock: number
    featured: boolean
    admin_id?: string
}