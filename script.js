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
   3. Menu Hover State
   (사파리는 조상 요소(body)의 클래스 변화로 간접적으로 값이 바뀌는
   요소는 opacity transition을 제대로 애니메이션하지 않는 경우가 있어서,
   흐려져야 하는 요소들에 클래스를 직접 붙여줌)
   ========================================= */
const menuDiv = document.querySelector('menu div');
const menuHoverDimTargets = document.querySelectorAll(
    'menu a, header p:not(#live-time, #last-updated), .content p, .info-text-box p, #live-time, #cursor-log, #last-updated'
);
// 터치 기기는 탭 직후 브라우저가 mouseenter를 흉내내는 경우가 있어서(고스트 호버),
// 실제 마우스 호버가 가능한 기기에서만 붙임 -> 모바일에서 다크모드 토글 탭이 다른 메뉴를 흐리게 만들지 않음
if (menuDiv && window.matchMedia('(hover: hover)').matches) {
    menuDiv.addEventListener('mouseenter', () => {
        // 사파리는 같은 프레임에서 클래스를 바로 추가하면 transition 없이 뚝 끊겨서 적용됨.
        // 다른 팝업들과 동일하게 한 프레임 뒤로 미뤄서 트랜지션이 걸릴 틈을 줌
        requestAnimationFrame(() => {
            document.body.classList.add('is-menu-hovering');
            menuHoverDimTargets.forEach(el => el.classList.add('is-menu-dimmed'));
        });
    });
    menuDiv.addEventListener('mouseleave', () => {
        document.body.classList.remove('is-menu-hovering');
        menuHoverDimTargets.forEach(el => el.classList.remove('is-menu-dimmed'));
    });
}

/* =========================================
   4. Dark Mode Toggle
   (data-theme이 없으면 시스템 설정(prefers-color-scheme)을 그대로 따름.
   <head>의 인라인 스크립트가 저장된 값을 먼저 적용해서 깜빡임을 막고,
   여기서는 토글 버튼 동작과 아이콘 갱신만 담당함)
   ========================================= */
const themeToggle = document.getElementById('theme-toggle');
const prefersDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');

function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || (prefersDarkQuery.matches ? 'dark' : 'light');
}

// 유니코드 ☀/☾ 문자는 iOS에서 텍스트 선택자(U+FE0E)를 붙여도 컬러 이모지로 렌더링되는 경우가 있어서,
// 플랫폼에 무관하게 항상 같은 모양으로 나오도록 인라인 SVG 아이콘을 직접 그려서 씀
const moonIconSVG = '<svg viewBox="0 0 24 24" width="0.85em" height="0.85em" aria-hidden="true"><path fill="currentColor" d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z"/></svg>';
const sunIconSVG = '<svg viewBox="0 0 24 24" width="0.85em" height="0.85em" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

function updateThemeToggleIcon() {
    if (themeToggle) themeToggle.innerHTML = getCurrentTheme() === 'dark' ? sunIconSVG : moonIconSVG;
}

updateThemeToggleIcon();

if (themeToggle) {
    themeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const nextTheme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('theme', nextTheme);
        updateThemeToggleIcon();
        // JUNG/PARK 큰 글자는 색이 인라인으로 박혀있어서 CSS 변수만으론 안 바뀜 -> responsive.js에 알림
        document.dispatchEvent(new CustomEvent('themechange'));
    });
}

// 수동으로 고정해둔 적 없으면, 시스템 설정이 바뀔 때 아이콘/글자 색도 같이 갱신
prefersDarkQuery.addEventListener('change', () => {
    if (localStorage.getItem('theme')) return;
    updateThemeToggleIcon();
    document.dispatchEvent(new CustomEvent('themechange'));
});

