package com.cesportal.repository;

import com.cesportal.entity.RewardPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RewardPointRepository extends JpaRepository<RewardPoint, Long> {
    Optional<RewardPoint> findByCreditCardId(Long cardId);
}
