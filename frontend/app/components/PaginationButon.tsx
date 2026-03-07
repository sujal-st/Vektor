import React from 'react'

type PaginaitonType={
    totalPages:number;
    currentPage:number;
    onCurrentPage: (page:number)=>void;
}
function PaginationButon({ totalPages, currentPage,onCurrentPage}:PaginaitonType) {
    return (
        <div className='flex justify-center gap-2 mb-4'>
            {Array.from({ length: totalPages }, (_, idx) => (
                <button 
                    key={idx + 1}
                    className={`rounded-sm px-2 py-2 font-semibold ${currentPage===idx+1?'bg-[#AB2320] text-[#F6F1E6]':'text-[#AB2320] border border-[#AB2320]'}`}
                    onClick={()=>onCurrentPage(idx+1)}
                >{idx+1}</button>
      ))}
        </div>
    )
}

export default PaginationButon
