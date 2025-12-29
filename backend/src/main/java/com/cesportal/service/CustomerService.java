package com.cesportal.service;

import com.cesportal.entity.Customer;
import com.cesportal.repository.CustomerRepository;
import com.cesportal.repository.RewardPointRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CustomerService {
    @Autowired
    CustomerRepository customerRepository;

    @Autowired
    RewardPointRepository rewardPointRepository;

    public Page<Customer> getAllCustomers(Pageable pageable) {
        return customerRepository.findBySoftDeletedFalse(pageable);
    }

    public Page<Customer> searchCustomers(String query, Pageable pageable) {
        return customerRepository.searchCustomers(query, pageable);
    }

    @Transactional
    public Customer createCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    public Optional<Customer> getCustomerById(Long id) {
        return customerRepository.findById(id).filter(c -> !c.isSoftDeleted());
    }

    @Transactional
    public void deleteCustomer(Long id) {
        customerRepository.findById(id).ifPresent(customer -> {
            customer.setSoftDeleted(true);
            customerRepository.save(customer);
        });
    }
}