/* =========================================
   5. Last Updated Relative Time (Auto)
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
   6. Page Load Handling (Archive 등 인트로 없는 페이지)
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
   7. Dynamic Info Popup
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
                        <p><a href="https://www.instagram.com/jungpaark/" target="_blank">@jungpaark</a></p>
                        <p><a href="mailto:jung_park@naver.com">jung_park@naver.com</a></p>
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
   8. Archive: Horizontal Scroll & Name Progress Bar
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
        // scrollWidth/offsetWidth를 읽는 건 강제 레이아웃을 유발하므로,
        // resize가 연달아 발생해도 한 프레임에 한 번만 실행되도록 rAF로 묶음
        let resizeFrame = null;
        window.addEventListener('resize', () => {
            if (resizeFrame) return;
            resizeFrame = requestAnimationFrame(() => {
                calculateDimensions();
                updateProgressBar();
                resizeFrame = null;
            });
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
        // mousemove를 container가 아니라 window에 붙여서, 빠르게 드래그하다 커서가
        // 컨테이너 경계 밖으로 나가도(=흔한 상황) 추적이 끊기지 않게 함.
        // 또한 wheel 스크롤과 동일하게 requestAnimationFrame으로 배치 처리해서
        // mousemove가 프레임보다 자주 발생해도 scrollLeft를 매번 동기적으로 건드리지 않게 함
        let isDown = false;
        let startX;
        let dragBaseScrollLeft;
        let pendingDragScrollLeft = null;
        let dragFrame = null;

        archiveContainer.addEventListener('mousedown', (e) => {
            if (window.innerWidth <= 768) return;
            isDown = true;
            window.isScrollingDrag = false;
            document.body.classList.add('is-dragging');
            startX = e.pageX - archiveContainer.offsetLeft;
            dragBaseScrollLeft = archiveContainer.scrollLeft;
        });

        window.addEventListener('mouseup', () => {
            isDown = false;
            document.body.classList.remove('is-dragging');
            setTimeout(() => { window.isScrollingDrag = false; }, 50);
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - archiveContainer.offsetLeft;
            const walk = (x - startX) * 1.5;

            if (Math.abs(walk) > 5) {
                window.isScrollingDrag = true;
            }

            pendingDragScrollLeft = dragBaseScrollLeft - walk;
            if (!dragFrame) {
                dragFrame = requestAnimationFrame(() => {
                    archiveContainer.scrollLeft = pendingDragScrollLeft;
                    dragFrame = null;
                });
            }
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
   9. Archive: Media Popup & Hover Overlay
   ========================================= */
