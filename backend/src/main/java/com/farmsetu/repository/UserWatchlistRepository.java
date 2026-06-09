package com.farmsetu.repository;

import com.farmsetu.model.entity.UserWatchlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserWatchlistRepository extends JpaRepository<UserWatchlist, Long> {

    List<UserWatchlist> findByUserId(Long userId);

    Optional<UserWatchlist> findByUserIdAndCommodityIdAndMandiId(Long userId, Long commodityId, Long mandiId);
}
