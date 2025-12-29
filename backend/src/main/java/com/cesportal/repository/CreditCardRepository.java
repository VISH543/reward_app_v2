package com.cesportal.repository;

import com.cesportal.entity.CreditCard;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CreditCardRepository extends JpaRepository<CreditCard, Long> {
    Optional<CreditCard> findByCardNumber(String cardNumber);

    List<CreditCard> findByCustomerId(Long customerId);
}
