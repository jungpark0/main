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

// /* =========================================
//    10. Archive CSS Grid Masonry (JS Row Span)
//    ========================================= */
//    window.addEventListener('DOMContentLoaded', () => {
//     const archiveGrid = document.querySelector('.archive');
//     if (!archiveGrid) return;

//     const items = document.querySelectorAll('.archive-item');
    
//     // 높이 측정 및 모눈종이 칸(Span) 수 계산 함수
//     function resizeGridItem(item) {
//         // 정확한 측정을 위해 기존에 계산된 span 값을 임시로 풉니다.
//         item.style.gridRowEnd = 'auto';
        
//         // 아이템 내부 콘텐츠의 실제 픽셀 높이를 소수점까지 정밀하게 캡처합니다.
//         const contentHeight = item.getBoundingClientRect().height;
        
//         // CSS에서 grid-auto-rows를 1px로 했으므로, '높이 = 차지할 칸 수'가 됩니다.
//         // 여기에 시그니처 세로 간격인 5px을 더한 뒤, 반올림(ceil)하여 딱 떨어지는 칸 수를 구합니다.
//         const rowSpan = Math.ceil(contentHeight + 5);
        
//         // CSS에게 "아래로 rowSpan 칸만큼 차지해라"라고 명령합니다.
//         item.style.gridRowEnd = `span ${rowSpan}`;
//     }

//     // 전체 아이템 재계산
//     function resizeAllGridItems() {
//         items.forEach(item => resizeGridItem(item));
//     }

//     // ★ 가장 중요한 부분: 이미지가 로딩된 '직후'에 높이를 재야 정확합니다.
//     items.forEach(item => {
//         const img = item.querySelector('img');
//         if (img) {
//             // 이미지가 이미 캐시되어 로드된 상태라면 즉시 계산
//             if (img.complete) {
//                 resizeGridItem(item);
//             } else {
//                 // 아직 로딩 중이라면 로딩이 끝나는 순간 계산
//                 img.addEventListener('load', () => resizeGridItem(item));
//             }
//         } else {
//             // 이미지가 없는 텍스트 전용 카드라면 즉시 계산
//             resizeGridItem(item);
//         }
//     });

//     // 화면 크기가 변할 때(리사이즈) 비율에 맞춰 높이를 다시 테트리스처럼 맞춥니다.
//     window.addEventListener('resize', resizeAllGridItems);
// });


// Swiper 초기화
window.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.archive-swiper')) {
        new Swiper('.archive-swiper', {
            slidesPerView: 'auto', // 카드 개별 너비(width) 인정
            spaceBetween: 10,      // 카드 간격 (px)
            freeMode: true,        // 슬라이드 단위 고정이 아닌 자유 스크롤
            mousewheel: true,      // 마우스 휠 조작 시 가로 스크롤 전환
            grabCursor: true       // 마우스 커서를 드래그 모양으로 변경
        });
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