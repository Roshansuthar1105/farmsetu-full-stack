package com.farmsetu.config;

import com.farmsetu.model.entity.Badge;
import com.farmsetu.repository.BadgeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(2)
public class BadgeSeeder implements CommandLineRunner {

    private final BadgeRepository badgeRepository;

    @Override
    public void run(String... args) {
        if (badgeRepository.count() > 0) {
            log.info("Badges already seeded (count: {}).", badgeRepository.count());
            return;
        }

        log.info("Seeding standard agricultural badges with Hindi/English definitions...");

        List<Badge> defaultBadges = List.of(
                Badge.builder()
                        .name("Pioneer Farmer")
                        .hindiName("प्राथमिक कृषक")
                        .description("Complete your profile details to start your digital farming journey.")
                        .hindiDescription("कृषि मंच पर पंजीकृत होकर अपनी प्रोफाइल पूर्ण करें।")
                        .badgeType("MILESTONE")
                        .category("MILESTONE")
                        .rarity("BRONZE")
                        .criteriaType("PROFILE_COMPLETE")
                        .thresholdValue(1)
                        .gradientStyle("from-amber-600 to-amber-800")
                        .pointsRequired(50)
                        .build(),

                Badge.builder()
                        .name("Soil Testing Master")
                        .hindiName("मृदा परीक्षण विशेषज्ञ")
                        .description("Record soil pH and NPK nutrient values for your farm profile.")
                        .hindiDescription("अपने खेत का pH मान और NPK अनुपात (नाइट्रोजन, फास्फोरस, पोटाश) प्रोफाइल में दर्ज करें।")
                        .badgeType("SOIL")
                        .category("SOIL")
                        .rarity("SILVER")
                        .criteriaType("SOIL_RECORD")
                        .thresholdValue(1)
                        .gradientStyle("from-emerald-600 to-teal-800")
                        .pointsRequired(100)
                        .build(),

                Badge.builder()
                        .name("Green Landowner")
                        .hindiName("हरित भूमिपति")
                        .description("Register and manage at least 2 agricultural farm lands.")
                        .hindiDescription("कम से कम 2 कृषि योग्य भूमि या फार्म रजिस्टर्ड करें।")
                        .badgeType("FARM")
                        .category("FARM")
                        .rarity("GOLD")
                        .criteriaType("FARM_COUNT")
                        .thresholdValue(2)
                        .gradientStyle("from-green-600 to-emerald-900")
                        .pointsRequired(150)
                        .build(),

                Badge.builder()
                        .name("Crop Yield Champion")
                        .hindiName("फसल सम्राट")
                        .description("Achieve over 200 reputation points by practicing organic & smart farming.")
                        .hindiDescription("200 से अधिक प्रतिष्ठा अंक हासिल करें और जैविक खेती का अभ्यास करें।")
                        .badgeType("CROP")
                        .category("CROP")
                        .rarity("GOLD")
                        .criteriaType("REPUTATION_THRESHOLD")
                        .thresholdValue(200)
                        .gradientStyle("from-yellow-500 to-amber-700")
                        .pointsRequired(200)
                        .build(),

                Badge.builder()
                        .name("Equipment Host")
                        .hindiName("कृषि यंत्र प्रदाता")
                        .description("List your tractor or agricultural equipment for leasing.")
                        .hindiDescription("किसानों की सहायता के लिए अपने कृषि उपकरण लीज पर सूचीबद्ध करें।")
                        .badgeType("EQUIPMENT")
                        .category("EQUIPMENT")
                        .rarity("PLATINUM")
                        .criteriaType("EQUIPMENT_LEASE")
                        .thresholdValue(1)
                        .gradientStyle("from-cyan-600 to-blue-800")
                        .pointsRequired(250)
                        .build(),

                Badge.builder()
                        .name("Community Hero")
                        .hindiName("जन कल्याण नायक")
                        .description("Help fellow farmers in community forums and earn recognition.")
                        .hindiDescription("कृषि समुदाय पर साथी किसानों की सहायता करें तथा ज्ञान साझा करें।")
                        .badgeType("COMMUNITY")
                        .category("COMMUNITY")
                        .rarity("PLATINUM")
                        .criteriaType("REPUTATION_THRESHOLD")
                        .thresholdValue(300)
                        .gradientStyle("from-purple-600 to-indigo-900")
                        .pointsRequired(300)
                        .build(),

                Badge.builder()
                        .name("Harvest Legend")
                        .hindiName("अन्नदाता महानायक")
                        .description("Earn 500+ reputation points to become a top legendary digital farmer in India.")
                        .hindiDescription("500 से अधिक प्रतिष्ठा अंक प्राप्त करके भारत के शीर्ष डिजिटल किसान बनें।")
                        .badgeType("SPECIAL")
                        .category("SPECIAL")
                        .rarity("LEGENDARY")
                        .criteriaType("REPUTATION_THRESHOLD")
                        .thresholdValue(500)
                        .gradientStyle("from-rose-600 via-purple-600 to-amber-500")
                        .pointsRequired(500)
                        .build()
        );

        badgeRepository.saveAll(defaultBadges);
        log.info("Successfully seeded {} badges into database.", defaultBadges.size());
    }
}
