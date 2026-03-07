import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";

export default function AutoCarousel() {
  const slides = [
    "/assets/hero-icon.png",
    "/assets/hero-icon1.png",
  ];

  return (
    <Swiper className="swiper-size"
      modules={[Autoplay]}
      slidesPerView={1}
      spaceBetween={20}
      loop={true}                     // Infinite loop
      autoplay={{ delay: 3000 }}      // Auto-scroll every 3 seconds
      allowTouchMove={false}          // Disable swipe manually
    >
      {slides.map((slide, index) => (
        <SwiperSlide key={index}>
          <img
            src={slide}
            alt={`Slide ${index + 1}`}
            className="w-full h-full object-cover rounded-2xl"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
