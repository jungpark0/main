/* =========================================
   1. Live Time Log
   ========================================= */
const timeElement = document.getElementById('live-time');

function updateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    if (timeElement) {
        timeElement.textContent = `[${month}.${day}.${year} ${hours}:${minutes}:${seconds}]`;
    }
}

if (timeElement) {
    updateTime(); 
    setInterval(updateTime, 1000); 
}

/* =========================================
    2. Cursor Log
    ========================================= */
const cursorLog = document.getElementById('cursor-log');

document.addEventListener('mousemove', (e) => {
    if (cursorLog) {
        const x = String(e.clientX).padStart(3, '0');
        const y = String(e.clientY).padStart(3, '0');
        cursorLog.textContent = `${x} • ${y}`;
    }
});

/* =========================================
    8. Last Updated Relative Time (Auto)
    ========================================= */
const lastUpdatedElement = document.getElementById('last-updated');
const lastUpdateDate = new Date(document.lastModified); 

function calculateTimeSinceUpdate() {
    if (!lastUpdatedElement) return;

    const now = new Date();
    const diffMs = now - lastUpdateDate; 
    
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    let timeString = '';

    if (diffMin < 1) {
        timeString = 'just now..';
    } else if (diffMin < 60) {
        timeString = `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago..`;
    } else if (diffHour < 24) {
        timeString = `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago..`;
    } else {
        timeString = `${diffDay} ${diffDay === 1 ? 'day' : 'days'} ago..`;
    }

    lastUpdatedElement.textContent = `Last updated: ${timeString}`;
}

if (lastUpdatedElement) {
    calculateTimeSinceUpdate(); 
    setInterval(calculateTimeSinceUpdate, 60000); 
}

/* =========================================
    9. Page Load Handling (For Archive & Info)
    ========================================= */
window.addEventListener('DOMContentLoaded', () => {
    // '.graphic-j' (오프닝 애니메이션)가 없는 페이지라면
    if (!document.querySelector('.graphic-j')) {
        // 브라우저가 먼저 '흐린 상태(is-loading)'를 화면에 그리도록 50ms(0.05초) 대기합니다.
        setTimeout(() => {
            // 1.5초짜리 느린 애니메이션(is-leaving-loading)을 추가하지 않고,
            // 단순히 로딩 상태만 지워주면 기본 CSS 설정인 '0.3초(메뉴 호버 속도)'로 스르륵 진해집니다.
            document.body.classList.remove('is-loading');
        }, 50);
    }
});


/* =========================================
   11. Dynamic Info Popup
   ========================================= */
