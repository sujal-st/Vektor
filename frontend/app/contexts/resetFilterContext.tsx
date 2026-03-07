import {useState, createContext} from 'react'
const filterContext = createContext<any>(null)

const FilterProvider=({children}:any)=>{
    const [priceRange, setPriceRange]=useState([0,200000]);
    return(
        <filterContext.Provider value={{priceRange, setPriceRange}}>
            {children}
        </filterContext.Provider>
    )
}



export {filterContext, FilterProvider}
