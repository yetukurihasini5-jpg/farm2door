package com.farm2door.config;

import com.farm2door.entity.*;
import com.farm2door.enums.*;
import com.farm2door.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FarmerProfileRepository farmerProfileRepository;
    private final ConsumerProfileRepository consumerProfileRepository;
    private final AddressRepository addressRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final PaymentRepository paymentRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking Farm2Door initial seed data...");

        if (userRepository.count() > 0) {
            log.info("Users already seeded. Skipping initial data population.");
            return;
        }

        log.info("Seeding initial users, farm profiles, addresses, and catalog...");

        // 1. Admin Account
        User admin = User.builder()
                .email("admin@farm2door.com")
                .password(passwordEncoder.encode("admin123"))
                .fullName("Platform Administrator")
                .phone("+91 98000 00001")
                .role(Role.ROLE_ADMIN)
                .isActive(true)
                .build();
        userRepository.save(admin);

        // 2. Farmer 1 (Raju Patel)
        User farmer1 = User.builder()
                .email("raju.farmer@farm2door.com")
                .password(passwordEncoder.encode("farmer123"))
                .fullName("Raju Patel")
                .phone("+91 98111 22334")
                .role(Role.ROLE_FARMER)
                .isActive(true)
                .build();
        farmer1 = userRepository.save(farmer1);

        FarmerProfile profile1 = FarmerProfile.builder()
                .user(farmer1)
                .farmName("Patel Organic Green Acres")
                .farmLocation("Nashik Valley, Maharashtra")
                .farmSizeAcres(new BigDecimal("15.50"))
                .experienceYears(14)
                .bio("Third-generation organic farmer specializing in residue-free vegetables, grains, and traditional farming techniques.")
                .isVerified(true)
                .build();
        farmerProfileRepository.save(profile1);

        // 3. Farmer 2 (Anita Sharma)
        User farmer2 = User.builder()
                .email("anita.farmer@farm2door.com")
                .password(passwordEncoder.encode("farmer123"))
                .fullName("Anita Sharma")
                .phone("+91 98222 33445")
                .role(Role.ROLE_FARMER)
                .isActive(true)
                .build();
        farmer2 = userRepository.save(farmer2);

        FarmerProfile profile2 = FarmerProfile.builder()
                .user(farmer2)
                .farmName("Himalayan Foothills Orchard")
                .farmLocation("Solan & Shimla Hills, Himachal Pradesh")
                .farmSizeAcres(new BigDecimal("9.20"))
                .experienceYears(9)
                .bio("Cultivating tree-ripened orchard fruits, natural forest honey, and mountain herbs with zero synthetic pesticides.")
                .isVerified(true)
                .build();
        farmerProfileRepository.save(profile2);

        // 4. Consumer 1 (Priya Sundaram)
        User consumer1 = User.builder()
                .email("consumer@farm2door.com")
                .password(passwordEncoder.encode("consumer123"))
                .fullName("Priya Sundaram")
                .phone("+91 98765 43210")
                .role(Role.ROLE_CONSUMER)
                .isActive(true)
                .build();
        consumer1 = userRepository.save(consumer1);

        ConsumerProfile cp1 = ConsumerProfile.builder()
                .user(consumer1)
                .defaultPhone("+91 98765 43210")
                .preferredLanguage("English")
                .build();
        consumerProfileRepository.save(cp1);

        cartRepository.save(Cart.builder().user(consumer1).build());

        Address address1 = Address.builder()
                .user(consumer1)
                .recipientName("Priya Sundaram")
                .phoneNumber("+91 98765 43210")
                .streetAddress("Flat 402, Green Towers, MG Road")
                .city("Pune")
                .state("Maharashtra")
                .postalCode("411001")
                .isDefault(true)
                .build();
        addressRepository.save(address1);

        // 5. Consumer 2 (Rahul Verma)
        User consumer2 = User.builder()
                .email("rahul.consumer@farm2door.com")
                .password(passwordEncoder.encode("consumer123"))
                .fullName("Rahul Verma")
                .phone("+91 98765 12345")
                .role(Role.ROLE_CONSUMER)
                .isActive(true)
                .build();
        consumer2 = userRepository.save(consumer2);

        ConsumerProfile cp2 = ConsumerProfile.builder()
                .user(consumer2)
                .defaultPhone("+91 98765 12345")
                .preferredLanguage("English")
                .build();
        consumerProfileRepository.save(cp2);

        cartRepository.save(Cart.builder().user(consumer2).build());

        Address address2 = Address.builder()
                .user(consumer2)
                .recipientName("Rahul Verma")
                .phoneNumber("+91 98765 12345")
                .streetAddress("House 12, Sunrise Meadows, Indiranagar")
                .city("Bengaluru")
                .state("Karnataka")
                .postalCode("560038")
                .isDefault(true)
                .build();
        addressRepository.save(address2);

        // 6. Categories
        Category catVeg = categoryRepository.findBySlug("vegetables").orElse(null);
        Category catFruit = categoryRepository.findBySlug("fruits").orElse(null);
        Category catGrains = categoryRepository.findBySlug("grains-pulses").orElse(null);
        Category catDairy = categoryRepository.findBySlug("dairy-honey").orElse(null);
        Category catHerbs = categoryRepository.findBySlug("herbs-spices").orElse(null);
        Category catGreens = categoryRepository.findBySlug("organic-greens").orElse(null);

        if (catVeg == null) {
            log.warn("Categories not yet initialized by Flyway. Deferring product seed.");
            return;
        }

        // 7. Seed Agricultural Products
        List<Product> products = new ArrayList<>();

        Product p1 = Product.builder()
                .farmer(farmer1)
                .category(catVeg)
                .title("Crisp Farm Fresh Hybrid Tomatoes")
                .description("Plump, vine-ripened organic tomatoes grown in fertile black soil. Excellent for salads, sauces, and daily cooking.")
                .unit(ProductUnit.KG)
                .pricePerUnit(new BigDecimal("38.00"))
                .stockQuantity(new BigDecimal("75.00"))
                .minOrderQuantity(new BigDecimal("1.00"))
                .imageUrl("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80")
                .status(ProductStatus.ACTIVE)
                .isFeatured(true)
                .ratingAverage(new BigDecimal("4.80"))
                .reviewCount(5)
                .build();
        products.add(p1);

        Product p2 = Product.builder()
                .farmer(farmer1)
                .category(catGreens)
                .title("Organic Hydroponic Baby Spinach")
                .description("Tender pesticide-free baby spinach leaves harvested at dawn. Packed with iron, folate, and rich dietary fiber.")
                .unit(ProductUnit.BUNCH)
                .pricePerUnit(new BigDecimal("25.00"))
                .stockQuantity(new BigDecimal("40.00"))
                .minOrderQuantity(new BigDecimal("1.00"))
                .imageUrl("https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80")
                .status(ProductStatus.ACTIVE)
                .isFeatured(true)
                .ratingAverage(new BigDecimal("4.90"))
                .reviewCount(3)
                .build();
        products.add(p2);

        Product p3 = Product.builder()
                .farmer(farmer1)
                .category(catVeg)
                .title("Sweet Desi Red Carrots")
                .description("Crunchy winter carrots full of natural sweetness, rich beta-carotene, and earthy flavor directly from farm beds.")
                .unit(ProductUnit.KG)
                .pricePerUnit(new BigDecimal("45.00"))
                .stockQuantity(new BigDecimal("60.00"))
                .minOrderQuantity(new BigDecimal("1.00"))
                .imageUrl("https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80")
                .status(ProductStatus.ACTIVE)
                .isFeatured(false)
                .ratingAverage(new BigDecimal("4.70"))
                .reviewCount(2)
                .build();
        products.add(p3);

        Product p4 = Product.builder()
                .farmer(farmer2)
                .category(catFruit)
                .title("Royal Ratnagiri Alphonso Mangoes")
                .description("Naturally carbide-free ripened king of fruits. Intense sweetness, golden pulp, and world-renowned fragrance.")
                .unit(ProductUnit.DOZEN)
                .pricePerUnit(new BigDecimal("480.00"))
                .stockQuantity(new BigDecimal("28.00"))
                .minOrderQuantity(new BigDecimal("1.00"))
                .imageUrl("https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80")
                .status(ProductStatus.ACTIVE)
                .isFeatured(true)
                .ratingAverage(new BigDecimal("5.00"))
                .reviewCount(8)
                .build();
        products.add(p4);

        Product p5 = Product.builder()
                .farmer(farmer2)
                .category(catFruit)
                .title("Crisp Mountain Red Royal Apples")
                .description("High-altitude orchard apples with natural shine, firm texture, and balanced sweet-tart profile.")
                .unit(ProductUnit.KG)
                .pricePerUnit(new BigDecimal("170.00"))
                .stockQuantity(new BigDecimal("55.00"))
                .minOrderQuantity(new BigDecimal("1.00"))
                .imageUrl("https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80")
                .status(ProductStatus.ACTIVE)
                .isFeatured(true)
                .ratingAverage(new BigDecimal("4.85"))
                .reviewCount(4)
                .build();
        products.add(p5);

        Product p6 = Product.builder()
                .farmer(farmer1)
                .category(catGrains)
                .title("Aged Traditional Basmati Paddy Rice")
                .description("Slow-milled aromatic long-grain basmati rice aged for 18 months. Fluffy, non-sticky grains with captivating floral aroma.")
                .unit(ProductUnit.KG)
                .pricePerUnit(new BigDecimal("125.00"))
                .stockQuantity(new BigDecimal("120.00"))
                .minOrderQuantity(new BigDecimal("1.00"))
                .imageUrl("https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80")
                .status(ProductStatus.ACTIVE)
                .isFeatured(false)
                .ratingAverage(new BigDecimal("4.60"))
                .reviewCount(3)
                .build();
        products.add(p6);

        Product p7 = Product.builder()
                .farmer(farmer1)
                .category(catGrains)
                .title("Unpolished Desi Toor Dal (Pigeon Pea)")
                .description("Naturally dried and unpolished lentils with high protein content and authentic home-style texture.")
                .unit(ProductUnit.KG)
                .pricePerUnit(new BigDecimal("145.00"))
                .stockQuantity(new BigDecimal("85.00"))
                .minOrderQuantity(new BigDecimal("1.00"))
                .imageUrl("https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80")
                .status(ProductStatus.ACTIVE)
                .isFeatured(false)
                .ratingAverage(new BigDecimal("4.75"))
                .reviewCount(2)
                .build();
        products.add(p7);

        Product p8 = Product.builder()
                .farmer(farmer2)
                .category(catDairy)
                .title("Raw Wildflower Forest Honey")
                .description("Unprocessed, cold-filtered natural apiary honey harvested from mountain wildflowers. Pure enzymes and nectar.")
                .unit(ProductUnit.LITER)
                .pricePerUnit(new BigDecimal("390.00"))
                .stockQuantity(new BigDecimal("22.00"))
                .minOrderQuantity(new BigDecimal("1.00"))
                .imageUrl("https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80")
                .status(ProductStatus.ACTIVE)
                .isFeatured(true)
                .ratingAverage(new BigDecimal("4.95"))
                .reviewCount(6)
                .build();
        products.add(p8);

        Product p9 = Product.builder()
                .farmer(farmer2)
                .category(catDairy)
                .title("Artisan Bilona A2 Desi Cow Ghee")
                .description("Hand-churned curd-method golden ghee prepared from indigenous Gir cow milk in earthen pots.")
                .unit(ProductUnit.LITER)
                .pricePerUnit(new BigDecimal("890.00"))
                .stockQuantity(new BigDecimal("14.00"))
                .minOrderQuantity(new BigDecimal("1.00"))
                .imageUrl("https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=600&q=80")
                .status(ProductStatus.ACTIVE)
                .isFeatured(true)
                .ratingAverage(new BigDecimal("5.00"))
                .reviewCount(7)
                .build();
        products.add(p9);

        Product p10 = Product.builder()
                .farmer(farmer1)
                .category(catHerbs)
                .title("Fresh Garden Mint & Coriander Pair")
                .description("Aromatic fresh kitchen herbs grown without chemicals. Fragrant green cilantro and lively spearmint bunches.")
                .unit(ProductUnit.BUNCH)
                .pricePerUnit(new BigDecimal("20.00"))
                .stockQuantity(new BigDecimal("6.00")) // Demonstrates low stock alert (<= 10)
                .minOrderQuantity(new BigDecimal("1.00"))
                .imageUrl("https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80")
                .status(ProductStatus.ACTIVE)
                .isFeatured(false)
                .ratingAverage(new BigDecimal("4.50"))
                .reviewCount(2)
                .build();
        products.add(p10);

        productRepository.saveAll(products);

        // 8. Seed an initial completed order for realistic analytics
        Order seedOrder = Order.builder()
                .orderNumber("F2D-20261010-SEED01")
                .consumer(consumer1)
                .address(address1)
                .deliveryRecipientName(address1.getRecipientName())
                .deliveryPhone(address1.getPhoneNumber())
                .deliveryAddressText(address1.getStreetAddress() + ", " + address1.getCity() + ", " + address1.getState() + " - " + address1.getPostalCode())
                .status(OrderStatus.DELIVERED)
                .paymentMethod(PaymentMethod.CASH_ON_DELIVERY)
                .paymentStatus(PaymentStatus.COMPLETED)
                .subtotalAmount(new BigDecimal("870.00"))
                .deliveryFee(BigDecimal.ZERO)
                .totalAmount(new BigDecimal("870.00"))
                .notes("Deliver in evening after 5 PM")
                .build();

        seedOrder = orderRepository.save(seedOrder);

        OrderItem oi1 = OrderItem.builder()
                .order(seedOrder)
                .product(p4)
                .farmer(farmer2)
                .productTitleSnapshot(p4.getTitle())
                .unitPriceSnapshot(p4.getPricePerUnit())
                .unitSnapshot(p4.getUnit())
                .quantity(new BigDecimal("1.00"))
                .subtotal(new BigDecimal("480.00"))
                .fulfillmentStatus(OrderStatus.DELIVERED)
                .build();
        orderItemRepository.save(oi1);

        OrderItem oi2 = OrderItem.builder()
                .order(seedOrder)
                .product(p8)
                .farmer(farmer2)
                .productTitleSnapshot(p8.getTitle())
                .unitPriceSnapshot(p8.getPricePerUnit())
                .unitSnapshot(p8.getUnit())
                .quantity(new BigDecimal("1.00"))
                .subtotal(new BigDecimal("390.00"))
                .fulfillmentStatus(OrderStatus.DELIVERED)
                .build();
        orderItemRepository.save(oi2);

        Payment seedPayment = Payment.builder()
                .order(seedOrder)
                .paymentMethod(PaymentMethod.CASH_ON_DELIVERY)
                .paymentStatus(PaymentStatus.COMPLETED)
                .amount(new BigDecimal("870.00"))
                .transactionId("COD-F2D-20261010-SEED01")
                .build();
        paymentRepository.save(seedPayment);

        OrderStatusHistory h1 = OrderStatusHistory.builder()
                .order(seedOrder)
                .status(OrderStatus.PENDING)
                .notes("Order placed via Cash on Delivery")
                .changedBy(consumer1)
                .build();
        orderStatusHistoryRepository.save(h1);

        OrderStatusHistory h2 = OrderStatusHistory.builder()
                .order(seedOrder)
                .status(OrderStatus.DELIVERED)
                .notes("Successfully delivered to customer doorstep")
                .changedBy(farmer2)
                .build();
        orderStatusHistoryRepository.save(h2);

        // Seed a verified review
        Review seedReview = Review.builder()
                .product(p4)
                .consumer(consumer1)
                .order(seedOrder)
                .rating(5)
                .comment("Incredible aroma and taste! You can immediately tell they are naturally ripened without carbide. Thank you farmer Anita!")
                .isVerifiedPurchase(true)
                .build();
        reviewRepository.save(seedReview);

        log.info("Farm2Door initial seed data populated successfully!");
    }
}
