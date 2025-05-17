// 이미지 경로 동적 생성
function generateImagePaths(prefix, start, end, extension = 'webp') {
    const images = [];
    for (let i = start; i <= end; i++) {
        images.push(`images/${prefix}${i.toString().padStart(3, '0')}.${extension}`);
    }
    return images;
}

// DOM 요소
const [leftPage, rightPage] = [
    document.getElementById('leftPage'),
    document.getElementById('rightPage')
];
const [leftImage, rightImage] = [
    document.getElementById('leftImage'),
    document.getElementById('rightImage')
];
const pageCounter = document.getElementById('pageCounter');
const bookmark = document.querySelectorAll('.bookmark');

document.body.classList.add('first-page');

// 전역 상태
const images = generateImagePaths('photo', 0, 211);
let currentPage = 0;
const imageCache = {};

// 이미지 프리로딩
function preloadImages() {
    images.forEach(imgSrc => {
        const img = new Image();
        img.src = imgSrc;
        imageCache[imgSrc] = img;
    });
}

// 페이지 이동
function goToPage(pageNumber) {
    const parsedPage = parseInt(pageNumber);
    if (isNaN(parsedPage)) {
        currentPage = 0;
        updatePages();
        return;
    }

    const clampedPage = Math.max(0, Math.min(parsedPage, images.length));
    currentPage = clampedPage % 2 === 0 ? clampedPage : clampedPage + 1;
    updatePages();
}

// 페이지 업데이트
function updatePages() {
    if (isMobile()) {
        updateMobilePages();
        return;
    }

    const isFirstPage = currentPage === 0;

    leftImage.src = images[currentPage];
    rightImage.src = images[currentPage + 1] || '';

    document.body.classList.toggle('first-page', isFirstPage);

    if (isFirstPage) {
        leftPage.style.visibility = 'hidden';
        rightImage.src = images[0];
    } else {
        leftPage.style.visibility = 'visible';
        leftPage.style.display = 'flex';
        leftImage.src = images[currentPage - 1];
        rightImage.src = images[currentPage] || '';
    }

    updatePageCounter();
    updateActiveBookmark();
}

// 페이지 카운터 업데이트
function updatePageCounter() {
    pageCounter.innerHTML = `
        <input type="text"
               id="pageInput"
               value="${currentPage}"
               pattern="\\d*"
               style="width: 50px; text-align: center;">
        / ${images.length}
    `;

    const pageInput = document.getElementById('pageInput');
    if(pageInput) {
        pageInput.addEventListener('blur', () => {
            goToPage(pageInput.value);
        });
        pageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                goToPage(pageInput.value);
                pageInput.blur();
            }
        });
    }
}

// 페이지 네비게이션
function handlePageNavigation(event) {
    const isLeftPage = event.currentTarget.id === 'leftPage';

    if (isLeftPage && currentPage > 0) {
        currentPage -= 2;
        console.log('이전페이지');
        updatePages();
    }
    else if (!isLeftPage && currentPage < images.length - 2) {
        currentPage += 2;
        console.log('다음페이지');
        updatePages();
    }
}

// 방향키 이동
function handleDesktopKeyPress(event) {
    if (!isMobile()) {
        if (event.key === 'ArrowLeft') {
            if (currentPage > 0) {
                currentPage -= 2;
                updatePages();
            }
        } else if (event.key === 'ArrowRight') {
            if (currentPage < images.length - 2) {
                currentPage += 2;
                updatePages();
            }
        }
    }
}

// 북마크 핸들러
function handleBookmarkClick() {
    const targetPage = parseInt(this.dataset.page);
    currentPage = targetPage % 2 === 0 ? targetPage : targetPage + 1;
    updatePages();
}

// 현재 페이지에 해당하는 북마크 활성화 함수
function updateActiveBookmark() {
    bookmark.forEach(bm => {
        const bookmarkPage = parseInt(bm.dataset.page);
        const isActive = currentPage >= bookmarkPage && currentPage < bookmarkPage + 1;
        bm.classList.toggle('active', isActive);
    });
}

bookmark.forEach(bm => bm.addEventListener('click', handleBookmarkClick));

// 모바일 체크 함수
function isMobile() {
    return window.innerWidth <= 768;
}

// 모바일 페이지 클릭 핸들러
function handleMobilePageClick(e) {
    const pageX = e.offsetX;
    if (pageX < rightPage.clientWidth / 2) {
        currentPage = Math.max(0, currentPage - 1);
    } else {
        currentPage = Math.min(images.length - 1, currentPage + 1);
    }
    updateMobilePages();
}

// 모바일 페이지 업데이트
function updateMobilePages() {
    rightImage.src = images[currentPage];
    pageCounter.querySelector('input').value = currentPage;
    updateActiveBookmark();
}

const handleClick = (e) => {
    if (!e.target.closest('.bookmark')) {
        if (isMobile()) {
            handleMobilePageClick(e);
        } else {
            if (currentPage % 2 !== 0) {
                currentPage++;
            }
            handlePageNavigation(e);
        }
    }
};

const handleKeydown = (event) => {
    if (!isMobile()) {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            if (currentPage % 2 !== 0 && event.key === 'ArrowRight') {
                currentPage++;
            }
            handleDesktopKeyPress(event);
        }
    }
};

function initEventListeners() {
    // 기존 이벤트 리스너 제거 (혹시 모를 중복 방지)
    leftPage.removeEventListener('click', handleClick);
    rightPage.removeEventListener('click', handleClick);
    document.removeEventListener('keydown', handleKeydown);

    // 이벤트 리스너를 한 번만 등록
    leftPage.addEventListener('click', handleClick);
    rightPage.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeydown);
}

function init() {
    window.addEventListener('resize', initEventListeners);
    preloadImages();
    initEventListeners();
    updatePageCounter();
    updatePages();
}

init();