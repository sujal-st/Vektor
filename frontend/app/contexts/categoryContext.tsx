import {useState, createContext} from 'react'
const categoryContext= createContext<any>(null);

type catType={
    cat:string;
    setCat:(cat:string)=>void;
}
const CategoryProvider=({children}:any)=>{
    const [cat,setCat]=useState('All');
    return(
        <categoryContext.Provider value={{cat,setCat}}>
            {children}
        </categoryContext.Provider>
    )
}

export  {categoryContext,CategoryProvider};
