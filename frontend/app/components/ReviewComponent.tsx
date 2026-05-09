import InputComponent from '~/components/InputComponent';
import { Form, useActionData, useFetcher } from 'react-router';
import { FaArrowRight, FaStar, FaCheckCircle, FaLock, FaTrash, FaPen, FaTimes } from 'react-icons/fa';
import StarRating from './StarRating';
import { useState } from 'react';

type ReviewType = {
    id: string;
    user_id: string;
    user_name: string;
    product_id: string;
    text: string;
    rating: number;
    purchased_verification: boolean;
    created_at: string;
}

type reviewProps = {
    reviews: ReviewType[];
    productId: string;
    hasPurchased: boolean;
    currentUserId?: string;
}

function ReviewComponent({ reviews, productId, hasPurchased, currentUserId }: reviewProps) {
    const [selectedRating, setSelectedRating] = useState(0);
    const [editingReview, setEditingReview] = useState<ReviewType | null>(null);
    const [editRating, setEditRating] = useState(0);
    const actionData = useActionData() as { reviewError?: string, reviewSuccess?: boolean };
    const fetcher = useFetcher();
    const safeReviews = Array.isArray(reviews) ? reviews : [];

    function startEdit(review: ReviewType) {
        setEditingReview(review);
        setEditRating(review.rating);
    }

    function cancelEdit() {
        setEditingReview(null);
        setEditRating(0);
    }

    return (
        <section className='p-5 m-5 bg-white rounded-lg'>
            <h2 className="font-bold mb-5">Product Reviews</h2>

            {/* reviews list */}
            <div className='mb-5 flex flex-col space-y-2'>
                {safeReviews.length < 1 && (
                    <h4 className='font-semibold text-lg text-gray-500'>No reviews yet</h4>
                )}
                {safeReviews.map((r) => (
                    <div key={r.id} className='p-4 bg-gray-100 rounded-sm'>

                        {/* view */}
                        {editingReview?.id !== r.id ? (
                            <>
                                <div className='flex items-center gap-3'>
                                    <h4 className='font-semibold text-lg'>{r.user_name}</h4>
                                    <StarRating rating={r.rating} />
                                    {/* verified badge */}
                                    {r.purchased_verification && (
                                        <span className='flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-semibold'>
                                            <FaCheckCircle size={10} />
                                            Verified Purchase
                                        </span>
                                    )}

                                    {/* review owner */}
                                    {currentUserId === r.user_id && (
                                        <div className='ml-auto flex gap-2'>
                                            <button
                                                onClick={() => startEdit(r)}
                                                className='text-gray-400 hover:text-[#AB2320] transition'
                                                title='Edit review'
                                            >
                                                <FaPen size={13} />
                                            </button>
                                            <fetcher.Form method="post">
                                                <input type="hidden" name="intent" value="delete_review" />
                                                <input type="hidden" name="review_id" value={r.id} />
                                                <button
                                                    type="submit"
                                                    className='text-gray-400 hover:text-red-500 transition'
                                                    title='Delete review'
                                                    onClick={(e) => {
                                                        if (!confirm("Delete this review?")) e.preventDefault();
                                                    }}
                                                >
                                                    <FaTrash size={13} />
                                                </button>
                                            </fetcher.Form>
                                        </div>
                                    )}
                                </div>
                                <div className='mt-2'>
                                    <p className='text-gray-500'>{r.text}</p>
                                    <span className='text-xs text-gray-400'>
                                        {new Date(r.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </>
                        ) : (
                            // editing
                            <Form method="post" className='flex flex-col gap-2'>
                                <input type="hidden" name="intent" value="edit_review" />
                                <input type="hidden" name="review_id" value={r.id} />

                                <div className='flex gap-1'>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <label key={star} className='cursor-pointer text-2xl'>
                                            <input
                                                type="radio"
                                                name="rating"
                                                required
                                                className='hidden'
                                                value={star}
                                                defaultChecked={star === r.rating}
                                                onChange={() => setEditRating(star)}
                                            />
                                            <FaStar className={star <= editRating ? 'text-yellow-400' : 'text-gray-300'} />
                                        </label>
                                    ))}
                                </div>

                                <div className='flex items-end gap-2'>
                                    <InputComponent
                                        type='text'
                                        name="review"
                                        defaultValue={r.text}
                                        placeholder='Edit your review'
                                        className="w-full"
                                    />
                                    <button
                                        type="submit"
                                        className='p-2 bg-[#AB2320] text-white rounded-sm hover:bg-[#941d1b] transition'
                                        title='Save'
                                    >
                                        <FaArrowRight size={20} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className='p-2 bg-gray-300 rounded-sm hover:bg-gray-400 transition'
                                        title='Cancel'
                                    >
                                        <FaTimes size={20}/>
                                    </button>
                                </div>
                            </Form>
                        )}
                        
                    </div>
                ))}
            </div>

            {/* review form — only show if purchased */}
            {
                hasPurchased ? (
                    <>
                        {actionData?.reviewSuccess && (
                            <p className='text-green-600 font-semibold text-sm bg-green-50 p-3 rounded-lg mb-3'>
                                Review posted successfully!
                            </p>
                        )}
                        {actionData?.reviewError && (
                            <p className='text-red-500 font-semibold text-sm bg-red-50 p-3 rounded-lg mb-3'>
                                {actionData.reviewError}
                            </p>
                        )}
                        <Form method="post" className='flex flex-col gap-2 w-full'>
                            <label className='font-semibold'>Your Review</label>
                            <input type="hidden" name='product_id' value={productId} />
                            <input type="hidden" name='intent' value="review" />

                            <div className='flex gap-1'>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <label key={star} className='cursor-pointer text-2xl'>
                                        <input
                                            type="radio"
                                            name="rating"
                                            required
                                            className='hidden'
                                            value={star}
                                            onChange={() => setSelectedRating(star)}
                                        />
                                        <FaStar className={star <= selectedRating ? 'text-yellow-400' : 'text-gray-300'} />
                                    </label>
                                ))}
                            </div>

                            <div className='flex items-end gap-4'>
                                <InputComponent
                                    type='text'
                                    name="review"  // ← was empty string
                                    placeholder='Write your review here'
                                    className="w-full"
                                />
                                <button
                                    className='p-2 bg-[#dbdad8] rounded-sm shadow-2xl hover:scale-101 hover:bg-gray-700 hover:text-white transition'
                                    type='submit'
                                >
                                    <FaArrowRight size={24} />
                                </button>
                            </div>
                        </Form>
                    </>
                ) : (
                    // not purchased — show locked message
                    <div className='flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200'>
                        <FaLock className='text-gray-400' size={16} />
                        <p className='text-gray-500 text-sm font-semibold'>
                            Only verified purchasers can leave a review.
                        </p>
                    </div>
                )}
        </section>
    )
}

export default ReviewComponent