package com.farmsetu.config;

import com.farmsetu.model.entity.Commodity;
import com.farmsetu.model.entity.DailyPrice;
import com.farmsetu.model.entity.Mandi;
import com.farmsetu.repository.CommodityRepository;
import com.farmsetu.repository.DailyPriceRepository;
import com.farmsetu.repository.MandiRepository;
import com.farmsetu.repository.UserWatchlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(10)
public class MandiBhaavSeeder implements CommandLineRunner {

    private final MandiRepository mandiRepository;
    private final CommodityRepository commodityRepository;
    private final DailyPriceRepository dailyPriceRepository;
    private final UserWatchlistRepository userWatchlistRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Wiping and re-seeding Mandi Bhaav data to include NCR coordinates...");
        userWatchlistRepository.deleteAll();
        dailyPriceRepository.deleteAll();
        mandiRepository.deleteAll();
        commodityRepository.deleteAll();

        // 1. Seed Mandis
        List<Mandi> mandis = new ArrayList<>();
        
        // MP Mandis
        mandis.add(Mandi.builder().name("Indore Mandi").state("Madhya Pradesh").district("Indore").latitude(22.7196).longitude(75.8577).address("Indore APMC Yard, Laxmi Bai Nagar").operatingHours("09:00 AM - 05:00 PM").build());
        mandis.add(Mandi.builder().name("Bhopal Mandi").state("Madhya Pradesh").district("Bhopal").latitude(23.2599).longitude(77.4126).address("Bhopal APMC Yard, Karond").operatingHours("09:00 AM - 05:00 PM").build());
        mandis.add(Mandi.builder().name("Dewas Mandi").state("Madhya Pradesh").district("Dewas").latitude(22.9623).longitude(76.0508).address("Dewas APMC Yard, Dewas Road").operatingHours("09:00 AM - 05:00 PM").build());
        mandis.add(Mandi.builder().name("Ujjain Mandi").state("Madhya Pradesh").district("Ujjain").latitude(23.1760).longitude(75.7885).address("Ujjain APMC Yard, Chimanganj").operatingHours("09:00 AM - 05:00 PM").build());
        mandis.add(Mandi.builder().name("Dhar Mandi").state("Madhya Pradesh").district("Dhar").latitude(22.5986).longitude(75.3033).address("Dhar APMC Yard, Dhar Road").operatingHours("09:00 AM - 05:00 PM").build());

