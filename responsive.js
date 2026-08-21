/* =========================================
    브라우저 기본 스와이프(뒤로가기) 방지
   ========================================= */
document.body.style.overscrollBehaviorX = 'none';
document.body.style.overscrollBehaviorY = 'none';

/* =========================================
    3. Global Slide State & Scroll Control
   ========================================= */
let isIntroFinished = false; 
let currentSlide = 0; 
let isScrollLocked = false; 

// PARK 애니메이션 상태 변수
let parkYRatio = 0.5; 
let targetParkRatio = 0.5;
let parkAnimId = null;
let parkAnimTimeout = null;

// HANJA 애니메이션 상태 변수
let hanjaAnimTimeout = null;

// scroll-direct 요소 가져오기 및 초기 설정
const scrollDirect = document.getElementById('scroll-direct');
if (scrollDirect) {
    scrollDirect.style.opacity = '0';
    scrollDirect.style.pointerEvents = 'none';
    scrollDirect.style.transition = 'opacity 0.5s ease'; // 부드러운 페이드 인/아웃
}

function finishIntro() {
    isIntroFinished = true;
    // JUNG 애니메이션이 끝나면(인트로 종료) scroll-direct를 나타나게 합니다.
    if (currentSlide !== 2 && scrollDirect) {
        scrollDirect.style.opacity = '1';
        scrollDirect.style.pointerEvents = 'auto';
    }
}

// 화면 전환(슬라이드) 함수 (0: JUNG, 1: PARK, 2: HANJA)
function goToSlide(index) {
    if (isScrollLocked) return;
    isScrollLocked = true; 

    // [이전 페이지로 돌아갈 때 즉시 역재생 처리]
    if (currentSlide === 2 && index < 2) {
        if (hanjaAnimTimeout) clearTimeout(hanjaAnimTimeout);
        targetHanjaWeight = 0; // 즉시 원래 상태로 복귀
        if (hanjaAnimId) cancelAnimationFrame(hanjaAnimId);
        animateHanjaWeight();
    }
    if (currentSlide === 1 && index < 1) {
        if (parkAnimTimeout) clearTimeout(parkAnimTimeout);
        targetParkRatio = 0.5; // 즉시 원래 상태로 복귀
        if (parkAnimId) cancelAnimationFrame(parkAnimId);
        animateParkRatio();
    }

    document.body.classList.remove('show-park', 'show-hanja');

    if (index === 2) {
        document.body.classList.add('show-hanja');
        currentSlide = 2;
        
        if (parkAnimTimeout) clearTimeout(parkAnimTimeout);
        if (hanjaAnimTimeout) clearTimeout(hanjaAnimTimeout);
        
        // HANJA 진입 시 1초 뒤 애니메이션
        hanjaAnimTimeout = setTimeout(() => {
            targetHanjaWeight = 1;
            if (hanjaAnimId) cancelAnimationFrame(hanjaAnimId);
            animateHanjaWeight();
        }, 1000);

        // 한자 페이지에 도달하면 scroll-direct를 자연스럽게 숨김
        if (scrollDirect) {
            scrollDirect.style.opacity = '0';
            scrollDirect.style.pointerEvents = 'none';
        }

    } else if (index === 1) {
        document.body.classList.add('show-park');
        currentSlide = 1;

        if (hanjaAnimTimeout) clearTimeout(hanjaAnimTimeout);
        if (parkAnimTimeout) clearTimeout(parkAnimTimeout);

        // PARK 진입 시 1초 뒤 애니메이션
        parkAnimTimeout = setTimeout(() => {
            targetParkRatio = 0.8;
            if (parkAnimId) cancelAnimationFrame(parkAnimId);
            animateParkRatio();
        }, 1000);

        // 다시 앞 페이지로 돌아오면 scroll-direct 나타남
        if (scrollDirect && isIntroFinished) {
            scrollDirect.style.opacity = '1';
            scrollDirect.style.pointerEvents = 'auto';
        }

    } else {
        currentSlide = 0;
        if (parkAnimTimeout) clearTimeout(parkAnimTimeout);
        if (hanjaAnimTimeout) clearTimeout(hanjaAnimTimeout);

        // JUNG 페이지로 돌아오면 scroll-direct 나타남
        if (scrollDirect && isIntroFinished) {
            scrollDirect.style.opacity = '1';
            scrollDirect.style.pointerEvents = 'auto';
        }
    }

    setTimeout(() => { isScrollLocked = false; }, 1000); 
}

// 마우스 휠 및 트랙패드 스크롤 (상하 & 좌우 스와이프 지원)
window.addEventListener('wheel', (e) => {
    // [추가] 모바일 해상도에서는 데스크탑용 스크롤 하이재킹 및 가로 슬라이드 방식을 즉시 중단합니다.
    if (window.innerWidth <= 768) return;

    // 트랙패드 좌우 스크롤 시 브라우저 뒤로가기 기본 동작 방지
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault(); 
    }

    if (!isIntroFinished) return;
    if (isScrollLocked) return;

    const infoPopup = document.getElementById('dynamic-info-popup');
    if (infoPopup && infoPopup.classList.contains('is-active')) return;

    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        if (Math.abs(e.deltaX) > 20) {
            if (e.deltaX > 0) { 
                if (currentSlide === 0) goToSlide(1);
                else if (currentSlide === 1) goToSlide(2);
            } else { 
                if (currentSlide === 1) goToSlide(0);
                else if (currentSlide === 2) goToSlide(1);
            }
        }
    } else {
        if (Math.abs(e.deltaY) > 20) {
            if (e.deltaY > 0) { 
                if (currentSlide === 0) goToSlide(1);
                else if (currentSlide === 1) goToSlide(2);
            } else { 
                if (currentSlide === 1) goToSlide(0);
                else if (currentSlide === 2) goToSlide(1);
            }
        }
    }
}, { passive: false }); 


/* =========================================
    4. PARK Morph Animation & Click Toggle
    ========================================= */
