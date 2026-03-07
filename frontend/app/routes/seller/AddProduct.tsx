import { useActionData, useNavigation, redirect } from 'react-router'
import type { Route } from './+types/AddProduct'
import { FaStore, FaImage } from 'react-icons/fa'
import { useRef, useState } from 'react'

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData()

    const cookieHeader = request.headers.get('Cookie') ?? '';
    const token = cookieHeader
        .split(';')
        .find(c => c.trim().startsWith('token='))
        ?.split('=')[1];

    if (!token) return { error: 'Login required' };

    // checkbox sends 'true' when checked, null when unchecked
    // backend expects bool so convert it explicitly
    const featured = formData.get('featured') === 'true' ? 'true' : 'false'
    formData.set('featured', featured)  // ← override with explicit value

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
    });

    const data = await res.json();
    console.log("response:", data)  // ← add for debugging

    if (!res.ok) {
        const errorMsg = Array.isArray(data.detail) ? data.detail[0].msg : data.detail;
        return { error: errorMsg };
    }

    return redirect('/seller/dashboard');
}

const CATEGORIES = [
    'CPU', 'GPU', 'Motherboard', 'RAM',
    'Storage', 'PSU', 'Cooling', 'Case', 'Monitor', 'Peripherals'
]

function AddProduct() {
    const actionData = useActionData() as { error?: string };
    const navigation = useNavigation();
    const isSubmitting = navigation.state === 'submitting';

    const [preview, setPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setPreview(URL.createObjectURL(file));
    }

    return (
        <section className='max-w-3xl mx-auto p-5 mt-5'>
            <div className='flex items-center gap-3 mb-8'>
                <FaStore className='text-[#AB2320]' size={24} />
                <div>
                    <h1 className='text-3xl font-bold'>Add New Product</h1>
                    <p className='text-gray-500 text-sm'>Fill in the details to list your product</p>
                </div>
            </div>

            {actionData?.error && (
                <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
                    <p className='text-red-600 font-semibold text-sm'>{actionData.error}</p>
                </div>
            )}

            <form method='post' encType='multipart/form-data' className='flex flex-col gap-6'>

                {/* image upload */}
                <div className='bg-white p-6 rounded-lg shadow-sm'>
                    <h2 className='font-bold text-lg mb-4'>Product Image</h2>
                    <div
                        onClick={() => fileRef.current?.click()}
                        className='border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#AB2320] transition'
                    >
                        {preview ? (
                            <img
                                src={preview}
                                alt='preview'
                                className='max-h-48 object-contain rounded'
                            />
                        ) : (
                            <>
                                <FaImage className='text-gray-300 mb-3' size={48} />
                                <p className='text-gray-500 font-semibold text-sm'>Click to upload image</p>
                                <p className='text-gray-400 text-xs mt-1'>PNG, JPG, WEBP supported</p>
                            </>
                        )}
                    </div>
                    <input
                        ref={fileRef}
                        type='file'
                        name='img'
                        accept='image/*'
                        required
                        onChange={handleImageChange}
                        className='hidden'
                    />
                    {preview && (
                        <button
                            type='button'
                            onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                            className='mt-2 text-xs text-red-500 hover:underline cursor-pointer'
                        >
                            Remove image
                        </button>
                    )}
                </div>

                {/* product details */}
                <div className='bg-white p-6 rounded-lg shadow-sm flex flex-col gap-4'>
                    <h2 className='font-bold text-lg'>Product Details</h2>

                    <div className='flex flex-col gap-1'>
                        <label className='text-sm font-semibold text-gray-700'>Product Title</label>
                        <input
                            type='text'
                            name='title'
                            required
                            placeholder='e.g. AMD Ryzen 9 7950X'
                            className='border-[3px] border-white rounded bg-[#FAF8F4] shadow py-2 px-4 focus:border-[#AB2320] outline-none'
                        />
                    </div>

                    <div className='flex flex-col gap-1'>
                        <label className='text-sm font-semibold text-gray-700'>Description</label>
                        <textarea
                            name='description'
                            required
                            rows={4}
                            placeholder='Describe your product...'
                            className='border-[3px] border-white rounded bg-[#FAF8F4] shadow py-2 px-4 focus:border-[#AB2320] outline-none resize-none'
                        />
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        <div className='flex flex-col gap-1'>
                            <label className='text-sm font-semibold text-gray-700'>Price (NRP)</label>
                            <input
                                type='number'
                                name='price'
                                required
                                min='0'
                                max="99999999"
                                step='0.01'
                                placeholder='e.g. 299.99'
                                className='border-[3px] border-white rounded bg-[#FAF8F4] shadow py-2 px-4 focus:border-[#AB2320] outline-none'
                            />
                        </div>

                        <div className='flex flex-col gap-1'>
                            <label className='text-sm font-semibold text-gray-700'>Stock</label>
                            <input
                                type='number'
                                name='stock'
                                required
                                min='0'
                                max='100'
                                placeholder='e.g. 50'
                                className='border-[3px] border-white rounded bg-[#FAF8F4] shadow py-2 px-4 focus:border-[#AB2320] outline-none'
                            />
                        </div>
                    </div>

                    <div className='flex flex-col gap-1'>
                        <label className='text-sm font-semibold text-gray-700'>Category</label>
                        <select
                            name='category'
                            required
                            className='border-[3px] border-white rounded bg-[#FAF8F4] shadow py-2 px-4 focus:border-[#AB2320] outline-none'
                        >
                            <option value=''>Select a category</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* featured toggle */}
                    <div className='flex items-center gap-3 p-4 bg-[#FAF8F4] rounded-lg'>
                        <input
                            type='checkbox'
                            name='featured'
                            id='featured'
                            value='true'
                            defaultChecked={false}
                            className='w-4 h-4 accent-[#AB2320] cursor-pointer'
                        />
                        <div>
                            <label htmlFor='featured' className='font-semibold text-sm cursor-pointer'>
                                Mark as Featured
                            </label>
                            <p className='text-xs text-gray-500'>Featured products appear on the home page</p>
                        </div>
                    </div>
                </div>

                <div className='flex gap-3'>
                    <button
                        type='button'
                        onClick={() => window.history.back()}
                        className='flex-1 py-3 border-2 border-gray-300 text-gray-600 font-bold rounded-lg cursor-pointer hover:border-gray-400 transition'
                    >
                        Cancel
                    </button>
                    <button
                        type='submit'
                        disabled={isSubmitting}
                        className='flex-1 py-3 bg-[#AB2320] text-white font-bold rounded-lg cursor-pointer hover:bg-[#8a1b18] transition disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {isSubmitting ? 'Adding Product...' : 'Add Product'}
                    </button>
                </div>
            </form>
        </section>
    )
}

export default AddProduct