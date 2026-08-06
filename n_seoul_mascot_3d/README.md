# N Seoul Mascot 3D

독립 실행형 Vanilla JavaScript + Three.js 마스코트 작업 공간입니다.

이 폴더 밖의 프로젝트 파일을 수정하지 않습니다.

## 현재 구현 범위

- 관절형 절차적 3D 마스코트 form-refinement
- `idle`, `walk`, `wave` 애니메이션
- 걷기 이동/제자리 걷기 전환
- 마우스 드래그와 키보드 방향키로 시점 회전
- 모션 감소 환경 지원
- 타원형 티셔츠 외피, 봉제선, 미세 천 질감
- 관절 틈을 가리는 어깨 겹침 곡면
- 접지 보정이 적용된 뒤뚱걸음과 전면에서 읽히는 손 흔들기 궤적
- 앞면만 오목하고 뒤는 닫힌 봉제 귀, 눈 하이라이트, 후면 꼬리 봉제선
- 얇아진 가슴 로고와 인스턴싱으로 만든 목둘레·밑단 봉제 땀
- 화면 밖·숨김 탭 렌더 중지와 모바일 DPR 1.5 상한
- IntersectionObserver 미지원 fallback과 WebGL 컨텍스트 자동 복구
- 동작 라이브 상태, 숫자 키 조작, reduced-motion 동작 제어

## 실행

로컬 정적 서버에서 `index.html`을 엽니다. Three.js 0.180.0은 `vendor/`에 고정되어 있어 실행 시 외부 네트워크가 필요하지 않습니다.

```powershell
python -m http.server 8000
```

그런 다음 `http://localhost:8000/n_seoul_mascot_3d/`에 접속합니다.

## 참조 이미지

`references/`에는 제작 기준 이미지의 복사본만 둡니다. 원본은 변경하지 않습니다.

## Third-party

- Three.js 0.180.0 — MIT License
- 라이선스 원문: `vendor/THREE-LICENSE.txt`
- 로컬 모듈: `vendor/three.module.min.js`, `vendor/three.core.min.js`
