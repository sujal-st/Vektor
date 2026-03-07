import React, { useContext, useState } from 'react'
import { IoMdClose } from 'react-icons/io'
import { NavLink, redirect } from 'react-router'
import FormComponent from '~/components/FormComponent'
import type { Route } from './+types/Login'
import type { UserType } from '~/types'
import { cookieContext } from '~/contexts/cookieContext'


export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData()

    const email = formData.get('email');
    const password = formData.get('password');

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
        const errorMsg = Array.isArray(data.detail) ? data.detail[0].msg : data.detail
        return { error: errorMsg }
    }

    // ← redirect based on role
    const response = redirect(data.user.is_admin ? '/seller/dashboard' : '/dashboard');

    response.headers.set('Set-Cookie', `token=${data.token}; Path=/; SameSite=Lax`);
    response.headers.append('Set-Cookie', `user=${JSON.stringify(data.user)}; Path=/`);

    return response
}

function Login() {



    return (
        <div className='w-full flex flex-row items-center justify-between gap-2 px-5 lg:pl-5'>

        <div className='mt-6 rounded-lg w-full h-fit mx-auto p-8 flex flex-col gap-4 bg-white shadow-lg'>
            <NavLink to="/" className="self-end">
                <IoMdClose size={24} />
            </NavLink>
            <div className='text-center flex flex-col gap-1 mb-2'>
                <img src="/Vektor.png" alt="" className='h-20 mx-auto' />
                <h1 className='text-2xl font-bold text-[#055D62]'>Get Started Now</h1>
                <p className='text-[#676767] text-sm mt-2'>Your custom PC build is waiting. Continue where you left off.</p>
            </div>

            <FormComponent type='login' />

            <div className="text-center mt-6 text-sm text-[#676767]">
                Don't have an account?{" "}
                <NavLink
                    to="/signup"
                    className="text-[#AB2320] font-semibold hover:underline"
                >
                    Sign Up
                </NavLink>
            </div>
        </div>
            
            <img src='/assets/icon1.png' className='hidden lg:grid w-1/2'/>

        </div>

    )
}

export default Login
