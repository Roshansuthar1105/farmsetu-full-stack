package com.farmsetu.controller;

import com.farmsetu.model.dto.common.ApiResponse;
import com.farmsetu.model.entity.CalendarTask;
import com.farmsetu.model.entity.CropCalendar;
import com.farmsetu.service.CropCalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CropCalendarController {

    private final CropCalendarService cropCalendarService;

    @GetMapping("/{farmerId}")
    public ApiResponse<List<CropCalendar>> list(@PathVariable Long farmerId) {
        return ApiResponse.ok(cropCalendarService.getByFarmer(farmerId));
    }

    @PostMapping
    public ApiResponse<CropCalendar> create(@RequestBody CropCalendar calendar) {
        return ApiResponse.ok(cropCalendarService.create(calendar));
    }

    @PutMapping("/{id}")
    public ApiResponse<CropCalendar> update(@PathVariable Long id, @RequestBody CropCalendar calendar) {
        return ApiResponse.ok(cropCalendarService.update(id, calendar));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        cropCalendarService.delete(id);
        return ApiResponse.ok(null);
    }

    @PostMapping("/{id}/tasks")
    public ApiResponse<CalendarTask> addTask(@PathVariable Long id, @RequestBody CalendarTask task) {
        return ApiResponse.ok(cropCalendarService.addTask(id, task));
    }

    @PutMapping("/tasks/{taskId}")
    public ApiResponse<CalendarTask> updateTask(@PathVariable Long taskId, @RequestBody CalendarTask task) {
        return ApiResponse.ok(cropCalendarService.updateTask(taskId, task));
    }

    @DeleteMapping("/tasks/{taskId}")
    public ApiResponse<Void> deleteTask(@PathVariable Long taskId) {
        cropCalendarService.deleteTask(taskId);
        return ApiResponse.ok(null);
    }
}
