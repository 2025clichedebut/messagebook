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
    if (pageNumber < 1) pageNumber = 1;
    if (pageNumber > images.length) pageNumber = images.length;

    currentPage = pageNumber % 2 === 0 ? pageNumber - 2 : pageNumber - 1;
    updatePages();
}

// 페이지 카운터
function updatePages() {
    leftImage.style.display = 'block';
    rightImage.style.display = 'block';

    leftImage.src = images[currentPage];
    rightImage.src = images[currentPage + 1] || '';

    pageCounter.innerHTML = `
        <input type="number"
               id="pageInput"
               value="${currentPage + 1}"
               min="1"
               max="${images.length}"
               style="width: 50px; text-align: center;">
        / ${images.length}
    `;

    const pageInput = document.getElementById('pageInput');
    pageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            goToPage(parseInt(pageInput.value));
            pageInput.blur();
        }
    });
    pageInput.addEventListener('blur', () => {
        goToPage(parseInt(pageInput.value));
    });
}

// 페이지 네비게이션
function handlePageNavigation(event) {
    if (window.innerWidth <= 768) return;

    const isLeftPage = event.currentTarget.id === 'leftPage';

    if (isLeftPage && currentPage > 0) {
        currentPage -= 2;
        updatePages();
    }
    else if (!isLeftPage && currentPage < images.length - 2) {
        currentPage += 2;
        updatePages();
    }
}

// 책갈피 핸들러
function handleBookmarkClick() {
    currentPage = parseInt(this.dataset.page) - 2;

    bookmark.forEach(bm => bm.classList.remove('active'));
    this.classList.add('active');

    updatePages();
}

// 이벤트 바인딩
leftPage.addEventListener('click', handlePageNavigation);
rightPage.addEventListener('click', handlePageNavigation);
window.addEventListener('resize', updatePages);
bookmark.forEach(bm => bm.addEventListener('click', handleBookmarkClick));

// 초기 실행
preloadImages();
updatePages();