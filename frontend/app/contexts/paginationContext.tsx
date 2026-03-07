import React,{useState,createContext} from 'react'

const paginationContext=createContext<any>(null);

const PaginationProvider=({children}:any)=>{
    const [currentPage,setCurrentPage]=useState(1);
    return(
        <paginationContext.Provider value={{currentPage, setCurrentPage}}>
            {children}
        </paginationContext.Provider>
    )
}


export  {paginationContext, PaginationProvider}
