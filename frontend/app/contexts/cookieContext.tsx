import React, { createContext,useState, type ReactElement } from 'react'

type UserCookieType={
    id: string;
    userName:string;
    email: string;
    is_admin: boolean;
}
type cookieContextType={
    user: UserCookieType | null;
    setUser: React.Dispatch<React.SetStateAction<UserCookieType|null>>;
}
function getUserCookie():UserCookieType|null{

    if(typeof document==='undefined') return null;

    const match= document.cookie.split(";");
    const user=match.find(row=>row.startsWith('user='));

    if(!user) return null;
    try{
        return JSON.parse(decodeURIComponent(user.split("=")[1]));
    }catch{return null;}
}

const cookieContext=createContext<cookieContextType>({
    user:null,
    setUser:()=>{}
});

const CookieProvider=({children}:{children:React.ReactNode})=>{
    const [user,setUser]=useState<UserCookieType|null>(getUserCookie);

    return(
        <cookieContext.Provider value={{user,setUser}}>
            {children}
        </cookieContext.Provider>
    )
}

export {cookieContext,CookieProvider};
