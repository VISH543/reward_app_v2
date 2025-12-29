package com.cesportal.repository;

import com.cesportal.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Page<Customer> findBySoftDeletedFalse(Pageable pageable);

    @Query("SELECT c FROM Customer c LEFT JOIN c.creditCards card " +
            "WHERE c.softDeleted = false AND " +
            "(LOWER(c.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "card.cardNumber LIKE CONCAT('%', :query, '%'))")
    Page<Customer> searchCustomers(@Param("query") String query, Pageable pageable);
}
