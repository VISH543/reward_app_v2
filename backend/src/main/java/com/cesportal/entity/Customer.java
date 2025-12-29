package com.cesportal.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "creditCards")
@EqualsAndHashCode(exclude = "creditCards")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;

    @Column(unique = true)
    private String email;

    private String phoneNumber;
    private LocalDate joinDate;

    private boolean softDeleted = false;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<CreditCard> creditCards;

    public Type getCustomerType() {
        if (joinDate == null)
            return Type.REGULAR;
        return Period.between(joinDate, LocalDate.now()).getYears() >= 3 ? Type.PREMIUM : Type.REGULAR;
    }

    public enum Type {
        REGULAR,
        PREMIUM
    }
}
