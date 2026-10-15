package com.repair.system.service;

import com.repair.system.entity.Technician;
import com.repair.system.repository.TechnicianRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TechnicianService {

    private final TechnicianRepository technicianRepository;

    public TechnicianService(TechnicianRepository technicianRepository) {
        this.technicianRepository = technicianRepository;
    }

    public List<Technician> getAllTechnicians() {
        return technicianRepository.findAll();
    }

    public Technician getTechnicianById(Long id) {
        return technicianRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Technician not found with ID: " + id));
    }

    public Technician createTechnician(Technician technician) {
        return technicianRepository.save(technician);
    }

    public Technician updateTechnician(Long id, Technician updated) {
        Technician existing = getTechnicianById(id);
        existing.setName(updated.getName());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setSpecialization(updated.getSpecialization());
        existing.setAvailable(updated.isAvailable());
        return technicianRepository.save(existing);
    }

    public void deleteTechnician(Long id) {
        technicianRepository.deleteById(id);
    }
}
