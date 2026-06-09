package com.farmsetu.repository;

import com.farmsetu.model.entity.DailyPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface DailyPriceRepository extends JpaRepository<DailyPrice, Long> {

    List<DailyPrice> findByCommodityIdAndPriceDateBetweenOrderByPriceDateAsc(Long commodityId, LocalDate start, LocalDate end);

    @Query("SELECT dp FROM DailyPrice dp WHERE dp.mandi.id IN :mandiIds AND dp.priceDate = (SELECT MAX(dp2.priceDate) FROM DailyPrice dp2 WHERE dp2.mandi.id = dp.mandi.id AND dp2.commodity.id = dp.commodity.id)")
    List<DailyPrice> findLatestPricesForMandis(@Param("mandiIds") List<Long> mandiIds);

    @Query("SELECT dp FROM DailyPrice dp WHERE dp.commodity.id = :commodityId AND dp.mandi.id IN :mandiIds AND dp.priceDate = (SELECT MAX(dp2.priceDate) FROM DailyPrice dp2 WHERE dp2.mandi.id = dp.mandi.id AND dp2.commodity.id = :commodityId)")
    List<DailyPrice> findLatestPricesForCommodityInMandis(@Param("commodityId") Long commodityId, @Param("mandiIds") List<Long> mandiIds);

    List<DailyPrice> findByCommodityIdOrderByPriceDateDesc(Long commodityId);
}
