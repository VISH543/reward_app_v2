package com.cesportal.service;

import com.cesportal.entity.CreditCard;
import com.cesportal.entity.Customer;
import com.cesportal.entity.RewardItem;
import com.cesportal.entity.RewardPoint;
import com.cesportal.exception.InsufficientPointsException;
import com.cesportal.repository.CustomerRepository;
import com.cesportal.repository.RedemptionHistoryRepository;
import com.cesportal.repository.RewardItemRepository;
import com.cesportal.repository.RewardPointRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RedemptionServiceTest {

    @Mock
    private RewardItemRepository itemRepository;

    @Mock
    private RewardPointRepository pointRepository;

    @Mock
    private RedemptionHistoryRepository historyRepository;

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private RedemptionService redemptionService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRedeemItems_Success() {
        Long cardId = 1L;
        Customer customer = new Customer();
        customer.setId(1L);

        CreditCard card = new CreditCard();
        card.setId(cardId);
        card.setCustomer(customer);

        RewardPoint points = new RewardPoint();
        points.setPoints(100L);
        points.setCreditCard(card);

        RewardItem item = new RewardItem();
        item.setId(1L);
        item.setPointCost(50L);

        when(pointRepository.findByCreditCardId(cardId)).thenReturn(Optional.of(points));
        when(itemRepository.findAllById(any())).thenReturn(Collections.singletonList(item));

        redemptionService.redeemItems(cardId, Collections.singletonList(1L));

        assertEquals(50L, points.getPoints());
        verify(pointRepository).save(points);
        verify(historyRepository).save(any());
    }

    @Test
    void testRedeemItems_InsufficientPoints() {
        Long cardId = 1L;
        Customer customer = new Customer();
        customer.setId(1L);

        CreditCard card = new CreditCard();
        card.setId(cardId);
        card.setCustomer(customer);

        RewardPoint points = new RewardPoint();
        points.setPoints(30L);
        points.setCreditCard(card);

        RewardItem item = new RewardItem();
        item.setId(1L);
        item.setPointCost(50L);

        when(pointRepository.findByCreditCardId(cardId)).thenReturn(Optional.of(points));
        when(itemRepository.findAllById(any())).thenReturn(Collections.singletonList(item));

        assertThrows(InsufficientPointsException.class, () -> {
            redemptionService.redeemItems(cardId, Collections.singletonList(1L));
        });

        assertEquals(30L, points.getPoints()); // Should not have changed
        verify(pointRepository, never()).save(any());
    }
}
