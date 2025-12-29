package com.cesportal.service;

import com.cesportal.entity.Customer;
import com.cesportal.entity.RedemptionHistory;
import com.cesportal.entity.RewardItem;
import com.cesportal.entity.RewardPoint;
import com.cesportal.repository.CustomerRepository;
import com.cesportal.repository.RedemptionHistoryRepository;
import com.cesportal.repository.RewardItemRepository;
import com.cesportal.repository.RewardPointRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RedemptionService {
    @Autowired
    RewardItemRepository itemRepository;

    @Autowired
    RewardPointRepository pointRepository;

    @Autowired
    RedemptionHistoryRepository historyRepository;

    @Autowired
    CustomerRepository customerRepository;

    @Transactional
    public void redeemItems(Long cardId, List<Long> itemIds) {
        RewardPoint pointsEntity = pointRepository.findByCreditCardId(cardId)
                .orElseThrow(() -> new RuntimeException("Reward points not found for this card"));

        Customer customer = pointsEntity.getCreditCard().getCustomer();

        List<RewardItem> items = itemRepository.findAllById(itemIds);
        long totalCost = items.stream().mapToLong(RewardItem::getPointCost).sum();

        if (pointsEntity.getPoints() < totalCost) {
            throw new com.cesportal.exception.InsufficientPointsException(
                    "Insufficient reward points. Current: " + pointsEntity.getPoints() + ", Required: " + totalCost);
        }

        pointsEntity.setPoints(pointsEntity.getPoints() - totalCost);
        pointRepository.save(pointsEntity);

        for (RewardItem item : items) {
            RedemptionHistory history = new RedemptionHistory();
            history.setCustomer(customer);
            history.setCreditCard(pointsEntity.getCreditCard());
            history.setRewardItem(item);
            history.setPointsSpent(item.getPointCost());
            history.setRedemptionDate(LocalDateTime.now());
            historyRepository.save(history);
        }
    }
}
