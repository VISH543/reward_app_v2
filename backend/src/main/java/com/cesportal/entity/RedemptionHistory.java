package com.cesportal.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "redemption_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = { "customer", "rewardItem", "creditCard" })
@EqualsAndHashCode(exclude = { "customer", "rewardItem", "creditCard" })
public class RedemptionHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id")
    @JsonIgnoreProperties({ "creditCards", "hibernateLazyInitializer", "handler" })
    private Customer customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reward_item_id")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private RewardItem rewardItem;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "card_id")
    @JsonIgnoreProperties({ "customer", "transactions", "rewardPoints", "hibernateLazyInitializer", "handler" })
    private CreditCard creditCard;

    private Long pointsSpent;
    private LocalDateTime redemptionDate;
}
