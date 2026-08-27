#!/usr/bin/env python3
"""
아카이브 이미지 빌드 스크립트

원본 이미지 하나를 넣으면 두 벌을 만들어 줍니다.
  - xxx.webp     : 데스크탑용 (긴 변 1600px)
  - xxx-sm.webp  : 모바일용   (긴 변 700px)

archive.html에서는 <picture>로 둘을 묶어, 768px 이하 화면에서만 -sm을 받게 합니다.
이렇게 하는 이유: 파일 크기와 "디코딩 메모리"는 완전히 다른 값이라서,
3024px 이미지는 21KB여도 브라우저 메모리에서는 21MB를 차지합니다.
폰에 큰 이미지를 그대로 내려보내면 사파리가 탭을 강제 종료합니다.

사용법:
    python3 make-images.py <원본이미지> [<원본이미지> ...]
    python3 make-images.py --all          # archive-images 안의 것들을 다시 생성

새 작업을 추가할 때:
    1) python3 make-images.py ~/Desktop/새작업.png
    2) archive.html에 <picture> 블록 추가 (아래 출력되는 스니펫 복사)
    3) xxx.webp 와 xxx-sm.webp 를 **둘 다** 커밋해서 올릴 것
"""

import sys
import os
from PIL import Image

DESKTOP_MAX = 1600
MOBILE_MAX = 700
OUT_DIR = 'archive-images'


def resize_to(im, cap):
    w, h = im.size
    if max(w, h) <= cap:
        return im.copy(), (w, h)
    s = cap / max(w, h)
    size = (round(w * s), round(h * s))
    return im.resize(size, Image.LANCZOS), size


def build(src, out_dir=OUT_DIR):
    im = Image.open(src)
    if im.mode not in ('RGB', 'RGBA'):
        im = im.convert('RGBA' if 'transparency' in im.info or im.mode in ('LA', 'PA') else 'RGB')

    stem = os.path.splitext(os.path.basename(src))[0]
    if stem.endswith('-sm'):
        stem = stem[:-3]

    big_path = os.path.join(out_dir, f'{stem}.webp')
    sm_path = os.path.join(out_dir, f'{stem}-sm.webp')

    big, big_size = resize_to(im, DESKTOP_MAX)
    big.save(big_path, 'WEBP', quality=90, method=6)

    sm, sm_size = resize_to(im, MOBILE_MAX)
    sm.save(sm_path, 'WEBP', quality=84, method=6)

    mem = sm_size[0] * sm_size[1] * 4 / 1048576
    print(f'  {stem}')
    print(f'    desktop {big_size[0]}x{big_size[1]:<5} {os.path.getsize(big_path)/1024:>6.0f}K   {big_path}')
    print(f'    mobile  {sm_size[0]}x{sm_size[1]:<5} {os.path.getsize(sm_path)/1024:>6.0f}K   (메모리 {mem:.1f}MB)')

    rel = os.path.relpath(big_path, '.').replace(os.sep, '/')
    rel_sm = os.path.relpath(sm_path, '.').replace(os.sep, '/')
    snippet = (f'<picture><source media="(max-width: 768px)" srcset="./{rel_sm}" type="image/webp">'
               f'<img src="./{rel}" alt="{stem}" loading="lazy" '
               f'width="{big_size[0]}" height="{big_size[1]}" decoding="async"></picture>')
    return snippet


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        return 1

    if args[0] == '--all':
        srcs = []
        for root, _dirs, names in os.walk(OUT_DIR):
            for n in names:
                if n.endswith('.webp') and not n.endswith('-sm.webp'):
                    srcs.append(os.path.join(root, n))
        srcs.sort()
    else:
        srcs = args

    print(f'\n데스크탑 {DESKTOP_MAX}px / 모바일 {MOBILE_MAX}px 로 생성합니다\n')
    snippets = []
    for s in srcs:
        if not os.path.exists(s):
            print(f'  !! 파일 없음: {s}')
            continue
        out_dir = os.path.dirname(s) if s.startswith(OUT_DIR) else OUT_DIR
        snippets.append(build(s, out_dir))

    print('\n--- archive.html 에 넣을 스니펫 ---')
    for sn in snippets:
        print(sn)
    print()
    print('!! xxx.webp 와 xxx-sm.webp 를 둘 다 커밋해서 올려야 합니다.')
    print('   -sm 파일이 없으면 <picture>는 <img>로 폴백하지 않고 그냥 깨집니다.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
