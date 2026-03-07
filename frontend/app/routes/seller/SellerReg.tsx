import { NavLink, redirect, useActionData } from 'react-router'
import { IoMdClose } from 'react-icons/io'
import { FaStore } from 'react-icons/fa'
import type { Route } from './+types/SellerRegister'

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();

    const userName = formData.get('userName');
    const email = formData.get('email');
    const password = formData.get('password');
    const admin_secret = formData.get('admin_secret');
    console.log("API URL:", import.meta.env.VITE_API_URL)
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, email, password, admin_secret })
    });

    const data = await res.json();

    if (!res.ok) {
        const errorMsg = Array.isArray(data.detail) ? data.detail[0].msg : data.detail;
        return { error: errorMsg };
    }

    return redirect('/login');
}

function SellerRegister() {
    const actionData = useActionData() as { error?: string };

    return (
        <div className='w-full flex flex-row gap-2 pl-12'>
            <div className='mt-6 rounded-lg w-full h-fit mx-auto p-8 flex flex-col gap-4 bg-white shadow-lg'>
                <NavLink to="/" className="self-end">
                    <IoMdClose size={24} />
                </NavLink>

                <div className='text-center flex flex-col gap-1 mb-2'>
                    <img src="/Vektor.png" alt="" className='h-20 mx-auto' />
                    <div className='flex items-center justify-center gap-2 mt-1'>
                        <FaStore className='text-[#AB2320]' size={20} />
                        <h1 className='text-2xl font-bold text-[#055D62]'>Seller Registration</h1>
                    </div>
                    <p className='text-[#676767] text-sm mt-2'>Create your seller account to start listing products.</p>
                </div>

                {actionData?.error && (
                    <p className='text-red-500 text-sm text-center font-semibold bg-red-50 p-3 rounded-lg'>
                        {actionData.error}
                    </p>
                )}

                <form method='post' className='flex flex-col gap-3'>
                    <div className='flex flex-col gap-1'>
                        <label className='text-sm font-semibold text-gray-700'>Username</label>
                        <input
                            type='text'
                            name='userName'
                            required
                            placeholder='Your store name'
                            className='border-[3px] border-white rounded bg-[#FAF8F4] shadow py-2 px-4 focus:border-[#AB2320] outline-none'
                        />
                    </div>

                    <div className='flex flex-col gap-1'>
                        <label className='text-sm font-semibold text-gray-700'>Email</label>
                        <input
                            type='email'
                            name='email'
                            required
                            placeholder='seller@email.com'
                            className='border-[3px] border-white rounded bg-[#FAF8F4] shadow py-2 px-4 focus:border-[#AB2320] outline-none'
                        />
                    </div>

                    <div className='flex flex-col gap-1'>
                        <label className='text-sm font-semibold text-gray-700'>Password</label>
                        <input
                            type='password'
                            name='password'
                            required
                            placeholder='••••••••'
                            className='border-[3px] border-white rounded bg-[#FAF8F4] shadow py-2 px-4 focus:border-[#AB2320] outline-none'
                        />
                    </div>

                    <div className='flex flex-col gap-1'>
                        <label className='text-sm font-semibold text-gray-700'>Seller Secret Key</label>
                        <input
                            type='password'
                            name='admin_secret'
                            required
                            placeholder='Enter your secret key'
                            className='border-[3px] border-white rounded bg-[#FAF8F4] shadow py-2 px-4 focus:border-[#AB2320] outline-none'
                        />
                        <p className='text-xs text-gray-400'>Contact admin to get your secret key.</p>
                    </div>

                    <button
                        type='submit'
                        className='w-full py-2 bg-[#AB2320] text-white font-bold rounded-lg cursor-pointer hover:bg-[#8a1b18] transition mt-2'
                    >
                        Register as Seller
                    </button>
                </form>

                <div className='text-center text-sm text-[#676767]'>
                    Already have an account?{' '}
                    <NavLink to='/login' className='text-[#AB2320] font-semibold hover:underline'>
                        Log in
                    </NavLink>
                </div>
            </div>
            <img src='/assets/icon1.png' className='w-1/2' />
        </div>
    )
}

export default SellerRegister