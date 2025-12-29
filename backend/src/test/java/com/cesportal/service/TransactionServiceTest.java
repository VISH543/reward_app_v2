package com.cesportal.service;

import com.cesportal.entity.CreditCard;
import com.cesportal.entity.Customer;
import com.cesportal.entity.RewardPoint;
import com.cesportal.entity.Transaction;
import com.cesportal.repository.CreditCardRepository;
import com.cesportal.repository.RewardPointRepository;
import com.cesportal.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private CreditCardRepository creditCardRepository;

    @Mock
    private RewardPointRepository rewardPointRepository;

    @InjectMocks
    private TransactionService transactionService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGenerateTransactions() {
        Long cardId = 1L;
        CreditCard card = new CreditCard();
        card.setId(cardId);

        when(creditCardRepository.findById(cardId)).thenReturn(Optional.of(card));
        when(transactionRepository.saveAll(any())).thenAnswer(i -> i.getArguments()[0]);

        List<Transaction> result = transactionService.generateTransactions(cardId);

        assertEquals(50, result.size());
        assertEquals(card, result.get(0).getCreditCard());
        verify(transactionRepository).saveAll(any());
    }

    @Test
    void testProcessRewards_RegularCustomer() {
        Long customerId = 1L;
        Customer customer = new Customer();
        customer.setId(customerId);
        customer.setJoinDate(java.time.LocalDate.now()); // REGULAR

        CreditCard card = new CreditCard();
        card.setId(1L);
        card.setCustomer(customer);

        Transaction t1 = new Transaction();
        t1.setAmount(100.0);
        t1.setCreditCard(card);
        t1.setProcessed(false);

        when(transactionRepository.findByCreditCardCustomerIdAndProcessedFalse(customerId))
                .thenReturn(Collections.singletonList(t1));

        RewardPoint points = new RewardPoint();
        points.setPoints(0L);
        points.setCreditCard(card);
        when(rewardPointRepository.findByCreditCardId(card.getId())).thenReturn(Optional.of(points));

        transactionService.processRewards(customerId);

        // 100 * 0.05 = 5 points
        assertEquals(5L, points.getPoints());
        assertTrue(t1.isProcessed());
        verify(rewardPointRepository).save(points);
        verify(transactionRepository).saveAll(any());
    }

    @Test
    void testProcessRewards_PremiumCustomer() {
        Long customerId = 1L;
        Customer customer = new Customer();
        customer.setId(customerId);
        customer.setJoinDate(java.time.LocalDate.now().minusYears(5)); // PREMIUM

        CreditCard card = new CreditCard();
        card.setId(1L);
        card.setCustomer(customer);

        Transaction t1 = new Transaction();
        t1.setAmount(100.0);
        t1.setCreditCard(card);
        t1.setProcessed(false);

        when(transactionRepository.findByCreditCardCustomerIdAndProcessedFalse(customerId))
                .thenReturn(Collections.singletonList(t1));

        RewardPoint points = new RewardPoint();
        points.setPoints(0L);
        points.setCreditCard(card);
        when(rewardPointRepository.findByCreditCardId(card.getId())).thenReturn(Optional.of(points));

        transactionService.processRewards(customerId);

        // 100 * 0.10 = 10 points
        assertEquals(10L, points.getPoints());
        assertTrue(t1.isProcessed());
    }
}
