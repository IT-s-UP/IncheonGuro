package com.itsup.incheonguro.courseguide;

import com.itsup.incheonguro.courseguide.entity.LocalCourse;
import com.itsup.incheonguro.courseguide.entity.LocalCoursePlace;
import com.itsup.incheonguro.courseguide.repository.LocalCoursePlaceRepository;
import com.itsup.incheonguro.courseguide.repository.LocalCourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

// 관광공사 API 코스 목록에 섞어 보여줄, 우리가 직접 고른 코스 16개를 넣어둠.
// 로컬 개발 DB가 비어있을 때만 한 번 실행됨 - 운영 DB는 이 클래스와 무관하게 그대로 유지됨.
@Component
@Profile("local")
@RequiredArgsConstructor
public class LocalCourseSeeder implements CommandLineRunner {

  private final LocalCourseRepository localCourseRepository;
  private final LocalCoursePlaceRepository localCoursePlaceRepository;

  @Override
  public void run(String... args) {
    if (localCourseRepository.count() > 0) {
      return;
    }

    seedCourse("인천 개항장 & 차이나타운 골목 여행", "인천의 원조 관광지, 근대 개항 역사와 차이나타운 먹거리를 함께 즐기는 코스입니다.", true,
        "https://tong.visitkorea.or.kr/cms/resource/04/4064804_image2_1.jpg",
        place("인천역", "인천 제물포구 제물량로 269", 37.476166712082836, 126.61682219568799),
        place("인천차이나타운", "인천 제물포구 북성동2가 14", 37.475603588181436, 126.61793637378366),
        place("공화춘", "인천 제물포구 차이나타운로 43", 37.4753908741045, 126.619588013992),
        place("자유공원", "인천 제물포구 송학동1가 11-1", 37.4755030373606, 126.621970582675),
        place("신포국제시장", "인천 제물포구 우현로49번길 25", 37.47136928898872, 126.62709429096569));

    seedCourse("바다 내음 가득한 월미도 나들이", "바다를 배경으로 놀이시설과 조개구이거리를 즐기는 코스입니다.", false,
        "https://tong.visitkorea.or.kr/cms/resource/94/3518594_image2_1.jpg",
        place("월미테마파크", "인천 제물포구 월미문화로 81", 37.471450212808016, 126.59633409598895),
        place("월미문화의거리", "인천 제물포구 북성동1가 98-290", 37.473621368634, 126.597841799787),
        place("전라도대왕조개구이", "인천 제물포구 월미문화로 27", 37.475928558895, 126.598023887485),
        place("월미공원 전망대", "인천 제물포구 북성동1가 산 125", 37.469527099473, 126.605292919657));

    seedCourse("을왕리·선녀바위 서해 낙조 드라이브", "서해 낙조와 해변 산책, 조개구이를 함께 즐길 수 있는 드라이브 코스입니다.", true,
        "https://tong.visitkorea.or.kr/cms/resource/78/3518478_image2_1.jpg",
        place("선녀바위해변", "인천 영종구 을왕동 678-188", 37.43947593605281, 126.37870818957582),
        place("을왕리해수욕장", "인천 영종구 을왕동", 37.4462920026041, 126.372737043106),
        place("왕산해수욕장", "인천 영종구 을왕동 810-201", 37.455689495557415, 126.36970193259118),
        place("청춘조개 을왕리직영점", "인천 영종구 용유서로423번길 7", 37.455504952332134, 126.37074666328056),
        place("마시란해변", "인천 영종구 덕교동 662-8", 37.4320840360107, 126.416892933344));

    seedCourse("무의도 하나개해변과 호룡곡산 섬 산책", "무의도 하나개해수욕장과 호룡곡산, 실미도 갯벌길을 함께 즐기는 코스입니다.", false,
        "https://tong.visitkorea.or.kr/cms/resource/54/3498254_image2_1.jpg",
        place("실미유원지", "인천 영종구 큰무리로 124-17", 37.4018443767844, 126.402083681149),
        place("무의도 하나개해수욕장", "인천 영종구 무의동 산 189", 37.3848326961993, 126.409851834803),
        place("호룡곡산산림욕장", "인천 영종구 하나개로 129-50", 37.383231756685, 126.413324019162),
        place("하나개횟집", "인천 영종구 하나개로 151-6", 37.384192682006415, 126.41069580101858));

    seedCourse("청라 호수와 스카이라인 산책", "청라국제도시의 호수와 수로, 전망대를 둘러보는 코스입니다.", true,
        "https://tong.visitkorea.or.kr/cms/resource/25/4056225_image2_1.jpg",
        place("청라호수공원", "인천 서해구 청라동 106-2", 37.53249042934526, 126.63427992472252),
        place("청라시티타워", "인천 서해구 청라한내로72번길 7", 37.5320274984407, 126.628564223402),
        place("송도어반 청라점", "인천 서해구 청라한내로72번길 7-15", 37.5325404679885, 126.629521090693),
        place("커널웨이", "인천 서해구 청라동 162-12", 37.53283094761343, 126.65154321281517));

    seedCourse("정서진 노을이 물드는 아라뱃길", "아라뱃길 서쪽 끝 정서진에서 노을과 전망을 즐기는 코스입니다.", false,
        "https://tong.visitkorea.or.kr/cms/resource/48/3527648_image2_1.jpg",
        place("정서진", "인천 검단구 정서진남로 95", 37.55694730207231, 126.60473040806927),
        place("정서진 아라타워", "인천 서해구 정서진1로 41", 37.55843439362275, 126.60756782701283),
        place("아르테파인 라운지 인천", "인천 서해구 정서진1로 41", 37.55805381748994, 126.60610758116397));

    seedCourse("계양산 숲길과 장미원 나들이", "계양산 등산로와 계양산성을 둘러보는 자연 코스입니다.", false,
        "http://tong.visitkorea.or.kr/cms/resource/65/3043565_image2_1.jpg",
        place("계양산", "인천 계양구 목상동 산 57-1", 37.553160771034754, 126.7145586551151),
        place("계양산성", "인천 계양구 계산동 산 10-1", 37.550197205342016, 126.72705206456793),
        place("계양산장미원", "인천 계양구 경명대로955번길 17", 37.5470413558224, 126.712391207761),
        place("계양문화회관", "인천 계양구 계양산로35번길 11", 37.54609118725516, 126.71815464374623),
        place("놀부홍두깨칼국수 계양산점", "인천 계양구 계양산로215번길 4", 37.54779328281724, 126.74020340318731));

    seedCourse("부평 캠프마켓, 100년의 기억을 걷다", "부평 캠프마켓 역사문화공원과 문화의거리를 둘러보는 코스입니다.", false,
        "https://tong.visitkorea.or.kr/cms/resource/30/3350030_image2_1.jpg",
        place("부평 캠프마켓", "인천 부평구 산곡동 449", 37.4933058692551, 126.713940769044),
        place("부평공원", "인천 부평구 부평동 299", 37.4888145480349, 126.713645816972),
        place("부평문화의거리", "인천 부평구 광장로 6", 37.4941629743516, 126.724277577653),
        place("부평역지하상가", "인천 부평구 광장로 16", 37.490048002375545, 126.723470653749));

    seedCourse("수봉공원에서 만나는 인천상륙작전의 기억", "수봉공원과 인천상륙작전기념관을 둘러보는 역사 코스입니다.", false,
        "https://tong.visitkorea.or.kr/cms/resource/97/3037297_image2_1.jpg",
        place("수봉공원", "인천 미추홀구 숭의동 8-193", 37.4594870512564, 126.662546895236),
        place("수봉공원 스카이워크전망대", "인천 미추홀구 도화동 597-204", 37.46182493373794, 126.6646805982562),
        place("수봉공원 인천지구전적비", "인천 미추홀구 용현동 61-93", 37.4575785921042, 126.660615958486),
        place("공원장", "인천 미추홀구 인주대로211번길 49-26", 37.4572893917957, 126.66156667334));

    seedCourse("소래포구 갯벌 향 가득한 미식 여행", "싱싱한 해산물과 갯벌 풍경을 함께 즐기는 코스입니다.", true,
        "https://tong.visitkorea.or.kr/cms/resource/65/4039065_image2_1.jpg",
        place("소래포구종합어시장", "인천 남동구 소래역로 12", 37.39902662770026, 126.73718513522223),
        place("소래역사관", "인천 남동구 아암대로 1605", 37.3982028237935, 126.737468093638),
        place("소래습지생태공원", "인천 남동구 논현동 1-55", 37.4124100307355, 126.747372334203),
        place("소래철교", "인천 남동구 논현동", 37.3964367053012, 126.739041771216));

    seedCourse("인천대공원 장미향 가득한 힐링 산책", "인천에서 가장 큰 공원, 장미원과 동물원을 함께 둘러보는 코스입니다.", false,
        "https://tong.visitkorea.or.kr/cms/resource/53/4061653_image2_1.jpg",
        place("인천대공원 장미원", "인천 남동구 무네미로 238", 37.46037369460181, 126.75682649605338),
        place("인천수목원 온실", "인천 남동구 무네미로 238", 37.4601536544863, 126.758049055556),
        place("인천대공원 습지원", "인천 남동구 장수동 286", 37.4551155090846, 126.752970266538),
        place("인천대공원 동물원", "인천 남동구 장수동 산 112-3", 37.44900321792705, 126.7565253989697));

    seedCourse("송도국제도시 야경과 공원 산책", "송도국제도시의 랜드마크와 공원을 함께 즐기는 코스입니다.", true,
        "https://tong.visitkorea.or.kr/cms/resource/19/3512919_image2_1.jpg",
        place("송도달빛축제공원", "인천 연수구 센트럴로 350", 37.4072182744526, 126.634896508214),
        place("송도 센트럴파크", "인천 연수구 송도동 24-5", 37.393063959939425, 126.63862968940775),
        place("G타워 전망대", "인천 연수구 아트센터대로 175", 37.3960858692866, 126.634200641993),
        place("트리플스트리트", "인천 연수구 송도과학로16번길 33-3", 37.37999514170518, 126.66099750370242));

    seedCourse("아암도 해안 노을 산책", "해안 산책로를 따라 걸으며 카페까지 즐기는 힐링 코스입니다.", false,
        "http://tong.visitkorea.or.kr/cms/resource/50/3037250_image2_1.jpg",
        place("아암도해안공원", "인천 연수구 송도동 산 1", 37.412227452431786, 126.64121924777581),
        place("인천상륙작전기념관", "인천 연수구 청량로 138", 37.419870140468625, 126.65401035656897),
        place("능허대공원", "인천 연수구 옥련동 194-54", 37.422820031694414, 126.64309038171652),
        place("바다쏭 인천연수점", "인천 연수구 능허대로 16", 37.42954374180985, 126.63611340023536));

    seedCourse("고인돌부터 용흥궁까지, 강화 역사 한 바퀴", "세계유산 고인돌과 고려산, 강화읍 향토음식을 함께 즐기는 역사 여행 코스입니다.", true,
        "https://tong.visitkorea.or.kr/cms/resource/86/4061486_image2_1.jpg",
        place("강화고인돌공원", "인천 강화군 하점면 강화대로 994-12", 37.7734991243979, 126.437308513139),
        place("강화역사박물관", "인천 강화군 하점면 강화대로 994-19", 37.77390528073349, 126.43557676679386),
        place("고려산", "인천 강화군 내가면 고천리 산 131-1", 37.743925006403195, 126.43725564873459),
        place("용흥궁식당", "인천 강화군 강화읍 동문안길21번길 22-1", 37.747954172198, 126.48496083480461));

    seedCourse("강화해협을 지킨 옛 요새와 전등사", "강화해협을 지키던 옛 요새와 전등사를 함께 둘러보는 역사 코스입니다.", false,
        "https://tong.visitkorea.or.kr/cms/resource_photo/75/4079275_image2_1.JPG",
        place("광성보", "인천 강화군 불은면 해안동로466번길 27", 37.665140052732234, 126.52980934340425),
        place("덕진진", "인천 강화군 불은면 덕성리 355", 37.64918610844676, 126.52543628831108),
        place("초지진", "인천 강화군 길상면 해안동로 58", 37.6325202519864, 126.532307919915),
        place("전등사", "인천 강화군 길상면 전등사로 37-41", 37.6321456856267, 126.484778944969),
        place("죽림다원", "인천 강화군 길상면 전등사로 37-41", 37.631487426995015, 126.48506670803349));

    seedCourse("영흥대교 건너 서해 섬마을, 영흥도", "육로로 갈 수 있는 서해의 섬, 영흥도의 해변과 어시장을 즐기는 코스입니다.", false,
        "https://tong.visitkorea.or.kr/cms/resource/31/4098931_image2_1.jpg",
        place("십리포해수욕장", "인천 옹진군 영흥면 영흥북로 420-26", 37.2815926144853, 126.485243291213),
        place("국사봉", "인천 옹진군 영흥면 내리 1311-2", 37.27058853814135, 126.46317748693893),
        place("영흥수협수산물직판장", "인천 옹진군 영흥면 영흥로 109-12", 37.25458829957915, 126.4968907660899));
  }

  private record PlaceSeed(String name, String address, double latitude, double longitude) {
  }

  private PlaceSeed place(String name, String address, double latitude, double longitude) {
    return new PlaceSeed(name, address, latitude, longitude);
  }

  private void seedCourse(String name, String description, boolean recommended, String imageUrl, PlaceSeed... places) {
    LocalCourse course = localCourseRepository.save(new LocalCourse(name, description, recommended, imageUrl));

    List<LocalCoursePlace> coursePlaces = new ArrayList<>();
    for (int i = 0; i < places.length; i++) {
      PlaceSeed seed = places[i];
      coursePlaces.add(new LocalCoursePlace(course.getId(), seed.name(), seed.address(), i,
          seed.latitude(), seed.longitude()));
    }
    localCoursePlaceRepository.saveAll(coursePlaces);
  }
}