        // Delhi-NCR Mandis
        mandis.add(Mandi.builder().name("Azadpur Mandi").state("Delhi").district("North Delhi").latitude(28.7161).longitude(77.1706).address("Azadpur APMC Fruit & Vegetable Market").operatingHours("06:00 AM - 08:00 PM").contactPhone("011-27671122").build());
        mandis.add(Mandi.builder().name("Ghazipur Mandi").state("Delhi").district("East Delhi").latitude(28.6253).longitude(77.3274).address("Ghazipur Fish & Poultry Market, Ghazipur").operatingHours("05:00 AM - 07:00 PM").contactPhone("011-22625544").build());
        mandis.add(Mandi.builder().name("Okhla Mandi").state("Delhi").district("South Delhi").latitude(28.5529).longitude(77.2660).address("Okhla APMC Sub Yard, Okhla Phase 1").operatingHours("06:00 AM - 06:00 PM").contactPhone("011-26814433").build());
        mandis.add(Mandi.builder().name("Keshopur Mandi").state("Delhi").district("West Delhi").latitude(28.6382).longitude(77.0863).address("Keshopur APMC Vegetable Market, Vikas Puri").operatingHours("06:00 AM - 05:00 PM").contactPhone("011-28532211").build());
        mandis.add(Mandi.builder().name("Gurgaon Mandi").state("Haryana").district("Gurgaon").latitude(28.4595).longitude(77.0266).address("Gurgaon Grain Market, Sector 12").operatingHours("08:00 AM - 06:00 PM").contactPhone("0124-2321144").build());
        mandis.add(Mandi.builder().name("Noida Phase 2 Mandi").state("Uttar Pradesh").district("Gautam Buddha Nagar").latitude(28.5168).longitude(77.3828).address("Noida Grain Market, Phase 2").operatingHours("08:00 AM - 05:00 PM").contactPhone("0120-2460011").build());
        mandis.add(Mandi.builder().name("Sahibabad Mandi").state("Uttar Pradesh").district("Ghaziabad").latitude(28.6738).longitude(77.3493).address("Sahibabad Fruit & Vegetable Market, Sahibabad").operatingHours("07:00 AM - 06:00 PM").contactPhone("0120-2621133").build());
        mandis.add(Mandi.builder().name("Faridabad Mandi").state("Haryana").district("Faridabad").latitude(28.3958).longitude(77.3137).address("Faridabad Grain Market, NIT").operatingHours("08:00 AM - 06:00 PM").contactPhone("0129-2231144").build());
        mandis.add(Mandi.builder().name("Sonipat Mandi").state("Haryana").district("Sonipat").latitude(28.9948).longitude(77.0194).address("Sonipat APMC Yard, Sonipat Road").operatingHours("08:00 AM - 05:00 PM").contactPhone("0130-2221144").build());
        mandis.add(Mandi.builder().name("Baghpat Mandi").state("Uttar Pradesh").district("Baghpat").latitude(28.9405).longitude(77.2274).address("Baghpat APMC Yard, Baghpat Road").operatingHours("08:30 AM - 05:30 PM").contactPhone("0121-2241144").build());
        mandis.add(Mandi.builder().name("Rohtak APMC").state("Haryana").district("Rohtak").latitude(28.8955).longitude(76.6066).address("Rohtak Grain Market, Delhi Road").operatingHours("08:00 AM - 05:00 PM").contactPhone("01262-252114").build());
        mandis.add(Mandi.builder().name("Meerut APMC").state("Uttar Pradesh").district("Meerut").latitude(28.9845).longitude(77.7064).address("Meerut Grain Market, Garh Road").operatingHours("08:00 AM - 06:00 PM").contactPhone("0121-2641144").build());
        mandis.add(Mandi.builder().name("Hapur Mandi").state("Uttar Pradesh").district("Hapur").latitude(28.7306).longitude(77.7772).address("Hapur Grain Market, Hapur Road").operatingHours("08:30 AM - 05:30 PM").contactPhone("0122-2311144").build());
        mandis.add(Mandi.builder().name("Palwal Mandi").state("Haryana").district("Palwal").latitude(28.1437).longitude(77.3268).address("Palwal Grain Market, Palwal").operatingHours("08:00 AM - 05:00 PM").contactPhone("01275-251144").build());
        mandis.add(Mandi.builder().name("Rewari Mandi").state("Haryana").district("Rewari").latitude(28.1835).longitude(76.6139).address("Rewari APMC Yard, Rewari Road").operatingHours("08:30 AM - 05:30 PM").contactPhone("01274-221144").build());
        mandis.add(Mandi.builder().name("Bahadurgarh Mandi").state("Haryana").district("Jhajjar").latitude(28.6924).longitude(76.9240).address("Bahadurgarh APMC, Rohtak Road").operatingHours("08:00 AM - 05:00 PM").contactPhone("01276-231144").build());
        mandis.add(Mandi.builder().name("Narela Mandi").state("Delhi").district("North West Delhi").latitude(28.8526).longitude(77.0963).address("Narela APMC Sub Yard, Narela").operatingHours("07:00 AM - 07:00 PM").contactPhone("011-27281144").build());
        mandis.add(Mandi.builder().name("Najafgarh Mandi").state("Delhi").district("South West Delhi").latitude(28.6090).longitude(76.9855).address("Najafgarh APMC Sub Yard, Najafgarh").operatingHours("07:30 AM - 06:00 PM").contactPhone("011-25011144").build());
        mandis.add(Mandi.builder().name("Ballabhgarh Mandi").state("Haryana").district("Faridabad").latitude(28.3392).longitude(77.3275).address("Ballabhgarh Grain Market, Faridabad").operatingHours("08:00 AM - 06:00 PM").contactPhone("0129-2241144").build());
        mandis.add(Mandi.builder().name("Greater Noida Mandi").state("Uttar Pradesh").district("Gautam Buddha Nagar").latitude(28.4744).longitude(77.5040).address("Greater Noida Grain Market, G. Noida").operatingHours("08:30 AM - 05:30 PM").contactPhone("0120-2341144").build());

