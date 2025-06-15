document.addEventListener('DOMContentLoaded', function() {
    console.log('JS Loaded: main.js script is active.'); // Добавлено для отслеживания загрузки JS

    // Проверка, что Swiper.js загружен
    if (typeof Swiper === 'undefined') {
        console.warn('Swiper library is not loaded. Carousel functionalities will be disabled.');
    }

    // Smooth scrolling для навигации
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelectorAll('nav a').forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const header = document.querySelector('header');
                const nav = document.querySelector('nav');
                const headerOffset = header ? header.offsetHeight : 0;
                const navOffset = nav ? nav.offsetHeight : 0;
                const totalOffset = headerOffset + navOffset + 20;

                console.log('Navigation click: Attempting to remove no-scroll for smooth scrolling.');
                document.body.classList.remove('no-scroll');
                console.log('Navigation click: no-scroll status after removal:', document.body.classList.contains('no-scroll'));

                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - totalOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // Изменение хедера при скролле
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');
    if (header && nav) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('header-scrolled');
                nav.classList.add('nav-scrolled');
            } else {
                header.classList.remove('header-scrolled');
                nav.classList.remove('nav-scrolled');
            }
        });
    }

    // --- Инициализация Swiper для основных галерей (НОВОСТРОЙКИ и ВТОРИЧКА) ---
    if (typeof Swiper !== 'undefined') {
        new Swiper('#new-developments .swiper-container', {
            slidesPerView: 'auto',
            spaceBetween: 20,
            centeredSlides: true,
            loop: true,
            pagination: {
                el: '#new-developments .swiper-pagination',
                clickable: true,
            },
            grabCursor: true,
            simulateTouch: true,
            touchEventsTarget: 'wrapper',
            breakpoints: {
                768: {
                    slidesPerView: 2,
                    spaceBetween: 30,
                    centeredSlides: false,
                },
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 40,
                    centeredSlides: false,
                },
            },
        });

        new Swiper('#resale-properties .swiper-container', {
            slidesPerView: 'auto',
            spaceBetween: 20,
            centeredSlides: true,
            loop: true,
            pagination: {
                el: '#resale-properties .swiper-pagination',
                clickable: true,
            },
            grabCursor: true,
            simulateTouch: true,
            touchEventsTarget: 'wrapper',
            breakpoints: {
                768: {
                    slidesPerView: 2,
                    spaceBetween: 30,
                    centeredSlides: false,
                },
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 40,
                    centeredSlides: false,
                },
            },
        });
    } else {
        console.info('Swiper carousels for #new-developments and #resale-properties will not be initialized as Swiper library is missing.');
    }


    // --- Логика Модального Окна Деталей Объекта ---
    const propertyModal = document.getElementById('propertyModal');
    const closeModalButton = propertyModal ? propertyModal.querySelector('.close-button') : null;
    const openModalButtons = document.querySelectorAll('.open-modal-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalDetails = document.getElementById('modal-details');
    const modalDescription = document.getElementById('modal-description');
    const modalTotalPrice = propertyModal ? propertyModal.querySelector('.modal-total-price') : null;
    const modalImageWrapper = propertyModal ? propertyModal.querySelector('.modal-image-gallery .swiper-wrapper') : null;
    const modalContactButton = propertyModal ? propertyModal.querySelector('.contact-object-btn') : null;

    let modalSwiperInstance = null;

    openModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const propertyId = this.dataset.propertyId;
            openPropertyModal(propertyId);
        });
    });

    if (closeModalButton) {
        closeModalButton.addEventListener('click', closePropertyModal);
    }
    
    if (propertyModal) {
        propertyModal.addEventListener('click', function(event) {
            if (event.target === propertyModal) {
                console.log('Clicked outside property modal. Closing...');
                closePropertyModal();
            }
        });
    }

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && propertyModal && propertyModal.classList.contains('show')) {
            console.log('Escape key pressed. Closing property modal.');
            closePropertyModal();
        }
    });

    if (modalContactButton) {
        modalContactButton.addEventListener('click', function(e) {
            e.preventDefault();

            const targetElement = document.querySelector('#contact');

            if (targetElement) {
                console.log('Contact button clicked: Calling closePropertyModal().');
                closePropertyModal(); 

                setTimeout(() => {
                    console.log('Contact button setTimeout: Attempting to scroll to contact section.');
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                    console.log('Contact button setTimeout: After scroll, attempting to remove no-scroll again.');
                    document.body.classList.remove('no-scroll'); 
                    console.log('Contact button setTimeout: no-scroll status after second removal:', document.body.classList.contains('no-scroll'));
                }, 1000); 

                document.querySelectorAll('nav a').forEach(link => link.classList.remove('active'));
                const contactNavLink = document.querySelector('nav a[href="#contact"]');
                if (contactNavLink) {
                    contactNavLink.classList.add('active');
                }
            }
        });
    }

    function openPropertyModal(propertyId) {
        if (!propertyModal || !modalTitle || !modalDescription || !modalTotalPrice || !modalImageWrapper || !modalDetails || !modalContactButton) {
            console.error('One or more required modal elements are missing. Cannot open property modal.');
            alert('Извините, произошла ошибка при загрузке информации об объекте. Пожалуйста, обновите страницу.');
            return;
        }

        fetch(`/property/${propertyId}/`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText + ' (Status: ' + response.status + ')');
                }
                return response.json();
            })
            .then(data => {
                modalTitle.textContent = `${data.rooms || ''}к. ${data.title || 'Объект без названия'}`;
                modalDescription.textContent = data.description || 'Описание отсутствует.';
                modalTotalPrice.textContent = `${formatPrice(data.price)} ₽`;
                modalContactButton.dataset.propertyId = data.id;

                modalDetails.innerHTML = `
                    <li>Адрес: ${data.address || 'Не указан'}</li>
                    <li>Площадь: ${data.area ? data.area + ' м²' : 'Не указана'}</li>
                    <li>Цена за м²: ${data.price_per_sqm ? formatPrice(data.price_per_sqm) + ' ₽' : 'Не указана'}</li>
                    <li>Тип недвижимости: ${data.property_type || 'Не указан'}</li>
                    <li>Застройщик: ${data.developer || 'Не указан'}</li>
                    <li>Срок сдачи: ${data.completion_date || 'Не указан'}</li>
                    <li>Балкон/Лоджия: ${data.has_balcony ? 'Да' : 'Нет'}</li>
                    <li>Парковка: ${data.has_parking ? 'Да' : 'Нет'}</li>
                `;

                modalImageWrapper.innerHTML = '';

                const imagesToDisplay = (data.photos && Array.isArray(data.photos) && data.photos.length > 0) ?
                                         data.photos.map(p => typeof p === 'string' ? p : p.image_url) :
                                         (data.main_photo ? [data.main_photo] : []);

                if (imagesToDisplay.length > 0) {
                    imagesToDisplay.forEach(photoUrl => {
                        const slide = document.createElement('div');
                        slide.classList.add('swiper-slide');
                        const img = document.createElement('img');
                        img.src = photoUrl;
                        img.alt = `Изображение объекта: ${data.title || ''}`;
                        slide.appendChild(img);
                        modalImageWrapper.appendChild(slide);
                    });
                } else {
                    const slide = document.createElement('div');
                    slide.classList.add('swiper-slide');
                    const img = document.createElement('img');
                    img.src = "/static/img/no_image.jpg";
                    img.alt = "Изображение не найдено";
                    slide.appendChild(img);
                    modalImageWrapper.appendChild(slide);
                }
                
                if (modalSwiperInstance) {
                    modalSwiperInstance.destroy(true, true);
                    modalSwiperInstance = null;
                }
                if (typeof Swiper !== 'undefined') {
                    modalSwiperInstance = new Swiper(propertyModal.querySelector('.modal-image-gallery'), {
                        slidesPerView: 1,
                        spaceBetween: 10,
                        loop: imagesToDisplay.length > 1,
                        pagination: { el: '.modal-image-gallery .swiper-pagination', clickable: true },
                        grabCursor: true,
                        simulateTouch: true,
                        touchEventsTarget: 'wrapper',
                        on: {
                            click: function(swiper, event) {
                                if (event.target.tagName === 'IMG' && modalContactButton) {
                                    const clickedPropertyId = modalContactButton.dataset.propertyId;
                                    const clickedSlideIndex = swiper.realIndex;
                                    openFullscreenImageModal(clickedPropertyId, clickedSlideIndex);
                                }
                            }
                        }
                    });
                } else {
                    console.info('Swiper gallery inside property modal will not be initialized.');
                }

                propertyModal.classList.add('show');
                console.log('openPropertyModal: Adding no-scroll to body.');
                document.body.classList.add('no-scroll'); // <-- Здесь добавляется no-scroll
                console.log('openPropertyModal: no-scroll status after addition:', document.body.classList.contains('no-scroll'));

            })
            .catch(error => {
                console.error('Ошибка при получении данных об объекте:', error);
                alert('Не удалось загрузить информацию об объекте. Пожалуйста, попробуйте позже.');
            });
    }

    function closePropertyModal() {
        if (modalSwiperInstance) {
            console.log('closePropertyModal: Destroying modalSwiperInstance.');
            modalSwiperInstance.destroy(true, true);
            modalSwiperInstance = null;
        }
        if (propertyModal) {
            console.log('closePropertyModal: Removing "show" class from propertyModal.');
            propertyModal.classList.remove('show');
        }
        console.log('closePropertyModal: Attempting to remove no-scroll from body.');
        document.body.classList.remove('no-scroll'); // <-- Здесь удаляется no-scroll
        console.log('closePropertyModal: no-scroll status after removal:', document.body.classList.contains('no-scroll'));
        
        if (modalTitle) modalTitle.textContent = '';
        if (modalDescription) modalDescription.textContent = '';
        if (modalDetails) modalDetails.innerHTML = '';
        if (modalTotalPrice) modalTotalPrice.textContent = '';
        if (modalImageWrapper) modalImageWrapper.innerHTML = '';
    }

    function formatPrice(price) {
        if (price === null || price === undefined || isNaN(price)) return '';
        return parseFloat(price).toLocaleString('ru-RU');
    }

    // --- Полноэкранное модальное окно для просмотра изображений ---
    const fullscreenImageModal = document.getElementById('fullscreenImageModal');
    const fullscreenSwiperWrapper = fullscreenImageModal ? fullscreenImageModal.querySelector('.swiper-wrapper') : null;
    const fullscreenCloseButton = fullscreenImageModal ? fullscreenImageModal.querySelector('.fullscreen-close-button') : null;

    let currentFullscreenSwiper = null;

    document.querySelectorAll('.property-card img').forEach(img => {
        img.addEventListener('click', function() {
            const propertyCard = this.closest('.property-card');
            if (propertyCard) {
                const propertyId = propertyCard.dataset.propertyId;
                openFullscreenImageModal(propertyId); 
            }
        });
    });

    if (fullscreenCloseButton) {
        fullscreenCloseButton.addEventListener('click', closeFullscreenImageModal);
    }

    if (fullscreenImageModal) {
        fullscreenImageModal.addEventListener('click', function(event) {
            if (event.target === fullscreenImageModal) {
                console.log('Clicked outside fullscreen modal. Closing...');
                closeFullscreenImageModal();
            }
        });
    }

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && fullscreenImageModal && fullscreenImageModal.classList.contains('show')) {
            console.log('Escape key pressed. Closing fullscreen modal.');
            closeFullscreenImageModal();
        }
    });

    function openFullscreenImageModal(propertyId, initialSlideIndex = 0) {
        if (!fullscreenImageModal || !fullscreenSwiperWrapper) {
            console.error('Fullscreen modal elements are missing. Cannot open fullscreen gallery.');
            return;
        }

        fetch(`/properties/${propertyId}/photos/`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText + ' (Status: ' + response.status + ')');
                }
                return response.json();
            })
            .then(data => {
                if (data.photos && Array.isArray(data.photos) && data.photos.length > 0) {
                    fullscreenSwiperWrapper.innerHTML = '';

                    data.photos.forEach(photoUrl => {
                        const slide = document.createElement('div');
                        slide.classList.add('swiper-slide');
                        const img = document.createElement('img');
                        img.src = photoUrl;
                        img.alt = "Изображение объекта";
                        slide.appendChild(img);
                        fullscreenSwiperWrapper.appendChild(slide);
                    });

                    if (currentFullscreenSwiper) {
                        console.log('openFullscreenImageModal: Destroying previous currentFullscreenSwiper.');
                        currentFullscreenSwiper.destroy(true, true);
                        currentFullscreenSwiper = null;
                    }
                    
                    if (typeof Swiper !== 'undefined') {
                        currentFullscreenSwiper = new Swiper(fullscreenImageModal.querySelector('.fullscreen-swiper-container'), {
                            loop: true,
                            speed: 300,
                            initialSlide: initialSlideIndex,
                            pagination: {
                                el: '#fullscreenImageModal .swiper-pagination',
                                clickable: true,
                            },
                            grabCursor: true,
                            simulateTouch: true,
                            touchEventsTarget: 'wrapper',
                            on: {
                                touchEnd: function(swiper, event) {
                                    const startY = swiper.touchEventsData.startY;
                                    const currentY = event.changedTouches ? event.changedTouches[0].pageY : event.pageY;
                                    const deltaY = currentY - startY;
                                    const startX = swiper.touchEventsData.startX;
                                    const currentX = event.changedTouches ? event.changedTouches[0].pageX : event.pageX;
                                    const deltaX = Math.abs(currentX - startX);

                                    if (deltaY > 50 && deltaX < 50) { 
                                        console.log('Fullscreen modal: Swipe down detected. Closing.');
                                        closeFullscreenImageModal();
                                    }
                                }
                            }
                        });
                    } else {
                        console.info('Swiper gallery inside fullscreen modal will not be initialized.');
                    }

                    fullscreenImageModal.classList.add('show');
                    console.log('openFullscreenImageModal: Adding no-scroll to body.');
                    document.body.classList.add('no-scroll'); // <-- Здесь добавляется no-scroll
                    console.log('openFullscreenImageModal: no-scroll status after addition:', document.body.classList.contains('no-scroll'));

                    if (propertyModal && propertyModal.classList.contains('show')) {
                        console.log('openFullscreenImageModal: propertyModal was open, hiding it.');
                        propertyModal.classList.remove('show');
                    }

                } else {
                    alert('Изображения для этого объекта не найдены.');
                }
            })
            .catch(error => {
                console.error('Ошибка загрузки изображений для полноэкранного режима:', error);
                alert('Не удалось загрузить изображения. Пожалуйста, попробуйте позже.');
            });
    }

    function closeFullscreenImageModal() {
        if (currentFullscreenSwiper) {
            console.log('closeFullscreenImageModal: Destroying currentFullscreenSwiper.');
            currentFullscreenSwiper.destroy(true, true);
            currentFullscreenSwiper = null;
        }
        if (fullscreenImageModal) {
            console.log('closeFullscreenImageModal: Removing "show" class from fullscreenImageModal.');
            fullscreenImageModal.classList.remove('show');
        }
        console.log('closeFullscreenImageModal: Attempting to remove no-scroll from body.');
        document.body.classList.remove('no-scroll'); // <-- Здесь удаляется no-scroll
        console.log('closeFullscreenImageModal: no-scroll status after removal:', document.body.classList.contains('no-scroll'));
        
        if (fullscreenSwiperWrapper) {
            fullscreenSwiperWrapper.innerHTML = '';
        }
    }

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Форма отправлена! (Это демонстрация, реальная отправка требует бэкенда)'); 
            contactForm.reset();
        });
    }

});