function animateParkRatio() {
    if (Math.abs(targetParkRatio - parkYRatio) > 0.001) {
        parkYRatio += (targetParkRatio - parkYRatio) * 0.05; 
        drawResponsivePARK();
        parkAnimId = requestAnimationFrame(animateParkRatio);
    } else {
        parkYRatio = targetParkRatio;
        drawResponsivePARK();
        cancelAnimationFrame(parkAnimId);
    }
}


/* =========================================
    5. Responsive JUNG Graphic & Animation
    ========================================= */
const jSvg = document.querySelector('.graphic-j');
const jPath = document.querySelector('.j-path');
const uPath = document.querySelector('.u-path');
const nPath = document.querySelector('.n-path'); 
const gPath = document.querySelector('.g-path'); 

const isReturnVisit = sessionStorage.getItem('site_visited') === 'true';
sessionStorage.setItem('site_visited', 'true');

let isAnimated = false; 
let morphFrameId;
let animTimeouts = [];
let skipListenerAdded = false;

function drawResponsiveJUNG() {
    if (!jSvg || !jPath) {
        document.body.classList.remove('is-loading');
        return;
    }

    const w = jSvg.clientWidth;
    const h = jSvg.clientHeight;
    jSvg.setAttribute('viewBox', `0 0 ${w} ${h}`);

    const remToPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const strokeOffset = 1.1 * remToPx; 
    const gap = 5;

    const netW = (w / 2) - (gap * 3);
    const uW = netW * (22.5 / 50);
    const nW = netW * (12.5 / 50);
    const gW = netW * (15.0 / 50);

    const targetStemX = (w / 2) - strokeOffset; 
    const targetHookX = 0; 
    const targetTopStartX = targetStemX - (w * 0.15); 

    const fullTopStartX = 0; 
    const fullStemX = w;     
    const fullHookX = (w / 2) + strokeOffset;
    const rFull = Math.min(200, w / 2, h / 2);

    const uLeftX = targetStemX + strokeOffset + gap + strokeOffset; 
    const uRightX = uLeftX + uW - strokeOffset;
    const innerUWidth = uRightX - uLeftX; 

    const nLeftX = uRightX + strokeOffset + gap + strokeOffset;
    const nTopRightX = nLeftX + (nW * 0.75) - strokeOffset; 
    const nUpwardX = nTopRightX + strokeOffset + gap + strokeOffset; 

    const gLeftX = nUpwardX + strokeOffset + gap + strokeOffset;
    const gRightX = w; 
    const gTotalWidth = gRightX - gLeftX; 
    
    const idealCrossbarX = gRightX - (gTotalWidth / 2);
    const minSafeCrossbarX = gLeftX + (strokeOffset * 2) + gap;
    const gCrossbarX = Math.min(gRightX, Math.max(idealCrossbarX, minSafeCrossbarX));

    const rCorner = Math.max(0, Math.min(200, targetStemX / 2, h / 2, innerUWidth, gTotalWidth));

    const dFull = `M ${fullTopStartX},0 L ${fullStemX},0 L ${fullStemX},${h - rFull} Q ${fullStemX},${h} ${fullStemX - rFull},${h} L ${fullHookX},${h} L ${fullHookX},${h * 0.8}`.trim().replace(/\s+/g, ' ');
    const dCenter = `M ${targetTopStartX},0 L ${targetStemX},0 L ${targetStemX},${h - rCorner} Q ${targetStemX},${h} ${targetStemX - rCorner},${h} L ${targetHookX},${h} L ${targetHookX},${h * 0.8}`.trim().replace(/\s+/g, ' ');
    const dU = `M ${uLeftX},0 L ${uLeftX},${h - rCorner} Q ${uLeftX},${h} ${uLeftX + rCorner},${h} L ${uRightX},${h} L ${uRightX},0`.trim().replace(/\s+/g, ' ');
    const dN = `M ${nLeftX},${h} L ${nLeftX},0 L ${nTopRightX},0 L ${nTopRightX},${h} L ${nUpwardX},${h} L ${nUpwardX},0`.trim().replace(/\s+/g, ' ');
    const dG = `M ${gRightX},${h * 0.3} L ${gRightX},0 L ${gLeftX},0 L ${gLeftX},${h} L ${gRightX - rCorner},${h} Q ${gRightX},${h} ${gRightX},${h - rCorner} L ${gRightX},${h * 0.5} L ${gCrossbarX},${h * 0.5}`.trim().replace(/\s+/g, ' ');

    const skipBtn = document.getElementById('skip-btn');

    // ★ 변경 1: 처음 방문(!isReturnVisit)일 때만 전체 애니메이션을 실행합니다.
    // (모바일은 JUNG 그래픽 자체가 안 보이므로 애니메이션 없이 즉시 마무리 상태로 처리)
    if (!isAnimated && !isReturnVisit && window.innerWidth > 768) {
        
        // 처음 방문이므로 스킵 버튼은 숨깁니다. (스킵 로직 제거)
        if (skipBtn) {
            skipBtn.style.display = 'none';
        }

        jPath.setAttribute('d', dFull);
        if(uPath) uPath.setAttribute('d', dU);
        if(nPath) nPath.setAttribute('d', dN);
        if(gPath) gPath.setAttribute('d', dG);
        
        jPath.getBoundingClientRect(); 
        
        const jLength = jPath.getTotalLength();
        jPath.style.strokeDasharray = jLength;
        jPath.style.transition = 'none';
        jPath.style.strokeDashoffset = jLength;
        jPath.style.opacity = 1; 

        const ungs = [uPath, nPath, gPath];
        ungs.forEach(p => {
            if (p) {
                const len = p.getTotalLength();
                p.style.strokeDasharray = len;
                p.style.strokeDashoffset = len; 
                p.style.opacity = 1; 
                p.style.transition = 'none';
            }
        });
        
        jPath.style.transition = 'stroke-dashoffset 3s cubic-bezier(0.5, 1, 0.5, 1)';
        jPath.style.strokeDashoffset = 0;
        
        animTimeouts.push(setTimeout(() => {
            jPath.style.transition = 'none'; 
            const duration = 1500; 
            const startTime = performance.now();
            
            function easeInOutCubic(t) {
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            }

            function animateMorph(currentTime) {
                let elapsed = currentTime - startTime;
                let progress = Math.min(elapsed / duration, 1);
                const t = easeInOutCubic(progress);

                const currentTopStartX = fullTopStartX + (targetTopStartX - fullTopStartX) * t;
                const currentStemX = fullStemX + (targetStemX - fullStemX) * t;
                const currentHookX = fullHookX + (targetHookX - fullHookX) * t;
                const currentR = rFull + (rCorner - rFull) * t;

                const currentD = `M ${currentTopStartX},0 L ${currentStemX},0 L ${currentStemX},${h - currentR} Q ${currentStemX},${h} ${currentStemX - currentR},${h} L ${currentHookX},${h} L ${currentHookX},${h * 0.8}`.trim().replace(/\s+/g, ' ');
                jPath.setAttribute('d', currentD);

                if (progress < 1) {
                    morphFrameId = requestAnimationFrame(animateMorph);
                } else {
                    jPath.setAttribute('d', dCenter); 
                }
            }
            
            morphFrameId = requestAnimationFrame(animateMorph);
            
            document.body.classList.add('is-leaving-loading');
            document.body.classList.remove('is-loading');
            animTimeouts.push(setTimeout(() => { document.body.classList.remove('is-leaving-loading'); }, 1500));

            const drawTransition = 'stroke-dashoffset 1.5s cubic-bezier(0.25, 1, 0.5, 1)';

            animTimeouts.push(setTimeout(() => {
                if(uPath) { uPath.style.transition = drawTransition; uPath.style.strokeDashoffset = 0; }
            }, 900)); 

            animTimeouts.push(setTimeout(() => {
                if(nPath) { nPath.style.transition = drawTransition; nPath.style.strokeDashoffset = 0; }
            }, 1200)); 

            animTimeouts.push(setTimeout(() => {
                if(gPath) { gPath.style.transition = drawTransition; gPath.style.strokeDashoffset = 0; }
            }, 1500)); 

            animTimeouts.push(setTimeout(() => {
                const paths = [jPath, uPath, nPath, gPath];
                paths.forEach(p => {
                    if (p) {
                        p.style.transition = 'stroke 1.2s ease'; 
                        p.style.stroke = 'gainsboro';
                    }
                });
                
                finishIntro(); 
                
            }, 3500)); 

        }, 3000)); 
        
        isAnimated = true;
        
    } else {
        // ★ 변경 2: 재방문 시 즉시 최종 형태를 그리고, 흰색 화면(is-loading)을 즉시 끕니다.
        jPath.setAttribute('d', dCenter);
        jPath.style.transition = 'none';
        jPath.style.strokeDasharray = 'none';
        jPath.style.strokeDashoffset = 0;
        jPath.style.opacity = 1;
        jPath.style.stroke = 'gainsboro';

        const paths = [uPath, nPath, gPath];
        const dArray = [dU, dN, dG];
        paths.forEach((p, i) => {
            if (p) {
                p.setAttribute('d', dArray[i]);
                p.style.opacity = 1;
                p.style.strokeDasharray = 'none';
                p.style.strokeDashoffset = 0; 
                p.style.transition = 'none';
                p.style.stroke = 'gainsboro';
            }
        });

        // 로딩 클래스 즉시 해제
        document.body.classList.remove('is-loading');

        if (skipBtn) skipBtn.style.display = 'none';
        finishIntro(); 
    }
}


