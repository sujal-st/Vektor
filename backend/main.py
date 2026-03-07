from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routes import authRoute, productRoutes, cartRoutes, reviewRoute, orderRoutes
app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

app.mount("/uploads",StaticFiles(directory="uploads"), name="uploads")
app.include_router(authRoute.router, prefix="/api")
app.include_router(productRoutes.router, prefix="/api")
app.include_router(cartRoutes.router, prefix="/api")
app.include_router(reviewRoute.router, prefix="/api")
app.include_router(orderRoutes.router, prefix="/api")