import { FaStar } from "react-icons/fa";

const StarRating=({rating}:{rating: number})=>{
        return(
            <div className='flex gap-1'>
                {[1,2,3,4,5].map((star)=>(
                    <span key={star} className={star<=rating? "text-yellow-400":"text-gray-300"}>
                        <FaStar/>
                    </span>
                ))}
            </div>
        )
    }

export default StarRating;