package com.cesportal.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "reward_points")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "creditCard")
@EqualsAndHashCode(exclude = "creditCard")
public class RewardPoint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long points = 0L;

    @JsonIgnore
    @OneToOne
    @JoinColumn(name = "card_id")
    private CreditCard creditCard;
}
