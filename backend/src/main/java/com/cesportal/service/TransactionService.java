package com.cesportal.service;

import com.cesportal.entity.CreditCard;
import com.cesportal.entity.Customer;
import com.cesportal.entity.RewardPoint;
import com.cesportal.entity.Transaction;
import com.cesportal.repository.CreditCardRepository;
import com.cesportal.repository.RewardPointRepository;
import com.cesportal.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class TransactionService {
    @Autowired
    TransactionRepository transactionRepository;

    @Autowired
    CreditCardRepository creditCardRepository;

    @Autowired
    RewardPointRepository rewardPointRepository;

    private final Random random = new Random();

    @Transactional
    public List<Transaction> generateTransactions(Long cardId) {
        CreditCard card = creditCardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));

        List<Transaction> transactions = new ArrayList<>();
        String[] merchants = { "Amazon", "Flipkart", "Uber", "Swiggy", "Zomato", "Netflix", "Starbucks", "Apple" };

        for (int i = 0; i < 50; i++) {
            Transaction t = new Transaction();
            t.setCreditCard(card);
            t.setAmount(500 + (50000 - 500) * random.nextDouble());
            t.setTransactionDate(LocalDateTime.now().minusDays(random.nextInt(30)));
            t.setMerchant(merchants[random.nextInt(merchants.length)]);
            t.setProcessed(false);
            transactions.add(t);
        }

        return transactionRepository.saveAll(transactions);
    }

    @Transactional
    public void processRewards(Long customerId) {
        List<Transaction> unprocessed = transactionRepository.findByCreditCardCustomerIdAndProcessedFalse(customerId);
        if (unprocessed.isEmpty())
            return;

        Customer customer = unprocessed.get(0).getCreditCard().getCustomer();
        Customer.Type type = customer.getCustomerType();
        double multiplier = (type == Customer.Type.PREMIUM) ? 0.10 : 0.05;

        // Group by card to update points per card
        java.util.Map<CreditCard, Long> pointsPerCard = new java.util.HashMap<>();
        for (Transaction t : unprocessed) {
            long p = (long) (t.getAmount() * multiplier);
            t.setProcessed(true);
            pointsPerCard.put(t.getCreditCard(), pointsPerCard.getOrDefault(t.getCreditCard(), 0L) + p);
        }

        for (java.util.Map.Entry<CreditCard, Long> entry : pointsPerCard.entrySet()) {
            CreditCard card = entry.getKey();
            Long pointsToAdd = entry.getValue();

            RewardPoint pointsEntity = rewardPointRepository.findByCreditCardId(card.getId())
                    .orElseGet(() -> {
                        RewardPoint p = new RewardPoint();
                        p.setCreditCard(card);
                        return p;
                    });

            pointsEntity.setPoints(pointsEntity.getPoints() + pointsToAdd);
            rewardPointRepository.save(pointsEntity);
        }
        transactionRepository.saveAll(unprocessed);
    }
}
