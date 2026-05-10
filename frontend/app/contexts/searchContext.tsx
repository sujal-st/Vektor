import React,{useContext, useState, createContext} from "react";

type SearchContextType={
    query: string;
    setQuery:(q:string)=>void;
}

export const searchContext = createContext<SearchContextType>({
    query:'',
    setQuery:()=>{},
});

export function SearchProvider({children}:{children: React.ReactNode}){
    const [query,setQuery]=useState('');
    return(
        <searchContext.Provider value={{query, setQuery}}>
            {children}
        </searchContext.Provider>
    )
}

export const useSearch = () => useContext(searchContext);