package com.cesportal.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "creditCard")
@EqualsAndHashCode(exclude = "creditCard")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double amount;
    private LocalDateTime transactionDate;
    private String merchant;

    private boolean processed = false;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "credit_card_id")
    private CreditCard creditCard;
}
