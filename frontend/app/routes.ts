import { type RouteConfig, index,route, layout, } from "@react-router/dev/routes";

export default [
    layout('./routes/layouts/home.tsx',[index('routes/home/home.tsx')]),
    layout('./routes/layouts/Main.tsx',[
        route('about','./routes/about/about.tsx'),
        route('contact','./routes/contact/contact.tsx'),
        route('products','./routes/products/products.tsx'),
        route('products/:id','./routes/products/productdetails.tsx'),
        route("cart","./routes/cart/cart.tsx"),
        route('checkout', './routes/checkout/Checkout.tsx'),
        route('my-orders/:id', './routes/orders/orderDetails.tsx'),
        route('dashboard', './routes/dashboards/UserDash.tsx'),
        route('seller/dashboard', './routes/dashboards/SellerDash.tsx'),
        route('seller/add-product', './routes/seller/AddProduct.tsx'),
        route('seller/orders/:id', './routes/seller/OrderDetail.tsx'),
        route('seller/edit-product/:id', './routes/seller/EditProduct.tsx'),
    ]),
    route('login','./routes/logForm/Login.tsx'),
    route('signup','./routes/logForm/Signup.tsx'),
    route('seller/register', './routes/seller/SellerReg.tsx'),

] satisfies RouteConfig;