window.addEventListener('DOMContentLoaded', () => {
    // 모든 페이지의 메뉴에서 Info와 Index 링크를 자동으로 찾습니다.
    const menuLinks = document.querySelectorAll('menu a');
    let infoLink = null;
    let indexLink = null;

    menuLinks.forEach(link => {
        if (link.textContent.trim() === 'Info') infoLink = link;
        if (link.textContent.trim() === 'Index') indexLink = link;
    });

    if (infoLink) {
        // Info 버튼의 원래 링크 이동을 막습니다 (# 껍데기만 남김)
        infoLink.setAttribute('href', '#'); 

        infoLink.addEventListener('click', (e) => {
            e.preventDefault(); 

            // 팝업이 이미 생성되어 있는지 확인
            let popup = document.getElementById('dynamic-info-popup');
            
            // 팝업이 없다면 JS가 HTML 요소를 실시간으로 '창조'합니다.
            if (!popup) {
                popup = document.createElement('div');
                popup.id = 'dynamic-info-popup';
                popup.className = 'info-overlay'; // 기존 CSS 디자인 그대로 적용
                
                // 팝업 안에 들어갈 텍스트 내용 삽입
                popup.innerHTML = `
                    <div class="info-text-box">
                        <p>Visual & Interaction</p>
                        <br>
                        <p>특정한 매체에 얽매이지 않고</p>
                        <p>그래픽, 타이포그래피, 웹, 약간의 코딩을</p>
                        <p>오가며 시각을 탐구하는 과정을 기록합니다.</p>
                        <br>
                        <p class="info"><a href="https://www.instagram.com/jungpaark/" target="_blank">@jungpaark</a></p>
                        <p class="info"><a href="mailto:jung_park@naver.com">jung_park@naver.com</a></p>
                    </div>
                `;
                
                // 완성된 팝업을 화면(body)에 끼워 넣습니다.
                document.body.appendChild(popup);
                
                // 팝업의 반투명한 빈 배경을 클릭하면 팝업이 닫히는 센스있는 기능 추가
                popup.addEventListener('click', (event) => {
                    if (event.target === popup) {
                        popup.classList.remove('is-active');
                    }
                });
            }

            // 약간의 딜레이를 주어 CSS의 스르륵 나타나는 애니메이션(transition)이 작동할 틈을 줍니다.
            setTimeout(() => {
                popup.classList.add('is-active');
            }, 10);
        });
    }

    // Index를 눌렀을 때 팝업이 켜져 있다면, 페이지 이동 대신 팝업만 부드럽게 닫습니다.
    if (indexLink) {
        indexLink.addEventListener('click', (e) => {
            const popup = document.getElementById('dynamic-info-popup');
            if (popup && popup.classList.contains('is-active')) {
                e.preventDefault(); 
                popup.classList.remove('is-active');
            }
        });
    }
});

/* =========================================
   Archive Horizontal Scroll & UI Animation (최적화 버전)
   ========================================= */
