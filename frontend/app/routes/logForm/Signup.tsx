import { IoMdClose } from 'react-icons/io'
import { NavLink, redirect } from 'react-router'
import FormComponent from '~/components/FormComponent'
import type { Route } from './+types/Signup'
import { toast } from 'sonner'

export async function action({ request }: Route.ActionArgs) {

    const emailReg=/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;;
    const pwReg=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    const formData = await request.formData();

    const userName = formData.get("fullname");
    const email = formData.get("email");
    const password = formData.get("password");


    if(!emailReg.test(email as string)){
        return {error: "Please enter a valid email"};
    }
    else if(!pwReg.test(password as string)){
        return { error: "Password must have at least 1 lowercase, 1 uppercase, 1 number, and 1 special character (@$!%*?&)" };
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userName, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
        const errorMsg = Array.isArray(data.detail) ? data.detail[0].msg : data.detail
        return { error: errorMsg }
    }

    return redirect("/login");


}

function Signup() {
    return (
        <div className='w-full flex flex-row justify-between items-center gap-2 px-5 lg:pl-5'>
            <div className='mt-6 w-full h-fit rounded-lg mx-auto p-8 flex flex-col gap-2 bg-white shadow-lg'>
                <NavLink to="/" className="self-end">
                    <IoMdClose size={24} />
                </NavLink>
                <div className='text-center flex flex-col gap-1 mb-2'>
                    <img src="/Vektor.png" alt="" className='h-20 mx-auto' />
                    <h1 className='text-2xl font-bold text-[#055D62]'>Get Started Now</h1>
                    <p className='text-[#676767] text-sm mt-2'>Please enter your details to start shopping</p>
                </div>
                <FormComponent type='signup' />
                <div className="text-center mt-6 text-sm text-[#676767]">
                    Already have an account?{" "}
                    <NavLink
                        to="/login"
                        className="text-[#AB2320] font-semibold hover:underline"
                    >
                        Log in
                    </NavLink>
                </div>
            </div>
            <img src='/assets/icon1.png' className='hidden lg:grid w-1/2' />
        </div>

    )
}

export default Signup