/* =========================================
    6. PARK Layout
    ========================================= */
const parkSvg = document.querySelector('.graphic-park');
const pPath = document.querySelector('.p-path');
const aPath = document.querySelector('.a-path');
const rPath = document.querySelector('.r-path'); 
const kPath = document.querySelector('.k-path'); 

function drawResponsivePARK() {
    if (!parkSvg || !pPath) {
        return;
    }

    const w = parkSvg.clientWidth;
    const h = parkSvg.clientHeight;
    parkSvg.setAttribute('viewBox', `0 0 ${w} ${h}`);

    let defs = parkSvg.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
        clipPath.setAttribute('id', 'k-diag-ceiling-clip');
        
        const clipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        clipRect.classList.add('clip-rect');
        clipPath.appendChild(clipRect);
        
        defs.appendChild(clipPath);
        parkSvg.appendChild(defs);
    }
    
    const remToPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const strokeOffset = 1.1 * remToPx; 

    const clipRect = parkSvg.querySelector('.clip-rect');
    clipRect.setAttribute('x', -1000); 
    clipRect.setAttribute('y', -strokeOffset); 
    clipRect.setAttribute('width', 3000);
    clipRect.setAttribute('height', 3000);

    const gap = 5;
    const centerGap = (2 * strokeOffset) + gap; 

    const halfW = w / 2;

    const kLeftX = halfW + (centerGap / 2);
    const kW = w - kLeftX;

    const leftTotalW = halfW - (centerGap / 2);
    const leftNetW = leftTotalW - (2 * centerGap);

    const pW = leftNetW * (17.5 / 50);
    const aW = leftNetW * (12.5 / 50);
    const rW = leftNetW * (20 / 50); 

    const midY = h * parkYRatio;
    const minInnerW = Math.min(pW, aW, rW, kW) - strokeOffset;
    const rCorner = Math.max(0, Math.min(200, midY, h - midY, minInnerW));

    // [1. P] 
    const pLeftX = 0; 
    const pRightX = pLeftX + pW; 
    const dP = `
        M ${pLeftX},${h} 
        L ${pLeftX},0 
        L ${pRightX},0 
        L ${pRightX},${midY - rCorner} 
        Q ${pRightX},${midY} ${pRightX - rCorner},${midY}
        L ${pLeftX},${midY}
    `.trim().replace(/\s+/g, ' ');

    // [2. A]
    const aLeftX = pRightX + centerGap;
    const aTopRightX = aLeftX + (leftNetW * (12.5 / 50)); 
    const aRightX = aLeftX + aW; 

    const aTopWidth = aTopRightX - aLeftX;
    const aTopRCorner = Math.min(rCorner, aTopWidth);

    const dA = `
        M ${aLeftX},${h} 
        L ${aLeftX},0 
        L ${aTopRightX - aTopRCorner},0 
        Q ${aTopRightX},0 ${aTopRightX},${aTopRCorner} 
        L ${aTopRightX},${h} 
        M ${aLeftX},${midY} 
        L ${aRightX - rCorner},${midY} 
        Q ${aRightX},${midY} ${aRightX},${midY}
        L ${aRightX},${h}
    `.trim().replace(/\s+/g, ' ');

    // [3. R] 
    const rLeftX = aRightX + centerGap;
    const rRightX = rLeftX + rW; 
    const dR = `
        M ${rLeftX},${h} 
        L ${rLeftX},0 
        L ${rRightX},0 
        L ${rRightX},${midY - rCorner} 
        Q ${rRightX},${midY} ${rRightX - rCorner},${midY}
        L ${rLeftX},${midY} 
        L ${rRightX},${midY} 
        L ${rRightX},${h}
    `.trim().replace(/\s+/g, ' ');

    // [4. K] 
    const kRightX = kLeftX + kW; 
    const dK = `
        M ${kLeftX},0 
        L ${kLeftX},${h} 
        M ${kLeftX},${midY} 
        L ${kRightX - rCorner},${midY} 
        Q ${kRightX},${midY} ${kRightX},${midY + rCorner}
        L ${kRightX},${h}
    `.trim().replace(/\s+/g, ' ');

    // K 대각선 
    const Px = kLeftX;
    const Py = midY; 
    const cornerX = w * 0.85 + strokeOffset; 
    const cornerY = -strokeOffset;    

    const dx = cornerX - Px;
    const dy = Py - cornerY; 
    const distToCorner = Math.sqrt(dx * dx + dy * dy);
    
    const gamma = Math.atan2(dy, dx);
    const beta = Math.asin(strokeOffset / distToCorner);
    const finalAngle = gamma + beta;
    
    const extendLen = distToCorner + 200; 
    const kDiagTargetX = Px + Math.cos(finalAngle) * extendLen;
    const kDiagTargetY = Py - Math.sin(finalAngle) * extendLen;

    const dKDiag = `
        M ${kDiagTargetX},${kDiagTargetY} 
        L ${Px},${Py}
    `.trim().replace(/\s+/g, ' ');

    let kDiagPath = parkSvg.querySelector('.k-diag-path');
    if (!kDiagPath) {
        kDiagPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        kDiagPath.classList.add('k-diag-path');
        parkSvg.appendChild(kDiagPath);
    }

    pPath.setAttribute('d', dP);
    if (aPath) aPath.setAttribute('d', dA);
    if (rPath) rPath.setAttribute('d', dR);
    if (kPath) kPath.setAttribute('d', dK);
    kDiagPath.setAttribute('d', dKDiag);
    
    const paths = [pPath, aPath, rPath, kPath];
    paths.forEach(p => {
        if (p) {
            p.style.fill = 'none';
            p.style.stroke = 'gainsboro';
            p.style.strokeWidth = '2.2rem';
            p.style.strokeLinecap = 'square'; 
            p.style.strokeLinejoin = 'miter';
            p.style.strokeMiterlimit = '1.5'; 
            p.style.transition = 'none';
            p.style.strokeDasharray = 'none';
            p.style.strokeDashoffset = '0';
            p.style.opacity = '1';
        }
    });

    if (kDiagPath) {
        kDiagPath.style.fill = 'none';
        kDiagPath.style.stroke = 'gainsboro';
        kDiagPath.style.strokeWidth = '2.2rem';
        kDiagPath.style.strokeLinecap = 'butt'; 
        kDiagPath.style.strokeLinejoin = 'miter';
        kDiagPath.style.strokeMiterlimit = '1.5';
        kDiagPath.style.transition = 'none';
        kDiagPath.style.strokeDasharray = 'none';
        kDiagPath.style.strokeDashoffset = '0';
        kDiagPath.style.opacity = '1';
        kDiagPath.setAttribute('clip-path', 'url(#k-diag-ceiling-clip)');
    }
}

