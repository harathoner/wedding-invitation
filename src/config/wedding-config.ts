const uniqueIdentifier = "JWK-WEDDING-TEMPLATE-V1";

// 갤러리 레이아웃 타입 정의
type GalleryLayout = "scroll" | "grid";
type GalleryPosition = "middle" | "bottom";

interface GalleryConfig {
  layout: GalleryLayout;
  position: GalleryPosition;
  images: string[];
}

export const weddingConfig = {
  // 메타 정보
  meta: {
    title: "천대웅 ❤️ 하근영의 결혼식에 초대합니다",
    description: "결혼식 초대장",
    ogImage: "/images/main.png",
    noIndex: true,
    _jwk_watermark_id: uniqueIdentifier,
  },

  // 메인 화면
  main: {
    title: "Wedding Invitation",
    image: "/images/main.png",
    date: "2026년 3월 14일 토요일 11시 30분",
    venue: "호텔PJ 뮤즈홀"
  },

  // 소개글
  intro: {
    title: "",
    text: "서로를 바라보며 걸어온\n소중한 발걸음이\n이제 하나의 길로 이어집니다.\n\n사랑과 믿음으로\n새 가정을 이루는 저희 두 사람의\n작은 시작을 알려드립니다."
  },

  // 결혼식 일정
  date: {
    year: 2026,
    month: 3,
    day: 14,
    hour: 11,
    minute: 30,
    displayDate: "2026.03.14 SAT AM 11:30",
  },

  // 장소 정보
  venue: {
    name: "호텔PJ",
    address: "서울 중구 마른내로 71\n호텔피제이",
    tel: "02-2280-7000",
    naverMapId: "호텔PJ", // 네이버 지도 검색용 장소명
    coordinates: {
      latitude: 37.565821,
      longitude: 126.995688,
    },
    placeId: "13011761", // 네이버 지도 장소 ID
    mapZoom: "15", // 지도 줌 레벨
    mapNaverCoordinates: "14141300,4507203,15,0,0,0,dh", // 네이버 지도 길찾기 URL용 좌표 파라미터 (구 형식)
    transportation: {
      subway: "충무로역 8번 출구에서 도보 5분\n을지로4가역 10번 출구에서 도보 5분",
      bus: "을지로4가 방면\n 100,105,152,202,261,604,7011\n퇴계로 방면\n 104,105,140,463,421,507,604,7011",
      shuttle: "충무로역 8번출구, 을지로4가역 9번출구 10~15분 간격으로 운행",
    },
    parking: "을지트윈타워 주차장 이용 가능 (2시간 무료)",
 /*   // 신랑측 배차 안내
    groomShuttle: {
      location: "신랑측 배차 출발지",
      departureTime: "오전 10시 30분 출발",
      contact: {
        name: "담당자명",
        tel: "010-1234-5678"
      }
    },
    // 신부측 배차 안내
    brideShuttle: {
      location: "신부측 배차 출발지",
      departureTime: "오전 11시 출발",
      contact: {
        name: "담당자명",
        tel: "010-9876-5432"
      }
    } */
  },

  // 갤러리
  gallery: {
    layout: "grid" as GalleryLayout, // "scroll" 또는 "grid" 선택
    position: "middle" as GalleryPosition, // "middle" (현재 위치) 또는 "bottom" (맨 하단) 선택
    images: [
      "/images/gallery/image1.JPG",
      "/images/gallery/image2.JPG",
      "/images/gallery/image3.JPG",
      "/images/gallery/image4.JPG",
      "/images/gallery/image5.JPG",
      "/images/gallery/image6.JPG",
      "/images/gallery/image7.JPG",
      "/images/gallery/image8.JPG",
      "/images/gallery/image9.JPG",
      "/images/gallery/image10.JPG",
      "/images/gallery/image11.JPG",
      "/images/gallery/image12.JPG",
    ],
  } as GalleryConfig,

  // 초대의 말씀
  invitation: {
    message: "한 줄기 별빛이 되어 만난 인연\n평생을 함께 걸어가려 합니다.\n\n소중한 분들의 축복 속에\n저희 두 사람이 첫 걸음을 내딛습니다.\n\n귀한 시간 내어 함께해 주신다면\n그 어떤 축복보다 값진 선물이 될 것입니다.",
    groom: {
      name: "천대웅",
      label: "아들",
      father: "천성주",
      mother: "한경자",
    },
    bride: {
      name: "하근영",
      label: "딸",
      father: "하엽재",
      mother: "박숙희",
    },
  },

  // 계좌번호
  account: {
    groom: {
      bank: "은행명",
      number: "123-456-789012",
      holder: "신랑이름",
    },
    bride: {
      bank: "은행명",
      number: "987-654-321098",
      holder: "신부이름",
    },
    groomFather: {
      bank: "은행명",
      number: "111-222-333444",
      holder: "신랑아버지",
    },
    groomMother: {
      bank: "은행명",
      number: "555-666-777888",
      holder: "신랑어머니",
    },
    brideFather: {
      bank: "은행명",
      number: "999-000-111222",
      holder: "신부아버지",
    },
    brideMother: {
      bank: "은행명",
      number: "333-444-555666",
      holder: "신부어머니",
    }
  },

  // RSVP 설정
  rsvp: {
    enabled: false, // RSVP 섹션 표시 여부
    showMealOption: false, // 식사 여부 입력 옵션 표시 여부
  },

  // 슬랙 알림 설정
  slack: {
    webhookUrl: process.env.NEXT_PUBLIC_SLACK_WEBHOOK_URL || "",
    channel: "#wedding-response",
    compactMessage: true, // 슬랙 메시지를 간결하게 표시
  },
}; 