window.addEventListener('DOMContentLoaded', () => {
    const archiveItems = document.querySelectorAll('.archive-item');
    let mediaPopup = document.getElementById('media-popup');
    window.isPopupScrollingDrag = false; // 팝업 갤러리 드래그 상태
    const canHover = window.matchMedia('(hover: hover)').matches;
    // 갤러리 드래그 리스너는 window에 붙기 때문에, 팝업을 열 때마다 새로 추가되고 쌓이지 않도록
    // 매번 이전 것들을 정리(abort)하고 새로 등록함
    let popupDragController = null;

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
                if (popupDragController) {
                    popupDragController.abort();
                    popupDragController = null;
                }
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

        mediaEl.parentNode.insertBefore(mediaWrap, mediaEl);
        mediaWrap.appendChild(mediaEl);

        // 호버 오버레이는 backdrop-filter(blur)를 쓰기 때문에 아이템 하나당 합성 레이어가 하나씩 생김.
        // 터치 기기에서는 호버 자체가 없어서 평생 보이지도 않으면서 15개가 그대로 메모리를 잡아먹으므로,
        // 실제 마우스 호버가 가능한 기기에서만 만들어 붙임
        const titleTarget = titleEl.closest('a') || titleEl;

        if (canHover) {
            const hoverOverlay = document.createElement('div');
            hoverOverlay.className = 'popup-hover-overlay';

            const overlayText = link ? 'Visit Website ↗' : 'View More ↗';
            hoverOverlay.innerHTML = `<span>${overlayText}</span>`;
            mediaWrap.appendChild(hoverOverlay);

            const toggleHover = (isHovering) => {
                if (isHovering) hoverOverlay.classList.add('is-hovered');
                else hoverOverlay.classList.remove('is-hovered');
            };

            mediaWrap.addEventListener('mouseenter', () => toggleHover(true));
            mediaWrap.addEventListener('mouseleave', () => toggleHover(false));
            titleTarget.addEventListener('mouseenter', () => toggleHover(true));
            titleTarget.addEventListener('mouseleave', () => toggleHover(false));
        }

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
                        // 썸네일에 지정된 배경색(투명 영역이 있는 이미지용)이 있으면 그대로 물려받음
                        if (mediaEl.style.backgroundColor) img.style.backgroundColor = mediaEl.style.backgroundColor;
                        newMedia.appendChild(img);
                    }

                    // 팝업을 열 때마다 새 리스너 세트를 등록하므로, 이전 세트를 먼저 정리함
                    if (popupDragController) popupDragController.abort();
                    popupDragController = new AbortController();
                    const { signal: popupDragSignal } = popupDragController;

                    // 1. 팝업 갤러리 마우스 휠 스크롤
                    newMedia.addEventListener('wheel', (ev) => {
                        if (Math.abs(ev.deltaX) > 0) return;
                        if (Math.abs(ev.deltaY) > 0) {
                            ev.preventDefault();
                            newMedia.scrollLeft += ev.deltaY;
                        }
                    }, { passive: false, signal: popupDragSignal });

                    // 2. 팝업 갤러리 마우스 드래그 스크롤
                    // (아카이브 그리드 드래그와 동일한 이유로 mousemove는 window에, scrollLeft 반영은 rAF로 배치)
                    let isPopupDown = false;
                    let popupStartX;
                    let popupBaseScrollLeft;
                    let pendingPopupScrollLeft = null;
                    let popupDragFrame = null;

                    newMedia.addEventListener('mousedown', (ev) => {
                        isPopupDown = true;
                        window.isPopupScrollingDrag = false;
                        document.body.classList.add('is-dragging');
                        popupStartX = ev.pageX - newMedia.offsetLeft;
                        popupBaseScrollLeft = newMedia.scrollLeft;
                    }, { signal: popupDragSignal });

                    window.addEventListener('mouseup', () => {
                        isPopupDown = false;
                        document.body.classList.remove('is-dragging');
                        setTimeout(() => { window.isPopupScrollingDrag = false; }, 50);
                    }, { signal: popupDragSignal });

                    window.addEventListener('mousemove', (ev) => {
                        if (!isPopupDown) return;
                        ev.preventDefault();
                        const x = ev.pageX - newMedia.offsetLeft;
                        const walk = (x - popupStartX) * 1.5;
                        if (Math.abs(walk) > 5) {
                            window.isPopupScrollingDrag = true;
                        }

                        pendingPopupScrollLeft = popupBaseScrollLeft - walk;
                        if (!popupDragFrame) {
                            popupDragFrame = requestAnimationFrame(() => {
                                newMedia.scrollLeft = pendingPopupScrollLeft;
                                popupDragFrame = null;
                            });
                        }
                    }, { signal: popupDragSignal });

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
                        if (mediaEl.style.backgroundColor) newMedia.style.backgroundColor = mediaEl.style.backgroundColor;
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
   10. Archive: Grid Scale Animation (Intersection Observer)
   - 모바일: 화면 중앙에 온 아이템만 확대(is-center)
   - 데스크탑: 가로 스크롤 뷰 안에 들어온 아이템만 확대(is-in-view), 접속 시에도 동일하게 작았다가 커짐
   ========================================= */
window.addEventListener('DOMContentLoaded', () => {
    const archiveContainer = document.querySelector('.archive');
    const archiveItems = document.querySelectorAll('.archive-item');
    if (!archiveContainer || !archiveItems.length) return;

    let mobileObserver;
    let desktopObserver;

    const initMobileObserver = () => {
        // 이전 Observer는 항상 먼저 끊어줌. (예전에는 같은 화면폭에서 resize가 반복되면
        // 끊지 않은 채 새 Observer를 계속 만들어서, 살아있는 Observer가 무한정 쌓였음)
        if (mobileObserver) {
            mobileObserver.disconnect();
            mobileObserver = null;
        }

        // 데스크탑 환경일 경우 클래스 초기화 후 종료
        if (window.innerWidth > 768) {
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

        mobileObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-center');
                } else {
                    entry.target.classList.remove('is-center');
                }
            });
        }, observerOptions);

        archiveItems.forEach(item => mobileObserver.observe(item));
    };

    const initDesktopObserver = () => {
        // (위 initMobileObserver와 동일한 이유로) 이전 Observer를 항상 먼저 끊어줌
        if (desktopObserver) {
            desktopObserver.disconnect();
            desktopObserver = null;
        }

        // 모바일 환경일 경우 클래스 초기화 후 종료
        if (window.innerWidth <= 768) {
            archiveItems.forEach(item => item.classList.remove('is-in-view'));
            return;
        }

        // 데스크탑 환경: .archive의 가로 스크롤 뷰 기준으로 화면 안/밖 판정
        // 모든 아이템이 기본적으로 축소 상태에서 시작하므로, 접속 직후 화면 안에 있는 아이템도
        // Observer가 처음 걸리는 순간 is-in-view가 붙으며 커지는 애니메이션이 자연스럽게 재생됨
        const observerOptions = {
            root: archiveContainer,
            rootMargin: '0px',
            threshold: 0
        };

        desktopObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-in-view');
                } else {
                    entry.target.classList.remove('is-in-view');
                }
            });
        }, observerOptions);

        archiveItems.forEach(item => desktopObserver.observe(item));
    };

    initMobileObserver();
    initDesktopObserver();

    // 모바일 브라우저는 스크롤할 때 주소창이 접혔다 펴지면서 resize가 계속 발생함.
    // Observer는 화면폭이 모바일<->데스크탑 경계를 실제로 넘었을 때만 다시 만들면 되므로,
    // 폭이 그대로면(=주소창 높이 변화 등) 아무것도 하지 않고 넘어감
    let wasMobile = window.innerWidth <= 768;
    window.addEventListener('resize', () => {
        const isMobile = window.innerWidth <= 768;
        if (isMobile === wasMobile) return;
        wasMobile = isMobile;
        initMobileObserver();
        initDesktopObserver();
    });
});

