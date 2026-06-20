package com.farmsetu.service;

import com.farmsetu.exception.BadRequestException;
import com.farmsetu.exception.ResourceNotFoundException;
import com.farmsetu.model.entity.FarmExpense;
import com.farmsetu.model.entity.User;
import com.farmsetu.repository.FarmExpenseRepository;
import com.farmsetu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FinanceService {

    private final FarmExpenseRepository farmExpenseRepository;
    private final UserRepository userRepository;

    public Map<String, Object> loanEligibility(Map<String, Object> input) {
        return Map.of("eligible", true, "maxAmount", 200000, "input", input);
    }

    public List<Map<String, Object>> loanSchemes() {
        return List.of(
                Map.of("name", "Kisan Credit Card", "provider", "NABARD"),
                Map.of("name", "PM-KISAN", "provider", "Government of India")
        );
    }

    @Transactional
    public FarmExpense addExpense(FarmExpense expense) {
        if (expense.getFarmer() == null || expense.getFarmer().getId() == null) {
            throw new BadRequestException("Farmer ID is required");
        }
        User farmer = userRepository.findById(expense.getFarmer().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found"));
        expense.setFarmer(farmer);
        return farmExpenseRepository.save(expense);
    }

    public List<FarmExpense> getExpenses(Long farmerId) {
        return farmExpenseRepository.findByFarmerId(farmerId);
    }

    public Map<String, Object> financialReport(Long farmerId) {
        List<FarmExpense> expenses = farmExpenseRepository.findByFarmerId(farmerId);
        BigDecimal total = expenses.stream()
                .map(FarmExpense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, Object> report = new HashMap<>();
        report.put("farmerId", farmerId);
        report.put("totalExpenses", total);
        report.put("expenses", expenses);
        return report;
    }

    public Map<String, Object> calculate(Map<String, Object> input) {
        return Map.of("result", input);
    }
}
