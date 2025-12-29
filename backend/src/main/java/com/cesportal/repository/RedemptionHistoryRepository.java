package com.cesportal.repository;

import com.cesportal.entity.RedemptionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RedemptionHistoryRepository extends JpaRepository<RedemptionHistory, Long> {
    List<RedemptionHistory> findByCustomerIdOrderByRedemptionDateDesc(Long customerId);

    List<RedemptionHistory> findAllByOrderByRedemptionDateDesc();
}
