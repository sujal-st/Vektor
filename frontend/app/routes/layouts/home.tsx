import { Outlet } from "react-router";
import Hero from "~/components/Hero";
import NavBar from "~/components/NavBar";

function HomeLayout() {
    return (
        <>
            <NavBar />
            <Hero />
            <section>
                <Outlet />
            </section>
        </>
    )
}
export default HomeLayout;