package com.cesportal;

import com.cesportal.entity.RewardCategory;
import com.cesportal.entity.RewardItem;
import com.cesportal.entity.User;
import com.cesportal.repository.RewardCategoryRepository;
import com.cesportal.repository.RewardItemRepository;
import com.cesportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    UserRepository userRepository;

    @Autowired
    RewardCategoryRepository categoryRepository;

    @Autowired
    RewardItemRepository itemRepository;

    @Autowired
    com.cesportal.repository.CustomerRepository customerRepository;

    @Autowired
    com.cesportal.repository.CreditCardRepository cardRepository;

    @Autowired
    com.cesportal.repository.RedemptionHistoryRepository historyRepository;

    @Autowired
    PasswordEncoder encoder;

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(DataInitializer.class);

    @Override
    public void run(String... args) throws Exception {
        logger.info("========== DIAGNOSTIC STARTUP CHECK ==========");
        logger.info("Total Customers in DB: {}", customerRepository.count());
        logger.info("Total Credit Cards in DB: {}", cardRepository.count());
        logger.info("Total Redemptions in DB: {}", historyRepository.count());
        logger.info("==============================================");

        // Initialize Default Admin
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(encoder.encode("admin123"));
            admin.setRole(User.Role.ADMIN_CES);
            userRepository.save(admin);
        }

        // Initialize CES User
        if (userRepository.findByUsername("cesuser").isEmpty()) {
            User cesUser = new User();
            cesUser.setUsername("cesuser");
            cesUser.setPassword(encoder.encode("ces123"));
            cesUser.setRole(User.Role.CES_USER);
            userRepository.save(cesUser);
        }

        // Initialize Reward Catalog
        if (categoryRepository.count() == 0) {
            seedRewards();
        }
    }

    private void seedRewards() {
        RewardCategory giftCards = categoryRepository.save(new RewardCategory(null, "Gift Cards", null));
        itemRepository.saveAll(Arrays.asList(
                new RewardItem(null, "Google Play Gift Card", 5000L, giftCards),
                new RewardItem(null, "Apple Gift Card", 6000L, giftCards),
                new RewardItem(null, "Amazon Gift Card", 4500L, giftCards),
                new RewardItem(null, "Flipkart Gift Card", 4500L, giftCards),
                new RewardItem(null, "Swiggy Gift Card", 3500L, giftCards),
                new RewardItem(null, "Zomato Gift Card", 3500L, giftCards)));

        RewardCategory travel = categoryRepository.save(new RewardCategory(null, "Travel & Holidays", null));
        itemRepository.saveAll(Arrays.asList(
                new RewardItem(null, "Trip to Manali", 40000L, travel),
                new RewardItem(null, "Trip to Kanyakumari", 30000L, travel),
                new RewardItem(null, "Goa Beach Holiday", 45000L, travel),
                new RewardItem(null, "Jaipur Heritage Trip", 28000L, travel),
                new RewardItem(null, "Ooty Hill Station Trip", 38000L, travel)));

        RewardCategory shopping = categoryRepository.save(new RewardCategory(null, "Shopping & Electronics", null));
        itemRepository.saveAll(Arrays.asList(
                new RewardItem(null, "Bluetooth Headphones", 12000L, shopping),
                new RewardItem(null, "Smart Watch", 18000L, shopping),
                new RewardItem(null, "Wireless Earbuds", 15000L, shopping),
                new RewardItem(null, "Smartphone Voucher", 22000L, shopping),
                new RewardItem(null, "Laptop Bag", 6000L, shopping)));

        RewardCategory dining = categoryRepository.save(new RewardCategory(null, "Dining & Lifestyle", null));
        itemRepository.saveAll(Arrays.asList(
                new RewardItem(null, "Dinner for Two", 8000L, dining),
                new RewardItem(null, "Café Voucher", 4000L, dining),
                new RewardItem(null, "Movie Tickets", 5000L, dining),
                new RewardItem(null, "Spa Voucher", 10000L, dining)));

        RewardCategory health = categoryRepository.save(new RewardCategory(null, "Health & Fitness", null));
        itemRepository.saveAll(Arrays.asList(
                new RewardItem(null, "Gym Membership (3 months)", 20000L, health),
                new RewardItem(null, "Yoga Classes", 7000L, health),
                new RewardItem(null, "Fitness Band", 9000L, health),
                new RewardItem(null, "Nutrition Consultation", 6000L, health)));

        RewardCategory learning = categoryRepository.save(new RewardCategory(null, "Learning & Subscriptions", null));
        itemRepository.saveAll(Arrays.asList(
                new RewardItem(null, "Online Course Voucher", 10000L, learning),
                new RewardItem(null, "E-Book Subscription", 5000L, learning),
                new RewardItem(null, "Coding Platform Access", 12000L, learning),
                new RewardItem(null, "Music Subscription", 4000L, learning)));
    }
}
