package com.repair.system.config;

import com.repair.system.entity.RepairRequest;
import com.repair.system.entity.RepairStatus;
import com.repair.system.entity.Technician;
import com.repair.system.entity.User;
import com.repair.system.entity.UserRole;
import com.repair.system.repository.RepairRequestRepository;
import com.repair.system.repository.TechnicianRepository;
import com.repair.system.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TechnicianRepository technicianRepository;
    private final RepairRequestRepository repairRequestRepository;

    public DataInitializer(UserRepository userRepository,
                           TechnicianRepository technicianRepository,
                           RepairRequestRepository repairRequestRepository) {
        this.userRepository = userRepository;
        this.technicianRepository = technicianRepository;
        this.repairRequestRepository = repairRequestRepository;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            seedUsers();
        }
        if (technicianRepository.count() == 0) {
            seedTechniciansAndRepairs();
        }
    }

    private void seedUsers() {
        User admin = new User("System Admin", "admin@repairsystem.com", "+1-555-0100", "admin123", UserRole.ADMIN, "100 Service HQ, Suite 400");
        User customer1 = new User("John Doe", "john.doe@example.com", "+1-555-0199", "pass123", UserRole.CUSTOMER, "45 Maple Street, Springfield");
        User customer2 = new User("Sarah Connor", "sarah.c@example.com", "+1-555-0188", "pass123", UserRole.CUSTOMER, "12 Ocean Avenue, Los Angeles");

        userRepository.save(admin);
        userRepository.save(customer1);
        userRepository.save(customer2);
    }

    private void seedTechniciansAndRepairs() {
        Technician t1 = new Technician("Alex Rivera", "alex.rivera@repairsystem.com", "+1-555-0111", "Laptops & Motherboard Soldering");
        Technician t2 = new Technician("Sophia Chen", "sophia.chen@repairsystem.com", "+1-555-0122", "Smartphones & Display Diagnostics");
        Technician t3 = new Technician("Marcus Vance", "marcus.vance@repairsystem.com", "+1-555-0133", "Tablets & Battery Systems");
        Technician t4 = new Technician("Elena Gomez", "elena.gomez@repairsystem.com", "+1-555-0144", "Audio, Smart TVs & Power Modules");

        t1 = technicianRepository.save(t1);
        t2 = technicianRepository.save(t2);
        t3 = technicianRepository.save(t3);
        t4 = technicianRepository.save(t4);

        // Ticket 1: In Progress (Alex Rivera)
        RepairRequest req1 = new RepairRequest();
        req1.setTrackingNumber("REP-2026-1011");
        req1.setCustomerName("John Doe");
        req1.setCustomerEmail("john.doe@example.com");
        req1.setCustomerPhone("+1-555-0199");
        req1.setDeviceType("Laptop");
        req1.setDeviceBrand("Apple");
        req1.setDeviceModel("MacBook Pro 16\" (M2 Max)");
        req1.setSerialNumber("C02GF92HMD6M");
        req1.setIssueDescription("Keyboard backlight flickering and battery draining abnormally within 45 minutes.");
        req1.setPriority("HIGH");
        req1.setStatus(RepairStatus.IN_PROGRESS);
        req1.setAssignedTechnician(t1);
        req1.setEstimatedCost(180.00);
        req1.setFinalCost(0.0);
        req1.setTechnicianNotes("Diagnosed battery cell degradation. Replacement original battery pack installed, running thermal burn-in test.");
        req1.setCreatedAt(LocalDateTime.now().minusDays(3));
        t1.setActiveJobsCount(1);
        repairRequestRepository.save(req1);

        // Ticket 2: Assigned (Sophia Chen)
        RepairRequest req2 = new RepairRequest();
        req2.setTrackingNumber("REP-2026-1012");
        req2.setCustomerName("Sarah Connor");
        req2.setCustomerEmail("sarah.c@example.com");
        req2.setCustomerPhone("+1-555-0188");
        req2.setDeviceType("Smartphone");
        req2.setDeviceBrand("Samsung");
        req2.setDeviceModel("Galaxy S24 Ultra");
        req2.setSerialNumber("SM-S928B-0941");
        req2.setIssueDescription("Cracked front AMOLED glass after drop. Touch input unresponsive in bottom-left corner.");
        req2.setPriority("URGENT");
        req2.setStatus(RepairStatus.ASSIGNED);
        req2.setAssignedTechnician(t2);
        req2.setEstimatedCost(240.00);
        req2.setFinalCost(0.0);
        req2.setTechnicianNotes("OLED assembly ordered from distributor. Expected arrival tomorrow.");
        req2.setCreatedAt(LocalDateTime.now().minusDays(1));
        t2.setActiveJobsCount(1);
        repairRequestRepository.save(req2);

        // Ticket 3: Completed
        RepairRequest req3 = new RepairRequest();
        req3.setTrackingNumber("REP-2026-1010");
        req3.setCustomerName("David Miller");
        req3.setCustomerEmail("david.m@example.com");
        req3.setCustomerPhone("+1-555-0177");
        req3.setDeviceType("Laptop");
        req3.setDeviceBrand("Dell");
        req3.setDeviceModel("XPS 15 9520");
        req3.setSerialNumber("DELL-XPS-78219");
        req3.setIssueDescription("Overheating during rendering and USB-C Thunderbolt port not detecting external monitor.");
        req3.setPriority("MEDIUM");
        req3.setStatus(RepairStatus.COMPLETED);
        req3.setAssignedTechnician(t1);
        req3.setEstimatedCost(130.00);
        req3.setFinalCost(145.00);
        req3.setTechnicianNotes("Replaced thermal paste with liquid metal compound, cleaned twin heat sinks, and re-soldered USB-C port pin trace.");
        req3.setCreatedAt(LocalDateTime.now().minusDays(6));
        req3.setCompletedAt(LocalDateTime.now().minusDays(1));
        repairRequestRepository.save(req3);

        // Ticket 4: Pending (unassigned)
        RepairRequest req4 = new RepairRequest();
        req4.setTrackingNumber("REP-2026-1013");
        req4.setCustomerName("Emily Watson");
        req4.setCustomerEmail("emily.w@example.com");
        req4.setCustomerPhone("+1-555-0166");
        req4.setDeviceType("Tablet");
        req4.setDeviceBrand("Apple");
        req4.setDeviceModel("iPad Air 5th Gen");
        req4.setSerialNumber("DMPV2890LK");
        req4.setIssueDescription("Device won't power on after liquid spill near charging port.");
        req4.setPriority("HIGH");
        req4.setStatus(RepairStatus.PENDING);
        req4.setEstimatedCost(0.0);
        req4.setFinalCost(0.0);
        req4.setCreatedAt(LocalDateTime.now().minusHours(4));
        repairRequestRepository.save(req4);

        technicianRepository.save(t1);
        technicianRepository.save(t2);
    }
}
