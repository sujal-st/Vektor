import React, { useContext } from 'react'
import { searchContext } from '~/contexts/searchContext'
import { FaSearch, FaTimes } from "react-icons/fa";

function SearchBar() {
    const { query, setQuery } = useContext(searchContext);
    return (
        <div className=' bg-white mx-auto px-4 py-2 mt-2 shadow-md border-b border-gray-200 flex items-center gap-2 w-300 focus-within:ring-2 focus-within:ring-[#AB2320] rounded-lg'>
            <FaSearch size={24} />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-10 py-3 rounded-lg border font-semibold border-none text-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-none focus:ring-[#AB2320] focus:border-transparent transition"
            />

            {/* Clear button */}
            <button
                onClick={() => setQuery('')}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
                aria-label="Clear search"
            >
                <FaTimes size={24} />
            </button>

        </div>
    );
}

export default SearchBar
