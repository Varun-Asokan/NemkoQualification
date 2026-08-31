$(window).on("load", function () {
    var swiperQuickLinks = new Swiper(".quick-links-swiper", {
      spaceBetween: 12,
      slidesPerView: 1,
      speed: 1400,
      pagination: false,
      navigation: {
        nextEl: ".quick-link-slide-next",
        prevEl: ".quick-link-slide-prev",
      },
      breakpoints: {
        360: {
          slidesPerView: 2,
        },
        480: {
          slidesPerView: 3,
        },
        768: {
          slidesPerView: 4,
        },
        992: {
          slidesPerView: 6,
        }
      }
    });
    var swiperNewsCentre = new Swiper(".news-centre-swiper", {
      spaceBetween: 12,
      slidesPerView: 1,
      speed: 1400,
      pagination: false,
      breakpoints: {
        768: {
          slidesPerView: 2,
        },
        992: {
          slidesPerView: 3,
        }
      }
    });
    var swiperAnnouncement = new Swiper(".announcement-swiper", {
      spaceBetween: 12,
      slidesPerView: 1,
      speed: 1400,
      navigation: {
        nextEl: ".announcement-slide-next",
        prevEl: ".announcement-slide-prev",
      },
      breakpoints: {
        992: {
          spaceBetween: 24,
        }
      }
    });

  });