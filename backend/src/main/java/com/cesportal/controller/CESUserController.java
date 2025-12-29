package com.cesportal.controller;

import com.cesportal.entity.*;
import com.cesportal.repository.CreditCardRepository;
import com.cesportal.repository.RewardCategoryRepository;
import com.cesportal.repository.RewardItemRepository;
import com.cesportal.repository.TransactionRepository;
import com.cesportal.service.CustomerService;
import com.cesportal.service.RedemptionService;
import com.cesportal.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@RestController
@RequestMapping("/api/ces")
public class CESUserController {
    private static final Logger logger = LoggerFactory.getLogger(CESUserController.class);
    @Autowired
    CustomerService customerService;

    @Autowired
    TransactionService transactionService;

    @Autowired
    RedemptionService redemptionService;

    @Autowired
    CreditCardRepository cardRepository;

    @Autowired
    TransactionRepository transactionRepository;

    @Autowired
    RewardCategoryRepository categoryRepository;

    @Autowired
    RewardItemRepository itemRepository;

    @Autowired
    com.cesportal.repository.RewardPointRepository rewardPointRepository;

    // Customer Management
    @GetMapping("/customers")
    public Page<Customer> getCustomers(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        Pageable pageable = PageRequest.of(page, size);
        if (search != null && !search.isEmpty()) {
            return customerService.searchCustomers(search, pageable);
        }
        return customerService.getAllCustomers(pageable);
    }

    @PostMapping("/customers")
    public Customer createCustomer(@RequestBody Customer customer) {
        logger.info("Creating customer: {} {}", customer.getFirstName(), customer.getLastName());
        return customerService.createCustomer(customer);
    }

    @DeleteMapping("/customers/{id}")
    public ResponseEntity<?> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/customers/{id}")
    public ResponseEntity<Customer> getCustomer(@PathVariable Long id) {
        return customerService.getCustomerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Credit Card Management
    @PostMapping("/customers/{id}/cards")
    public CreditCard addCard(@PathVariable Long id, @RequestBody CreditCard card) {
        logger.info("Adding credit card for customer ID: {}", id);
        Customer customer = customerService.getCustomerById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        card.setCustomer(customer);
        CreditCard savedCard = cardRepository.save(card);

        // Allot initial 50,000 points per user requirement
        RewardPoint points = new RewardPoint();
        points.setCreditCard(savedCard);
        points.setPoints(50000L);
        rewardPointRepository.save(points);

        savedCard.setRewardPoints(points);
        return savedCard;
    }

    @GetMapping("/customers/{id}/cards")
    public List<CreditCard> getCards(@PathVariable Long id) {
        List<CreditCard> cards = cardRepository.findByCustomerId(id);
        for (CreditCard card : cards) {
            if (card.getRewardPoints() == null) {
                RewardPoint points = new RewardPoint();
                points.setCreditCard(card);
                points.setPoints(50000L); // Default for legacy/missing
                rewardPointRepository.save(points);
                card.setRewardPoints(points);
            }
        }
        return cards;
    }

    // Transaction Management
    @PostMapping("/cards/{cardId}/transactions/generate")
    public List<Transaction> generateTransactions(@PathVariable Long cardId) {
        return transactionService.generateTransactions(cardId);
    }

    @GetMapping("/cards/{cardId}/transactions")
    public List<Transaction> getTransactions(@PathVariable Long cardId) {
        return transactionRepository.findByCreditCardId(cardId);
    }

    // Reward Processing
    @PostMapping("/customers/{id}/process-rewards")
    public ResponseEntity<?> processRewards(@PathVariable Long id) {
        transactionService.processRewards(id);
        return ResponseEntity.ok().build();
    }

    // Reward Catalog
    @GetMapping("/rewards/categories")
    public List<RewardCategory> getCategories() {
        return categoryRepository.findAll();
    }

    @GetMapping("/rewards/items")
    public List<RewardItem> getItems(@RequestParam(required = false) Long categoryId) {
        if (categoryId != null) {
            return itemRepository.findByCategoryId(categoryId);
        }
        return itemRepository.findAll();
    }

    @Autowired
    com.cesportal.repository.RedemptionHistoryRepository historyRepository;

    // Redemption
    @PostMapping("/customers/{id}/redeem")
    public ResponseEntity<?> redeem(@PathVariable Long id, @RequestParam Long cardId, @RequestBody List<Long> itemIds) {
        try {
            redemptionService.redeemItems(cardId, itemIds);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/customers/{id}/redemption-history")
    public List<RedemptionHistory> getHistory(@PathVariable Long id) {
        return historyRepository.findByCustomerIdOrderByRedemptionDateDesc(id);
    }

    @GetMapping("/redemptions")
    public List<RedemptionHistory> getGlobalRedemptions() {
        return historyRepository.findAllByOrderByRedemptionDateDesc();
    }
}
