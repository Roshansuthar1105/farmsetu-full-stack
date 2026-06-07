package com.farmsetu.controller;

import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.model.entity.FarmExpense;
import com.farmsetu.service.FinanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/finance")
@RequiredArgsConstructor
public class FinanceController {

    private final FinanceService financeService;

    @PostMapping("/loan-eligibility")
    public ApiResponse<Map<String, Object>> loanEligibility(@RequestBody Map<String, Object> input) {
        return ApiResponse.ok(financeService.loanEligibility(input));
    }

    @GetMapping("/schemes")
    public ApiResponse<List<Map<String, Object>>> schemes() {
        return ApiResponse.ok(financeService.loanSchemes());
    }

    @PostMapping("/expenses")
    public ApiResponse<FarmExpense> addExpense(@RequestBody FarmExpense expense) {
        return ApiResponse.ok(financeService.addExpense(expense));
    }

    @GetMapping("/expenses/{farmerId}")
    public ApiResponse<List<FarmExpense>> expenses(@PathVariable Long farmerId) {
        return ApiResponse.ok(financeService.getExpenses(farmerId));
    }

    @GetMapping("/report/{farmerId}")
    public ApiResponse<Map<String, Object>> report(@PathVariable Long farmerId) {
        return ApiResponse.ok(financeService.financialReport(farmerId));
    }

    @PostMapping("/calculate")
    public ApiResponse<Map<String, Object>> calculate(@RequestBody Map<String, Object> input) {
        return ApiResponse.ok(financeService.calculate(input));
    }
}
