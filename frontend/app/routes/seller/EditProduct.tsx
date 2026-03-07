import { useActionData, useLoaderData, useNavigation, redirect } from 'react-router'
import type { Route } from './+types/EditProduct'
import { FaStore, FaImage } from 'react-icons/fa'
import { useRef, useState } from 'react'
import type { ProductType } from '~/types'
import { getImageUrl } from '~/utils/getImageUrl'

export async function loader({ request, params }: Route.LoaderArgs) {
    const apiUrl = import.meta.env.VITE_API_URL || process.env.VITE_API_URL;
    const res = await fetch(`${apiUrl}/api/products/${params.id}`);
    if (!res.ok) return { product: null };
    const product: ProductType = await res.json();
    return { product };
}

// action
export async function action({ request, params }: Route.ActionArgs) {
    const formData = await request.formData();

    const cookieHeader = request.headers.get('Cookie') ?? '';
    const token = cookieHeader
        .split(';')
        .find(c => c.trim().startsWith('token='))
        ?.split('=')[1];

    if (!token) return { error: 'Login required' };

    const featured = formData.get('featured') === 'true' ? 'true' : 'false';
    formData.set('featured', featured);

    const apiUrl = import.meta.env.VITE_API_URL || process.env.VITE_API_URL;
    const res = await fetch(`${apiUrl}/api/products/${params.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
    });

    const data = await res.json();

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

function EditProduct() {
    const { product } = useLoaderData() as { product: ProductType | null };
    const actionData = useActionData() as { error?: string };
    const navigation = useNavigation();
    const isSubmitting = navigation.state === 'submitting';

    const [preview, setPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setPreview(URL.createObjectURL(file));
    }

    if (!product) {
        return (
            <div className='max-w-3xl mx-auto p-5 text-center mt-10'>
                <h1 className='text-2xl font-bold mb-2'>Product Not Found</h1>
                <button
                    onClick={() => window.history.back()}
                    className='mt-4 px-4 py-2 bg-[#AB2320] text-white font-bold rounded-md cursor-pointer'
                >
                    Go Back
                </button>
            </div>
        )
    }

    return (
        <section className='max-w-3xl mx-auto p-5 mt-5'>
            <div className='flex items-center gap-3 mb-8'>
                <FaStore className='text-[#AB2320]' size={24} />
                <div>
                    <h1 className='text-3xl font-bold'>Edit Product</h1>
                    <p className='text-gray-500 text-sm'>Update your product details</p>
                </div>
            </div>

            {actionData?.error && (
                <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
                    <p className='text-red-600 font-semibold text-sm'>{actionData.error}</p>
                </div>
            )}

            <form method='post' encType='multipart/form-data' className='flex flex-col gap-6'>

                {/* image */}
                <div className='bg-white p-6 rounded-lg shadow-sm'>
                    <h2 className='font-bold text-lg mb-4'>Product Image</h2>

                    {/* current image */}
                    {!preview && (
                        <div className='mb-4'>
                            <p className='text-sm text-gray-500 mb-2'>Current Image</p>
                            <img
                                src={getImageUrl(product.img)}
                                alt={product.title}
                                className='h-40 object-contain rounded bg-gray-100 p-2'
                            />
                        </div>
                    )}

                    <div
                        onClick={() => fileRef.current?.click()}
                        className='border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#AB2320] transition'
                    >
                        {preview ? (
                            <img
                                src={preview}
                                alt='preview'
                                className='max-h-40 object-contain rounded'
                            />
                        ) : (
                            <>
                                <FaImage className='text-gray-300 mb-2' size={36} />
                                <p className='text-gray-500 font-semibold text-sm'>Click to upload new image</p>
                                <p className='text-gray-400 text-xs mt-1'>Leave empty to keep current image</p>
                            </>
                        )}
                    </div>

                    <input
                        ref={fileRef}
                        type='file'
                        name='img'
                        accept='image/*'
                        onChange={handleImageChange}
                        className='hidden'
                    />
                    {preview && (
                        <button
                            type='button'
                            onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                            className='mt-2 text-xs text-red-500 hover:underline cursor-pointer'
                        >
                            Remove new image
                        </button>
                    )}
                </div>

                {/* product details — prefilled with existing values */}
                <div className='bg-white p-6 rounded-lg shadow-sm flex flex-col gap-4'>
                    <h2 className='font-bold text-lg'>Product Details</h2>

                    <div className='flex flex-col gap-1'>
                        <label className='text-sm font-semibold text-gray-700'>Product Title</label>
                        <input
                            type='text'
                            name='title'
                            required
                            defaultValue={product.title}  // ← prefilled
                            className='border-[3px] border-white rounded bg-[#FAF8F4] shadow py-2 px-4 focus:border-[#AB2320] outline-none'
                        />
                    </div>

                    <div className='flex flex-col gap-1'>
                        <label className='text-sm font-semibold text-gray-700'>Description</label>
                        <textarea
                            name='description'
                            required
                            rows={4}
                            defaultValue={product.description}  // ← prefilled
                            className='border-[3px] border-white rounded bg-[#FAF8F4] shadow py-2 px-4 focus:border-[#AB2320] outline-none resize-none'
                        />
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        <div className='flex flex-col gap-1'>
                            <label className='text-sm font-semibold text-gray-700'>Price (USD)</label>
                            <input
                                type='number'
                                name='price'
                                required
                                min='0'
                                step='0.01'
                                defaultValue={product.price}  // ← prefilled
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
                                defaultValue={product.stock}  // ← prefilled
                                className='border-[3px] border-white rounded bg-[#FAF8F4] shadow py-2 px-4 focus:border-[#AB2320] outline-none'
                            />
                        </div>
                    </div>

                    <div className='flex flex-col gap-1'>
                        <label className='text-sm font-semibold text-gray-700'>Category</label>
                        <select
                            name='category'
                            required
                            defaultValue={product.category.toUpperCase() === 'CPU' ? 'CPU' : 
                                CATEGORIES.find(c => c.toLowerCase() === product.category.toLowerCase()) ?? product.category}
                            className='border-[3px] border-white rounded bg-[#FAF8F4] shadow py-2 px-4 focus:border-[#AB2320] outline-none'
                        >
                            <option value=''>Select a category</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className='flex items-center gap-3 p-4 bg-[#FAF8F4] rounded-lg'>
                        <input
                            type='checkbox'
                            name='featured'
                            id='featured'
                            value='true'
                            defaultChecked={product.featured}  // ← prefilled
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
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </section>
    )
}

export default EditProduct