// PARK 클릭 토글 이벤트 추가
if (parkSvg) {
    parkSvg.style.pointerEvents = 'auto'; 
    parkSvg.style.cursor = 'pointer';
    parkSvg.addEventListener('click', () => {
        targetParkRatio = targetParkRatio === 0.5 ? 0.8 : 0.5;
        if (parkAnimId) cancelAnimationFrame(parkAnimId);
        animateParkRatio();
    });
}


/* =========================================
    7. HANJA Layout (亭 朴) & Fat Animation
    ========================================= */
const hanjaSvg = document.querySelector('.graphic-hanja');

const jungPath1 = document.querySelector('.jung-path1');
const jungPath2 = document.querySelector('.jung-path2');
const jungPath3 = document.querySelector('.jung-path3');
const jungPath4 = document.querySelector('.jung-path4');
const jungPath5 = document.querySelector('.jung-path5');

const parkPath1 = document.querySelector('.park-path1');
const parkPath2 = document.querySelector('.park-path2');
const parkPath3 = document.querySelector('.park-path3');
const parkPath4 = document.querySelector('.park-path4');
const parkPath5 = document.querySelector('.park-path5');
const hanjaDot = document.querySelector('.hanja-dot'); // 모바일 상하 배치에서만 사용하는 오른쪽 하단 점

// 모바일은 클릭 전/후 모습을 서로 바꿔서, 데스크탑 클릭 후(FAT) 상태가 처음부터 보이게 함
const hanjaMobileDefault = window.innerWidth <= 768 ? 1 : 0;
let hanjaWeight = hanjaMobileDefault;
let targetHanjaWeight = hanjaMobileDefault;
let hanjaAnimId = null;

const lerp = (start, end, t) => start + (end - start) * t;