        // Rajasthan Mandis
        mandis.add(Mandi.builder().name("Jaipur Mandi (Muhana)").state("Rajasthan").district("Jaipur").latitude(26.8024).longitude(75.8353).address("Muhana APMC Fruit & Vegetable Market, Jaipur").operatingHours("06:00 AM - 06:00 PM").contactPhone("0141-2551122").build());
        mandis.add(Mandi.builder().name("Jaipur Chomu Mandi").state("Rajasthan").district("Jaipur").latitude(27.1662).longitude(75.7227).address("Chomu APMC Grain Market, Chomu").operatingHours("08:00 AM - 05:00 PM").contactPhone("01423-221144").build());
        mandis.add(Mandi.builder().name("Ajmer Mandi").state("Rajasthan").district("Ajmer").latitude(26.4499).longitude(74.6399).address("Ajmer APMC Yard, Madar Gate").operatingHours("08:00 AM - 05:00 PM").contactPhone("0145-2621133").build());
        mandis.add(Mandi.builder().name("Alwar Mandi").state("Rajasthan").district("Alwar").latitude(27.5530).longitude(76.6346).address("Alwar APMC Grain Market, Alwar").operatingHours("08:30 AM - 05:30 PM").contactPhone("0144-2301144").build());
        mandis.add(Mandi.builder().name("Tonk Mandi").state("Rajasthan").district("Tonk").latitude(26.1665).longitude(75.7885).address("Tonk APMC Grain Market, Tonk").operatingHours("09:00 AM - 05:00 PM").contactPhone("01432-241144").build());
        mandis.add(Mandi.builder().name("Dausa Mandi").state("Rajasthan").district("Dausa").latitude(26.8842).longitude(76.3326).address("Dausa APMC Market Yard, Dausa").operatingHours("08:00 AM - 05:00 PM").contactPhone("01427-221144").build());
        mandis.add(Mandi.builder().name("Sikar Mandi").state("Rajasthan").district("Sikar").latitude(27.6094).longitude(75.1399).address("Sikar APMC Grain Market, Sikar").operatingHours("08:00 AM - 05:00 PM").contactPhone("01572-271144").build());
        mandis.add(Mandi.builder().name("Kota Mandi").state("Rajasthan").district("Kota").latitude(25.2138).longitude(75.8648).address("Kota APMC Market Yard, Kota").operatingHours("08:00 AM - 05:00 PM").contactPhone("0744-2451144").build());
        mandis.add(Mandi.builder().name("Jodhpur Mandi").state("Rajasthan").district("Jodhpur").latitude(26.2389).longitude(73.0243).address("Jodhpur APMC Market Yard, Ratanada").operatingHours("08:00 AM - 06:00 PM").contactPhone("0291-2611144").build());
        mandis.add(Mandi.builder().name("Bharatpur Mandi").state("Rajasthan").district("Bharatpur").latitude(27.2152).longitude(77.5030).address("Bharatpur APMC Yard, Bharatpur").operatingHours("08:30 AM - 05:30 PM").contactPhone("05644-221144").build());

        mandis = mandiRepository.saveAll(mandis);

        // 2. Seed Commodities
        List<Commodity> commodities = new ArrayList<>();
        commodities.add(Commodity.builder().name("Wheat").category("Grains").localName("गेहूं").build());
        commodities.add(Commodity.builder().name("Paddy (Rice)").category("Grains").localName("धान").build());
        commodities.add(Commodity.builder().name("Soybean").category("Oilseeds").localName("सोयाबीन").build());
        commodities.add(Commodity.builder().name("Onion").category("Vegetables").localName("प्याज").build());
        commodities.add(Commodity.builder().name("Potato").category("Vegetables").localName("आलू").build());
        commodities.add(Commodity.builder().name("Tomato").category("Vegetables").localName("टमाटर").build());
        commodities = commodityRepository.saveAll(commodities);

        // 3. Seed Daily Prices (past 30 days)
        Random rand = new Random(42);
        LocalDate today = LocalDate.now();
        List<DailyPrice> pricesToSave = new ArrayList<>();

        double[] basePrices = { 2300.0, 2100.0, 4800.0, 1800.0, 1400.0, 2200.0 };

        for (int day = 30; day >= 0; day--) {
            LocalDate date = today.minusDays(day);

            for (int cIdx = 0; cIdx < commodities.size(); cIdx++) {
                Commodity commodity = commodities.get(cIdx);
                double basePrice = basePrices[cIdx];

                for (int mIdx = 0; mIdx < mandis.size(); mIdx++) {
                    Mandi mandi = mandis.get(mIdx);

                    double mandiModifier = 1.0 + (mIdx - 12) * 0.01; // slight variance
                    double dailyFluctuation = 1.0 + (rand.nextDouble() - 0.5) * 0.04 + (Math.sin(day * 0.25) * 0.02);
                    
                    double modal = basePrice * mandiModifier * dailyFluctuation;
                    double min = modal * 0.93;
                    double max = modal * 1.07;
                    double arrival = 150.0 + rand.nextDouble() * 850.0;

                    DailyPrice dp = DailyPrice.builder()
                            .mandi(mandi)
                            .commodity(commodity)
                            .minPrice(BigDecimal.valueOf(min).setScale(2, RoundingMode.HALF_UP))
                            .maxPrice(BigDecimal.valueOf(max).setScale(2, RoundingMode.HALF_UP))
                            .modalPrice(BigDecimal.valueOf(modal).setScale(2, RoundingMode.HALF_UP))
                            .arrivalVolume(BigDecimal.valueOf(arrival).setScale(2, RoundingMode.HALF_UP))
                            .priceDate(date)
                            .build();

                    pricesToSave.add(dp);
                }
            }
        }

        dailyPriceRepository.saveAll(pricesToSave);
        log.info("Successfully re-seeded {} Mandis, {} Commodities and {} DailyPrice records", mandis.size(), commodities.size(), pricesToSave.size());
    }
}
