package com.cesportal.repository;

import com.cesportal.entity.RewardItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RewardItemRepository extends JpaRepository<RewardItem, Long> {
    List<RewardItem> findByCategoryId(Long categoryId);
}
