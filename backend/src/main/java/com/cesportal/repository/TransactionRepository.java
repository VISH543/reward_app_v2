package com.cesportal.repository;

import com.cesportal.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByCreditCardId(Long creditCardId);

    List<Transaction> findByCreditCardCustomerIdAndProcessedFalse(Long customerId);
}