function drawResponsiveHANJA(w_anim = hanjaWeight) {
    if (!hanjaSvg || !jungPath1) return;

    const w = hanjaSvg.clientWidth;
    const h = hanjaSvg.clientHeight;
    hanjaSvg.setAttribute('viewBox', `0 0 ${w} ${h}`);

    const remToPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const strokeOffset = 1.1 * remToPx;
    const baseS = 2 * strokeOffset; // 기본 선 두께 (2.2rem)
    const gap = 5;
    const centerGap = baseS + gap;

    // 모바일(세로 화면)은 정/박을 좌우가 아니라 상하로 배치
    if (window.innerWidth <= 768) {
        drawHanjaStacked(w, h, w_anim, strokeOffset, baseS, gap, centerGap);
    } else {
        if (hanjaDot) hanjaDot.style.display = 'none'; // 점은 모바일 상하 배치 전용
        drawHanjaSideBySide(w, h, w_anim, strokeOffset, baseS, gap, centerGap);
    }
}

/* =========================================
    7-1. HANJA Layout - 데스크탑 (좌: 정 / 우: 박)
    ========================================= */
function drawHanjaSideBySide(w, h, w_anim, strokeOffset, baseS, gap, centerGap) {
    const halfW = w / 2;
    const halfH = h / 2;
    const jW = halfW - (centerGap / 2);
    const unitX = jW / 50;
    const unitY = h / 100;

    const pLeft = halfW + (centerGap / 2);
    const pW = halfW - (centerGap / 2);
    const pUnitX = pW / 100;

    // 캔버스 시각적 한계선 (CSS offset 포함)
    const vTop = -strokeOffset;
    const vBot = h + strokeOffset;
    const vLeft = -strokeOffset;
    const vRight = w + strokeOffset;

    /* ------------------------------------------------
       [ FAT STROKE 최대치 계산 ]
       ------------------------------------------------ */
    const S_max_T = (halfH + strokeOffset - 17.5) / 4; 
    const S_max_B = (halfH + strokeOffset - 12.5) / 3;  
    const S_max_JX = (halfW + strokeOffset - 7.5) / 2;  
    const S_max_PX = (halfW + strokeOffset - 17.5) / 4; 

    const S_FAT = Math.min(S_max_T, S_max_B, S_max_JX, S_max_PX);
    const S = lerp(baseS, S_FAT, w_anim);

    /* ------------------------------------------------
       1. [ 0% NORMAL 좌표 ] 기존 원본 완벽 유지
       ------------------------------------------------ */
    const n_y1 = 0;
    const n_y2 = centerGap;
    const n_y3_top = 2 * centerGap;
    const n_y3_bot = halfH - centerGap / 2;
    const n_y4 = halfH + centerGap / 2;
    const n_y5 = n_y4 + centerGap;
    
    const n_jx_L = 0;
    const n_jx_R = 50 * unitX;
    const n_jx_Mid = 25 * unitX;
    
    const n_j5_L = centerGap;
    const n_j5_R = 50 * unitX - centerGap + strokeOffset; 

    const n_px1 = pLeft;
    const n_px2 = pLeft + 35 * pUnitX;
    const n_px3 = pLeft + 70 * pUnitX;
    const n_px4 = n_px3 + centerGap;
    const n_px5_end = pLeft + pW;

    /* ------------------------------------------------
       2. [ 100% FAT 좌표 ] 
       ------------------------------------------------ */
    // --- Y축 (Top) --- [위 코드 '정' 적용]
    const f_y1 = vTop + S_FAT / 2; 
    const f_y2 = f_y1 + S_FAT + gap;
    const f_y3_top = f_y2 + S_FAT + gap;
    const f_y3_bot = (halfH - 2.5) - S_FAT / 2; 

    // --- Y축 (Bottom) --- [위 코드 '정' 적용]
    const f_y4 = (halfH + 2.5) + S_FAT / 2;     
    const f_y5 = f_y4 + S_FAT + gap;
    const f_hook_bot = vBot - S_FAT / 2;        

    // --- X축 (정) --- [위 코드 '정' 적용]
    const f_jx_L = vLeft + S_FAT / 2;
    const f_jx_R = (halfW - 2.5) - S_FAT / 2;   
    const f_jx_Mid = (f_jx_L + f_jx_R) / 2;

    const f_j5_L = f_jx_L + S_FAT + gap;
    const f_j5_R = f_jx_R - S_FAT / 2 - gap;    

    // --- X축 (박) --- [아래 코드 '박' 적용 - 촘촘한 5px 간격 배열]
    const f_px1 = (halfW + 2.5) + S_FAT / 2;
    const f_px2 = f_px1 + S_FAT + gap;
    const f_px3 = f_px2 + S_FAT + gap;
    const f_px4 = f_px3 + S_FAT + gap;
    const f_px5_end = vRight - S_FAT / 2;

    /* ------------------------------------------------
       3. [ 실시간 보간(Lerp) 적용 ]
       ------------------------------------------------ */
    const y1 = lerp(n_y1, f_y1, w_anim);
    const y2 = lerp(n_y2, f_y2, w_anim);
    const y3_top = lerp(n_y3_top, f_y3_top, w_anim);
    const y3_bot = lerp(n_y3_bot, f_y3_bot, w_anim);
    const y4 = lerp(n_y4, f_y4, w_anim);
    const y5 = lerp(n_y5, f_y5, w_anim);
    const hook_bot = lerp(h, f_hook_bot, w_anim);

    const jx_L = lerp(n_jx_L, f_jx_L, w_anim);
    const jx_R = lerp(n_jx_R, f_jx_R, w_anim);
    const jx_Mid = lerp(n_jx_Mid, f_jx_Mid, w_anim); 

    const j5_L = lerp(n_j5_L, f_j5_L, w_anim);
    const j5_R = lerp(n_j5_R, f_j5_R, w_anim);

    const px1 = lerp(n_px1, f_px1, w_anim);
    const px2 = lerp(n_px2, f_px2, w_anim);
    const px3 = lerp(n_px3, f_px3, w_anim);
    const px4 = lerp(n_px4, f_px4, w_anim);
    const px5_end = lerp(n_px5_end, f_px5_end, w_anim);

    /* ================================================
       도면 렌더링
       ================================================ */
    // [정]
    const j1_L = lerp(15 * unitX, f_jx_L + (f_jx_R - f_jx_L) * 0.2, w_anim);
    const j1_R = lerp(35 * unitX, f_jx_L + (f_jx_R - f_jx_L) * 0.8, w_anim);
    jungPath1.setAttribute('d', `M ${j1_L},${y1} L ${j1_R},${y1}`);
    jungPath2.setAttribute('d', `M ${jx_L},${y2} L ${jx_R},${y2}`);
    jungPath3.setAttribute('d', `M ${jx_L},${y3_top} L ${jx_R},${y3_top} L ${jx_R},${y3_bot} L ${jx_L},${y3_bot} Z`);
    
    const j4_leg = lerp(n_y4 + 25 * unitY, f_hook_bot, w_anim); 
    jungPath4.setAttribute('d', `M ${jx_L},${j4_leg} L ${jx_L},${y4} L ${jx_R},${y4} L ${jx_R},${j4_leg}`);
    
    // ★ 정5 세로선 5px 간격 유지 (S_FAT + gap 으로 수정 완료)
    const hook_w = lerp(15 * unitX, S_FAT + gap, w_anim); 
    const hook_top = lerp(h - 25 * unitY, f_y5 + S_FAT + gap, w_anim);
    jungPath5.setAttribute('d', `M ${j5_L},${y5} L ${j5_R},${y5} L ${jx_Mid},${y5} L ${jx_Mid},${hook_bot} L ${jx_Mid - hook_w},${hook_bot} L ${jx_Mid - hook_w},${hook_top}`);

    // [박] 
    const park_yTop = lerp(0, f_y1, w_anim); 
    const park_yBot = lerp(h, f_hook_bot, w_anim);

    parkPath1.setAttribute('d', `M ${px1},${y2} L ${px3},${y2}`);
    parkPath2.setAttribute('d', `M ${px2},${park_yTop} L ${px2},${park_yBot}`);
    parkPath3.setAttribute('d', `M ${px1},${park_yBot} L ${px1},${y3_top} L ${px3},${y3_top} L ${px3},${park_yBot}`);
    parkPath4.setAttribute('d', `M ${px4},${park_yTop} L ${px4},${park_yBot}`);
    parkPath5.setAttribute('d', `M ${px4},${y3_top} L ${px5_end},${y3_top}`);

    // 단일 두께 S 일괄 적용
    [jungPath1, jungPath2, jungPath3, jungPath4, jungPath5,
     parkPath1, parkPath2, parkPath3, parkPath4, parkPath5].forEach(p => {
        p.style.strokeWidth = `${S}px`;
    });
}

