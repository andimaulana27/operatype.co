// src/components/HeroCarousel.tsx
'use client';

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/pagination';

const heroSlides = [
  '/images/hero/slide-1.jpg',
  '/images/hero/slide-2.jpg',
  '/images/hero/slide-3.jpg',
  '/images/hero/slide-4.jpg',
];

const HeroCarousel = () => {
  return (
    <section className="relative w-full overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true, el: '.swiper-pagination-custom' }}
        className="w-full h-[500px]"
      >
        {heroSlides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-full">
              {/* PERUBAHAN DI SINI: Menambahkan `priority` hanya untuk slide pertama */}
              <Image 
                src={slide} 
                alt={`Hero Slide ${index + 1}`} 
                layout="fill" 
                objectFit="cover" 
                priority={index === 0} 
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {/* Custom pagination container */}
      <div className="swiper-pagination-custom absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex space-x-2"></div>
    </section>
  );
};

export default HeroCarousel;