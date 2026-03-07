import { useEffect, useState, useContext } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router'
import { FaTimes, FaBars, FaShoppingCart, FaStore } from 'react-icons/fa'
import logo from '../../public/Vektor.png'
import { cartContext } from '~/contexts/cartContext';

function NavBar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState<{ userName: string, is_admin: boolean } | null>(null);

    const base = 'transition hover:text-[#AB2320]'
    const active = 'text-[#AB2320] font-semibold'

    const location = useLocation()
    useEffect(() => {
        const userCookie = document.cookie
            .split(";")
            .find(c => c.trim().startsWith('user='))
            ?.split("=")[1];

        if (userCookie)
            setUser(JSON.parse(decodeURIComponent(userCookie)))
        else
            setUser(null)
    }, [location])

    const { cart } = useContext(cartContext);
    const navigate = useNavigate();
    const { setCart } = useContext(cartContext);

    const handleLogout = () => {
        document.cookie = 'user=; Path=/; Max-Age=0';
        document.cookie = 'token=; Path=/; Max-Age=0';
        setUser(null);
        setCart([]);
        navigate("/")
    }

    return (
        <nav className='sticky top-0 z-50 bg-white shadow-sm'>
            <div className="max-w-full mx-auto px-6 py-4 flex justify-between items-center">
                <NavLink to='/' className='text-lg font-bold'>
                    <img src={logo} className='h-12' />
                </NavLink>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    {user?.is_admin ? (
                        <div className='flex items-center gap-4'>
                            <div className='flex items-center gap-2 text-sm'>
                                <FaStore className='text-[#AB2320]' size={14} />
                                <NavLink className={({ isActive }) => isActive ? active : base} to='/seller/dashboard'>
                                    Dashboard
                                </NavLink>
                            </div>
                            <div className='flex items-center gap-2'>
                                <span className='text-sm font-semibold text-gray-600'>Hi, {user.userName}</span>
                                <button onClick={handleLogout} className='px-3 py-1 border-2 border-[#AB2320] text-[#AB2320] rounded font-semibold cursor-pointer text-sm'>
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="w-fit space-x-4 text-sm">
                                <NavLink className={({ isActive }) => isActive ? active : base} to='/'>Home</NavLink>
                                <NavLink className={({ isActive }) => isActive ? active : base} to='/products'>Products</NavLink>
                                <NavLink className={({ isActive }) => isActive ? active : base} to='/about'>About</NavLink>
                                <NavLink className={({ isActive }) => isActive ? active : base} to='/contact'>Contact</NavLink>
                            </div>

                            <div className='relative'>
                                <span className='absolute -top-2 -right-2 bg-[#AB2320] text-white text-xs font-semibold px-1.5 rounded-full'>
                                    {cart.length}
                                </span>
                                <NavLink to='/cart'><FaShoppingCart /></NavLink>
                            </div>

                            <div className='flex gap-2'>
                                {user ? (
                                    <div className='flex items-center gap-2'>
                                        <NavLink to="/dashboard" className='text-sm font-semibold text-gray-600'>
                                            Hi, {user.userName}
                                        </NavLink>
                                        <button onClick={handleLogout} className='px-3 py-1 border-2 border-[#AB2320] text-[#AB2320] rounded font-semibold cursor-pointer text-sm'>
                                            Logout
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <NavLink to='/login' className='px-3 py-1 border-2 border-[#AB2320] text-[#AB2320] rounded font-semibold cursor-pointer text-sm'>Login</NavLink>
                                        <NavLink to='/signup' className='px-3 py-1 bg-[#AB2320] rounded text-[#F6F1E6] font-semibold cursor-pointer text-sm'>Sign-up</NavLink>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Mobile right side — cart + hamburger */}
                <div className="flex md:hidden items-center gap-4">
                    {!user?.is_admin && (
                        <NavLink to='/cart' className='relative'>
                            <span className='absolute -top-2 -right-2 bg-[#AB2320] text-white text-xs font-semibold px-1.5 rounded-full'>
                                {cart.length}
                            </span>
                            <FaShoppingCart size={20} className='text-gray-700' />
                        </NavLink>
                    )}
                    <button onClick={() => setMenuOpen(!menuOpen)} className="cursor-pointer text-[#AB2320] text-xl" title='Menu'>
                        {menuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav Dropdown */}
            {menuOpen && (
                <div className='flex md:hidden bg-[#ECE2CD] border-t border-gray-300 flex-col px-6 py-4 gap-3'>
                    {user?.is_admin ? (
                        <div className='flex flex-col gap-3'>
                            <div className='flex items-center gap-2'>
                                <FaStore className='text-[#AB2320]' size={14} />
                                <NavLink
                                    onClick={() => setMenuOpen(false)}
                                    className={({ isActive }) => isActive ? active : base}
                                    to='/seller/dashboard'
                                >
                                    Dashboard
                                </NavLink>
                            </div>
                            <div className='flex items-center justify-between'>
                                <span className='text-sm font-semibold'>Hi, {user.userName}</span>
                                <button
                                    onClick={() => { setMenuOpen(false); handleLogout(); }}
                                    className='px-3 py-1 border-2 border-[#AB2320] text-[#AB2320] rounded font-semibold cursor-pointer text-sm'
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <NavLink onClick={() => setMenuOpen(false)} className={({ isActive }) => `py-1 ${isActive ? active : base}`} to='/'>Home</NavLink>
                            <NavLink onClick={() => setMenuOpen(false)} className={({ isActive }) => `py-1 ${isActive ? active : base}`} to='/products'>Products</NavLink>
                            <NavLink onClick={() => setMenuOpen(false)} className={({ isActive }) => `py-1 ${isActive ? active : base}`} to='/about'>About</NavLink>
                            <NavLink onClick={() => setMenuOpen(false)} className={({ isActive }) => `py-1 ${isActive ? active : base}`} to='/contact'>Contact</NavLink>

                            <div className='border-t border-gray-300 pt-3 flex items-center justify-between'>
                                {user ? (
                                    <>
                                        <NavLink to="/dashboard" onClick={() => setMenuOpen(false)} className='text-sm font-semibold text-gray-700'>
                                            Hi, {user.userName}
                                        </NavLink>
                                        <button
                                            onClick={() => { setMenuOpen(false); handleLogout(); }}
                                            className='px-3 py-1 border-2 border-[#AB2320] text-[#AB2320] rounded font-semibold cursor-pointer text-sm'
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <div className='flex gap-2 w-full'>
                                        <NavLink to='/login' onClick={() => setMenuOpen(false)} className='flex-1 text-center px-3 py-2 border-2 border-[#AB2320] text-[#AB2320] rounded font-semibold text-sm'>
                                            Login
                                        </NavLink>
                                        <NavLink to='/signup' onClick={() => setMenuOpen(false)} className='flex-1 text-center px-3 py-2 bg-[#AB2320] rounded text-[#ECE2CD] font-semibold text-sm'>
                                            Sign-up
                                        </NavLink>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </nav>
    )
}

export default NavBar