/* =========================================
    7-2. HANJA Layout - 모바일 (위: 정 / 아래: 박)
    데스크탑 버전과 동일한 로직이되, 폭/높이의 역할을 맞바꿔서
    "가로 절반씩 나눠쓰기"를 "세로 절반씩 나눠쓰기"로 바꾼 버전
    ========================================= */
function drawHanjaStacked(w, h, w_anim, strokeOffset, baseS, gap, centerGap) {
    const halfH = h / 2;
    const qH = halfH / 2; // 정/박 각자 내부 구조의 중간 지점 (데스크탑의 halfH 역할)

    const jUnitX = w / 50;      // 정의 가로 유닛 (데스크탑 unitX, halfW → w)
    const unitY = halfH / 100;  // 정의 세로 유닛 (데스크탑 unitY, h → halfH)
    const pUnitX = w / 100;     // 박의 가로 유닛 (데스크탑 pUnitX, pW → w)

    // 좌우는 정/박이 공유(전체 너비), 위아래는 절반씩 나눠 가짐
    const vLeft = -strokeOffset;
    const vRight = w + strokeOffset;
    const jTop = -strokeOffset;        // 정의 위쪽 한계 (화면 맨 위)

    /* FAT STROKE 최대치 계산 (halfW → w, halfH → qH) */
    const S_max_T = (qH + strokeOffset - 17.5) / 4;
    const S_max_B = (qH + strokeOffset - 12.5) / 3;
    const S_max_JX = (w + strokeOffset - 7.5) / 2;
    const S_max_PX = (w + strokeOffset - 17.5) / 4;

    const S_FAT = Math.min(S_max_T, S_max_B, S_max_JX, S_max_PX);
    const baseS_mobile = baseS / 1.3; //
    const S = lerp(baseS_mobile, S_FAT, w_anim);

    // NORMAL 상태의 획 두께를 절반으로 줄였으므로, 그 두께 기준으로 붙어있는 획들의
    // 간격 단위(centerGap)도 절반 두께 기준으로 다시 계산 - 안 그러면 클릭 전/후 간격이 달라짐
    const centerGap_mobile = baseS_mobile + gap;

    // 데스크탑 원본은 baseS === 2*strokeOffset이라 "0"이 곧 벽에 딱 맞는 값이었지만,
    // 모바일은 NORMAL 두께를 절반(baseS_mobile)으로 줄이면서 이 우연한 등식이 깨졌음.
    // 그래서 벽에 닿아야 하는 끝은 항상 명시적으로 (벽 위치 ± 두께/2)로 계산해야 클릭 전/후 여백이 같아짐
    const n_wallGap = baseS_mobile / 2;

    /* 0% NORMAL 좌표 - 정 (위쪽 절반) */
    // jy1(jungPath1)은 jx_L/px1처럼 벽에 딱 붙어야 함(여백 없이). jy2/jy3_top은 jy1 기준
    // 상대값으로 사슬처럼 연결해서, jy1 위치가 바뀌어도 그 뒤 5px 간격은 그대로 유지되게 함
    const n_jy1 = jTop + n_wallGap;
    const n_jy2 = n_jy1 + centerGap_mobile;
    const n_jy3_top = n_jy1 + 2 * centerGap_mobile;
    const n_jy3_bot = qH - centerGap_mobile / 2;
    const n_jy4 = qH + centerGap_mobile / 2;
    const n_jy5 = n_jy4 + centerGap_mobile;

    const n_jx_L = vLeft + n_wallGap;
    const n_jx_R = vRight - n_wallGap;
    const n_jx_Mid = 25 * jUnitX;

    // j5_L(jungPath5 왼쪽 시작점)도 jx_L(jungPath4 왼쪽 세로획)과 5px 간격이어야 하므로
    // 독립적인 centerGap_mobile 대신 jx_L 기준 상대값으로 계산
    const n_j5_L = n_jx_L + centerGap_mobile;
    const n_j5_R = 50 * jUnitX - centerGap_mobile + strokeOffset;

    /* 0% NORMAL 좌표 - 박 (아래쪽 절반, X는 정과 동일 범위 공유) */
    const n_px1 = vLeft + n_wallGap;
    const n_px2 = 35 * pUnitX;
    const n_px3 = 70 * pUnitX;
    const n_px4 = n_px3 + centerGap_mobile;
    const n_px5_end = vRight - n_wallGap;

    /* 100% FAT 좌표 - 정 */
    const f_jy1 = jTop + S_FAT / 2;
    const f_jy2 = f_jy1 + S_FAT + gap;
    const f_jy3_top = f_jy2 + S_FAT + gap;
    const f_jy3_bot = (qH - 2.5) - S_FAT / 2;

    const f_jy4 = (qH + 2.5) + S_FAT / 2;
    const f_jy5 = f_jy4 + S_FAT + gap;

    // 정/박 경계(halfH)에서 만나는 두 끝: stroke-linecap:square가 끝을 stroke폭/2만큼
    // 더 튀어나오게 그리므로, 그만큼(S_FAT/2)을 미리 안쪽으로 당겨서 서로 겹치지 않게 함
    const n_j_hookbot = halfH - centerGap_mobile / 2; // 정 쪽 여유(NORMAL)
    const f_j_hookbot = (halfH - 2.5) - S_FAT / 2; // 정 쪽 여유(FAT)
    const n_p_top = halfH + centerGap_mobile / 2; // 박 쪽 여유(NORMAL)
    const f_p_top = (halfH + 2.5) + S_FAT / 2; // 박 쪽 여유(FAT)

    // 박의 진짜 아래쪽 한계(화면 맨 아래) - 정의 jTop과 대칭되는 캔버스 끝, halfH 경계와는 무관
    const pBot = h + strokeOffset;
    const n_p_hookbot = pBot - n_wallGap;
    const f_p_hookbot = pBot - S_FAT / 2;

    const f_jx_L = vLeft + S_FAT / 2;
    const f_jx_R = vRight - S_FAT / 2; // 정도 박처럼 화면 오른쪽 벽까지 닿아야 함 (센터 분할 기준이던 desktop식 -2.5 여백 제거)
    const f_jx_Mid = (f_jx_L + f_jx_R) / 2;

    const f_j5_L = f_jx_L + S_FAT + gap;
    const f_j5_R = f_jx_R - S_FAT / 2 - gap;

    /* 100% FAT 좌표 - 박 */
    const f_px1 = vLeft + S_FAT / 2;
    const f_px2 = f_px1 + S_FAT + gap;
    const f_px3 = f_px2 + S_FAT + gap;
    const f_px4 = f_px3 + S_FAT + gap;
    const f_px5_end = vRight - S_FAT / 2;

    /* 실시간 보간 - 정 */
    const jy1 = lerp(n_jy1, f_jy1, w_anim);
    const jy2 = lerp(n_jy2, f_jy2, w_anim);
    const jy3_top = lerp(n_jy3_top, f_jy3_top, w_anim);
    const jy3_bot = lerp(n_jy3_bot, f_jy3_bot, w_anim);
    const jy4 = lerp(n_jy4, f_jy4, w_anim);
    const jy5 = lerp(n_jy5, f_jy5, w_anim);
    const j_hookbot = lerp(n_j_hookbot, f_j_hookbot, w_anim);
    const p_top = lerp(n_p_top, f_p_top, w_anim);
    const p_hookbot = lerp(n_p_hookbot, f_p_hookbot, w_anim);

    const jx_L = lerp(n_jx_L, f_jx_L, w_anim);
    const jx_R = lerp(n_jx_R, f_jx_R, w_anim);
    const jx_Mid = lerp(n_jx_Mid, f_jx_Mid, w_anim);

    const j5_L = lerp(n_j5_L, f_j5_L, w_anim);
    const j5_R = lerp(n_j5_R, f_j5_R, w_anim);

    /* 실시간 보간 - 박 */
    const px1 = lerp(n_px1, f_px1, w_anim);
    const px2 = lerp(n_px2, f_px2, w_anim);
    const px3 = lerp(n_px3, f_px3, w_anim);
    const px4 = lerp(n_px4, f_px4, w_anim);
    const px5_end = lerp(n_px5_end, f_px5_end, w_anim);

    /* ================================================
       도면 렌더링
       ================================================ */
    // [정] - 위쪽 절반
    // 클릭 후(FAT) jungPath1의 가로 너비 = jungPath5에서 가장 긴 가로 획(j5_L~j5_R)의 시각적 너비.
    // jungPath1은 독립된 path라 양끝 다 square cap이 붙어 좌표 길이+S만큼 보이지만,
    // jungPath5의 j5_L~j5_R 구간은 j5_L(진짜 시작점)만 cap이고 j5_R은 꺾이는 지점(join)이라 cap이 안 붙음.
    // 그래서 "같은 좌표 길이"가 아니라 "같은 시각적 길이"가 되도록 S_FAT/2만큼 보정
    const f_j1_targetWidth = (f_j5_R - f_j5_L) - S_FAT / 2;
    const f_j1_halfW = f_j1_targetWidth / 2;
    const j1_L = lerp(15 * jUnitX, f_jx_Mid - f_j1_halfW, w_anim);
    const j1_R = lerp(35 * jUnitX, f_jx_Mid + f_j1_halfW, w_anim);
    jungPath1.setAttribute('d', `M ${j1_L},${jy1} L ${j1_R},${jy1}`);
    jungPath2.setAttribute('d', `M ${jx_L},${jy2} L ${jx_R},${jy2}`);
    jungPath3.setAttribute('d', `M ${jx_L},${jy3_top} L ${jx_R},${jy3_top} L ${jx_R},${jy3_bot} L ${jx_L},${jy3_bot} Z`);

    const j4_leg = lerp(n_jy4 + 25 * unitY, f_j_hookbot, w_anim);
    jungPath4.setAttribute('d', `M ${jx_L},${j4_leg} L ${jx_L},${jy4} L ${jx_R},${jy4} L ${jx_R},${j4_leg}`);

    const hook_w = lerp(15 * jUnitX, S_FAT + gap, w_anim);
    const hook_top = lerp(halfH - 25 * unitY, f_jy5 + S_FAT + gap, w_anim);
    jungPath5.setAttribute('d', `M ${j5_L},${jy5} L ${j5_R},${jy5} L ${jx_Mid},${jy5} L ${jx_Mid},${j_hookbot} L ${jx_Mid - hook_w},${j_hookbot} L ${jx_Mid - hook_w},${hook_top}`);

    // [박] - 아래쪽 절반. 위쪽(p_top)은 정과의 경계, 아래쪽(p_hookbot)은 화면 진짜 끝 - 서로 다른 기준이라 각각 계산
    const park_yTop = p_top;
    const park_yBot = p_hookbot;
    const py3_top = jy3_top + halfH;

    parkPath1.setAttribute('d', `M ${px1},${jy2 + halfH} L ${px3},${jy2 + halfH}`);
    parkPath2.setAttribute('d', `M ${px2},${park_yTop} L ${px2},${park_yBot}`);
    parkPath3.setAttribute('d', `M ${px1},${park_yBot} L ${px1},${py3_top} L ${px3},${py3_top} L ${px3},${park_yBot}`);
    parkPath4.setAttribute('d', `M ${px4},${park_yTop} L ${px4},${park_yBot}`);
    parkPath5.setAttribute('d', `M ${px4},${py3_top} L ${px5_end},${py3_top}`);

    [jungPath1, jungPath2, jungPath3, jungPath4, jungPath5,
     parkPath1, parkPath2, parkPath3, parkPath4, parkPath5].forEach(p => {
        p.style.strokeWidth = `${S}px`;
    });

    // 오른쪽 하단 점 - 클릭 전엔 반지름 0(=안 보임)에서 시작해서, 다른 획들과 같은
    // w_anim(=같은 템포/이징)을 타고 커지며 나타남. 다 커졌을 때 지름은 다른 획과 같은 S_FAT.
    // 중심을 항상 (벽 - 반지름)로 잡아서, 커지는 동안에도 오른쪽·아래쪽 벽에 여백 없이 딱 붙어있음
    if (hanjaDot) {
        hanjaDot.style.display = 'block';
        const dotR = lerp(0, S_FAT / 2, w_anim);
        hanjaDot.setAttribute('cx', vRight - dotR);
        hanjaDot.setAttribute('cy', pBot - dotR);
        hanjaDot.setAttribute('r', dotR);
    }
}