/* =========================================
   11. Archive: Hide "Last Updated" on Mobile Scroll
   ========================================= */
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

/* =========================================
   12. Archive: Hide Menu on Mobile Scroll Direction
   ========================================= */
document.addEventListener("DOMContentLoaded", () => {
    const menu = document.querySelector("menu");
    if (!menu) return;

    let lastScrollY = window.scrollY;
    let isTicking = false;

    window.addEventListener("scroll", () => {
        if (window.innerWidth > 768) return;

        if (!isTicking) {
            window.requestAnimationFrame(() => {
                const currentY = window.scrollY;
                const delta = currentY - lastScrollY;
                const atBottom = (currentY + window.innerHeight) >= (document.documentElement.scrollHeight - 2);

                // last-updated와 달리 맨 위가 아니어도, 위로 스크롤하는 순간 바로 다시 보이게 함
                // 최하단에 도달했을 때도 아래로 스크롤 중이었더라도 다시 보이게 함
                if (atBottom) {
                    menu.classList.remove("hide-on-scroll");
                } else if (delta > 5) {
                    menu.classList.add("hide-on-scroll");
                } else if (delta < -5) {
                    menu.classList.remove("hide-on-scroll");
                }

                lastScrollY = currentY;
                isTicking = false;
            });
            isTicking = true;
        }
    }, { passive: true });
});