window.addEventListener('DOMContentLoaded', () => {
    const archiveContainer = document.querySelector('.archive');
    const scrollDirectArchive = document.getElementById('scroll-direct-archive');
    
    const nameText = document.querySelector('.archive-body header .div-flex > p');
    
    window.isScrollingDrag = false; 

    if (archiveContainer) {
        
        // [최적화 1] 스크롤할 때마다 무거운 계산을 피하기 위해 측정값을 저장해둘 변수
        let maxScrollLeft = 0;
        let maxMoveX = 0;

        // [최적화 2] 화면 크기나 글자 크기를 측정하는 함수 (리사이즈될 때만 실행)
        const calculateDimensions = () => {
            if (!nameText) return;
            maxScrollLeft = archiveContainer.scrollWidth - archiveContainer.clientWidth;
            maxMoveX = window.innerWidth - nameText.offsetWidth - 10;
        };

        // [최적화 3] 스크롤 위치에 맞춰 텍스트를 이동시키는 함수
        let isTicking = false;
        const updateProgressBar = () => {
            if (!nameText) return;
            
            if (maxScrollLeft <= 0) {
                nameText.style.transform = `translateX(0px)`;
                return;
            }
            
            const scrollRatio = archiveContainer.scrollLeft / maxScrollLeft;
            const moveX = Math.max(0, maxMoveX * scrollRatio);
            
            // translate3d를 사용하여 크롬에서 하드웨어 가속 강제 활성화
            nameText.style.transform = `translate3d(${moveX}px, 0, 0)`;
        };

        // 1. Scroll Event (requestAnimationFrame으로 초당 60프레임 동기화)
        archiveContainer.addEventListener('scroll', () => {
            if (scrollDirectArchive) {
                if (archiveContainer.scrollLeft > 10) {
                    scrollDirectArchive.style.opacity = '0';
                    scrollDirectArchive.style.pointerEvents = 'none';
                } else {
                    scrollDirectArchive.style.opacity = '1';
                    scrollDirectArchive.style.pointerEvents = 'auto';
                }
            }
            
            // 크롬 스크롤 버벅임 방지용 rAF 패턴
            if (!isTicking) {
                window.requestAnimationFrame(() => {
                    updateProgressBar();
                    isTicking = false;
                });
                isTicking = true;
            }
        }, { passive: true });

        // 브라우저 리사이즈 시에만 무거운 계산(크기 측정)을 다시 수행합니다.
        window.addEventListener('resize', () => {
            calculateDimensions();
            updateProgressBar();
        });
        
        // 초기 로딩 시 폰트가 적용된 직후 1회 계산
        setTimeout(() => {
            calculateDimensions();
            updateProgressBar();
        }, 100);

        // 2. 마우스 휠 스크롤
        let wheelDelta = 0;
        let wheelFrame = null;

        archiveContainer.addEventListener('wheel', (e) => {
            if (window.innerWidth <= 768) return;
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
            if (Math.abs(e.deltaY) === 0) return;

            e.preventDefault();
            wheelDelta += e.deltaY;

            if (!wheelFrame) {
                wheelFrame = requestAnimationFrame(() => {
                    archiveContainer.scrollLeft += wheelDelta;
                    wheelDelta = 0;
                    wheelFrame = null;
                });
            }
        }, { passive: false });

        // 3. 마우스 드래그 스크롤
        let isDown = false;
        let startX;
        let scrollLeft;

        archiveContainer.addEventListener('mousedown', (e) => {
            if (window.innerWidth <= 768) return;
            isDown = true;
            window.isScrollingDrag = false;
            document.body.classList.add('is-dragging');
            startX = e.pageX - archiveContainer.offsetLeft;
            scrollLeft = archiveContainer.scrollLeft;
        });
        
        window.addEventListener('mouseup', () => {
            isDown = false;
            document.body.classList.remove('is-dragging');
            setTimeout(() => { window.isScrollingDrag = false; }, 50);
        });

        archiveContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - archiveContainer.offsetLeft;
            const walk = (x - startX) * 1.5;
            
            if (Math.abs(walk) > 5) {
                window.isScrollingDrag = true; 
            }
            archiveContainer.scrollLeft = scrollLeft - walk;
        });

        // 4. 모바일: 상단 헤더를 탭하면 페이지 맨 위로 스크롤
        // (iOS는 상태바를 탭하면 자동으로 맨 위로 가지만, Android 등에는 그런 기능이 없어 보조로 제공)
        const archiveHeader = document.querySelector('.archive-body header');
        if (archiveHeader) {
            archiveHeader.addEventListener('click', (e) => {
                if (window.innerWidth > 768) return;
                if (e.target.closest('a')) return;
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }
});

/* =========================================
   Archive Image/Video Popup & Hover Overlay
   ========================================= */
window.addEventListener('DOMContentLoaded', () => {
    const archiveItems = document.querySelectorAll('.archive-item');
    let mediaPopup = document.getElementById('media-popup');
    window.isPopupScrollingDrag = false; // 팝업 갤러리 드래그 상태

    if (!mediaPopup) {
        mediaPopup = document.createElement('div');
        mediaPopup.id = 'media-popup';
        mediaPopup.className = 'info-overlay popup-flex-center'; 
        
        mediaPopup.innerHTML = `<div id="media-popup-content"></div>`;
        document.body.appendChild(mediaPopup);

        mediaPopup.addEventListener('click', (e) => {
            // 갤러리 스크롤 드래그 중이었으면 닫히는 것 방지
            if (window.isPopupScrollingDrag) return; 

            const tagName = e.target.tagName.toLowerCase();
            if (tagName !== 'img' && tagName !== 'video') {
                mediaPopup.classList.remove('is-active');
                setTimeout(() => {
                    document.getElementById('media-popup-content').innerHTML = '';
                }, 500);
            }
        });
    }

    archiveItems.forEach(item => {
        const link = item.querySelector('a'); 
        const mediaEl = item.querySelector('img, video'); 
        const titleEl = item.querySelector('p'); 
        
        if (!mediaEl || !titleEl) return;

        // 링크 클릭 시 스크롤 드래그 중이었다면 이동 방지
        if (link) {
            link.addEventListener('click', (e) => {
                if (window.isScrollingDrag) e.preventDefault();
            });
        }

        const mediaWrap = document.createElement('div');
        mediaWrap.className = 'popup-media-wrap';
        
        const hoverOverlay = document.createElement('div');
        hoverOverlay.className = 'popup-hover-overlay';
        
        const overlayText = link ? 'Visit Website ↗' : 'View More ↗';
        hoverOverlay.innerHTML = `<span>${overlayText}</span>`;

        mediaEl.parentNode.insertBefore(mediaWrap, mediaEl);
        mediaWrap.appendChild(mediaEl);
        mediaWrap.appendChild(hoverOverlay);

        const toggleHover = (isHovering) => {
            if (isHovering) hoverOverlay.classList.add('is-hovered');
            else hoverOverlay.classList.remove('is-hovered');
        };

        const titleTarget = titleEl.closest('a') || titleEl;

        mediaWrap.addEventListener('mouseenter', () => toggleHover(true));
        mediaWrap.addEventListener('mouseleave', () => toggleHover(false));
        titleTarget.addEventListener('mouseenter', () => toggleHover(true));
        titleTarget.addEventListener('mouseleave', () => toggleHover(false));

        if (!link) {
            mediaWrap.style.cursor = 'pointer';
            titleTarget.style.cursor = 'pointer';

            const openPopup = (e) => {
                // 드래그 중이었다면 팝업 띄우기 무시
                if (window.isScrollingDrag) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }

                const contentWrap = document.getElementById('media-popup-content');
                contentWrap.innerHTML = ''; 
                
                const customSrc = item.getAttribute('data-popup-src');
                const galleryFolder = item.getAttribute('data-gallery-folder');
                const galleryCount = parseInt(item.getAttribute('data-gallery-count'), 10);
                const galleryExt = item.getAttribute('data-gallery-ext') || '.svg';
                
                // [추가됨] 유튜브 ID 가져오기
                const youtubeId = item.getAttribute('data-youtube-id'); 

                let newMedia;

                // [케이스 1] 유튜브 팝업
                if (youtubeId) {
                    newMedia = document.createElement('iframe');
                    // autoplay=1을 넣어 팝업이 열리면 자동 재생되도록 설정
                    newMedia.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1`;
                    newMedia.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
                    newMedia.setAttribute('allowfullscreen', 'true');

                // [케이스 2] 다중 이미지 갤러리 팝업
                } else if (galleryFolder && galleryCount) {
                    newMedia = document.createElement('div');
                    newMedia.className = 'popup-gallery';
                    
                    for (let i = 1; i <= galleryCount; i++) {
                        const img = document.createElement('img');
                        img.src = `${galleryFolder}${i}${galleryExt}`;
                        newMedia.appendChild(img);
                    }

                    // 1. 팝업 갤러리 마우스 휠 스크롤
                    newMedia.addEventListener('wheel', (ev) => {
                        if (Math.abs(ev.deltaX) > 0) return;
                        if (Math.abs(ev.deltaY) > 0) {
                            ev.preventDefault();
                            newMedia.scrollLeft += ev.deltaY;
                        }
                    }, { passive: false });

                    // 2. 팝업 갤러리 마우스 드래그 스크롤
                    let isPopupDown = false;
                    let popupStartX;
                    let popupScrollLeft;

                    newMedia.addEventListener('mousedown', (ev) => {
                        isPopupDown = true;
                        window.isPopupScrollingDrag = false;
                        document.body.classList.add('is-dragging');
                        popupStartX = ev.pageX - newMedia.offsetLeft;
                        popupScrollLeft = newMedia.scrollLeft;
                    });
                    
                    window.addEventListener('mouseup', () => {
                        isPopupDown = false;
                        document.body.classList.remove('is-dragging');
                        setTimeout(() => { window.isPopupScrollingDrag = false; }, 50);
                    });

                    newMedia.addEventListener('mousemove', (ev) => {
                        if (!isPopupDown) return;
                        ev.preventDefault();
                        const x = ev.pageX - newMedia.offsetLeft;
                        const walk = (x - popupStartX) * 1.5;
                        if (Math.abs(walk) > 5) {
                            window.isPopupScrollingDrag = true;
                        }
                        newMedia.scrollLeft = popupScrollLeft - walk;
                    });

                // [케이스 3] 로컬 단일 커스텀 미디어 (비디오/이미지)
                } else if (customSrc) {
                    const isVideo = customSrc.match(/\.(mp4|webm|mov|ogg)$/i);
                    if (isVideo) {
                        newMedia = document.createElement('video');
                        newMedia.src = customSrc;
                        newMedia.setAttribute('controls', 'true'); 
                    } else {
                        newMedia = document.createElement('img');
                        newMedia.src = customSrc;
                    }
                    
                // [케이스 4] 기본 썸네일 복제
                } else {
                    newMedia = mediaEl.cloneNode(true);
                    if(newMedia.tagName.toLowerCase() === 'video') {
                        newMedia.setAttribute('controls', 'true');
                        newMedia.removeAttribute('autoplay');
                    }
                }
                
                contentWrap.appendChild(newMedia);

                setTimeout(() => {
                    mediaPopup.classList.add('is-active');
                    if (galleryFolder && galleryCount) {
                        const firstImg = newMedia.querySelector('img');
                        if (firstImg) {
                            const alignCenter = () => {
                                newMedia.scrollLeft = firstImg.offsetWidth / 2;
                            };
                            if (firstImg.complete) { alignCenter(); } 
                            else { firstImg.onload = alignCenter; }
                        }
                    }
                }, 10);
            };

            mediaWrap.addEventListener('click', openPopup);
            titleTarget.addEventListener('click', openPopup);
        }
    });
});

/* =========================================
   Archive Mobile Layout (Intersection Observer)
   ========================================= */
window.addEventListener('DOMContentLoaded', () => {
    const archiveContainer = document.querySelector('.archive');
    const archiveItems = document.querySelectorAll('.archive-item');
    if (!archiveContainer || !archiveItems.length) return;

    let observer;

    const initMobileObserver = () => {
        // 데스크탑 환경일 경우 Observer 해제 및 클래스 초기화
        if (window.innerWidth > 768) {
            if (observer) observer.disconnect();
            archiveItems.forEach(item => item.classList.remove('is-center'));
            return;
        }

        // 모바일 환경: 화면 중앙 20% 영역을 교차점으로 설정
        // (body가 직접 스크롤되므로 root는 브라우저 뷰포트(null) 기준)
        const observerOptions = {
            root: null,
            rootMargin: '0px -40% 0px -40%',
            threshold: 0
        };

        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-center');
                } else {
                    entry.target.classList.remove('is-center');
                }
            });
        }, observerOptions);

        archiveItems.forEach(item => observer.observe(item));
    };

    initMobileObserver();
    window.addEventListener('resize', initMobileObserver);
});


document.addEventListener("DOMContentLoaded", () => {
    const lastUpdated = document.getElementById("last-updated");

    // archive 페이지에서만 동작하도록 존재 여부만 체크 (스크롤은 body 기준)
    const scrollContainer = document.querySelector(".archive");
    const infoButton = document.getElementById("info-link");

    if (!lastUpdated || !scrollContainer) return;

    let isTicking = false;

    // body가 직접 스크롤되므로 window의 scroll 이벤트를 사용
    window.addEventListener("scroll", () => {
        if (window.innerWidth > 768) return;

        if (!isTicking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    lastUpdated.classList.add("hide-on-scroll");
                } else {
                    lastUpdated.classList.remove("hide-on-scroll");
                }
                isTicking = false;
            });
            isTicking = true;
        }
    }, { passive: true });

    // Info 버튼 클릭 이벤트 유지
    if (infoButton) {
        infoButton.addEventListener("click", () => {
            lastUpdated.classList.remove("hide-on-scroll");
        });
    }
});