function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function animateHanjaWeight() {
    if (Math.abs(targetHanjaWeight - hanjaWeight) > 0.001) {
        hanjaWeight += (targetHanjaWeight - hanjaWeight) * 0.025; 
        drawResponsiveHANJA(easeInOutQuad(hanjaWeight));
        hanjaAnimId = requestAnimationFrame(animateHanjaWeight);
    } else {
        hanjaWeight = targetHanjaWeight;
        drawResponsiveHANJA(hanjaWeight);
        cancelAnimationFrame(hanjaAnimId);
    }
}

if (hanjaSvg) {
    hanjaSvg.style.pointerEvents = 'auto'; 
    hanjaSvg.style.cursor = 'pointer';
    hanjaSvg.addEventListener('click', () => {
        targetHanjaWeight = targetHanjaWeight === 0 ? 1 : 0;
        if (hanjaAnimId) cancelAnimationFrame(hanjaAnimId);
        animateHanjaWeight();
    });
}

window.addEventListener('resize', () => {
    drawResponsiveJUNG();
    drawResponsivePARK();
    drawResponsiveHANJA(hanjaWeight);
});
drawResponsiveJUNG();
drawResponsivePARK();
drawResponsiveHANJA(hanjaWeight);



/* =========================================
   Index Page Drag Swipe (Slide 0, 1, 2)
   ========================================= */
let indexDragStartX = 0;
let isIndexDragging = false;

window.addEventListener('mousedown', (e) => {
    if (window.innerWidth <= 768) return;
    
    // 아카이브, 팝업창, 메뉴 등 다른 클릭/스크롤 요소에서는 슬라이드 스와이프 방지
    if (e.target.closest('.archive') || e.target.closest('#media-popup-content') || e.target.closest('menu') || e.target.closest('.info-text-box')) return;
    
    // 모바일 오버레이가 켜져있으면 작동 방지
    if (document.getElementById('mobile-block-overlay') && window.getComputedStyle(document.getElementById('mobile-block-overlay')).display !== 'none') return;
    
    isIndexDragging = true;
    indexDragStartX = e.clientX;
    document.body.classList.add('is-dragging');
});

window.addEventListener('mouseup', (e) => {
    if (!isIndexDragging) return;
    isIndexDragging = false;
    document.body.classList.remove('is-dragging');

    if (!isIntroFinished || isScrollLocked) return;

    const infoPopup = document.getElementById('dynamic-info-popup');
    if (infoPopup && infoPopup.classList.contains('is-active')) return;

    const diffX = indexDragStartX - e.clientX;

    // 50px 이상 드래그 시 슬라이드 전환 실행
    if (Math.abs(diffX) > 50) {
        if (diffX > 0) { // 왼쪽으로 스와이프 (우측 슬라이드로)
            if (currentSlide === 0) goToSlide(1);
            else if (currentSlide === 1) goToSlide(2);
        } else { // 오른쪽으로 스와이프 (좌측 슬라이드로)
            if (currentSlide === 1) goToSlide(0);
            else if (currentSlide === 2) goToSlide(1);
        }
    }
});

// 드래그 중 기본 이벤트 방지
window.addEventListener('mousemove', (e) => {
    if (isIndexDragging) {
        e.preventDefault();
    }
}, { passive: false });

/* 모바일 responsive */

