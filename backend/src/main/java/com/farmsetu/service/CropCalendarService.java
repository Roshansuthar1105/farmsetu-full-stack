package com.farmsetu.service;

import com.farmsetu.exception.ResourceNotFoundException;
import com.farmsetu.model.entity.CalendarTask;
import com.farmsetu.model.entity.CropCalendar;
import com.farmsetu.model.entity.User;
import com.farmsetu.repository.CalendarTaskRepository;
import com.farmsetu.repository.CropCalendarRepository;
import com.farmsetu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CropCalendarService {

    private final CropCalendarRepository cropCalendarRepository;
    private final CalendarTaskRepository calendarTaskRepository;
    private final UserRepository userRepository;

    public List<CropCalendar> getByFarmer(Long farmerId) {
        return cropCalendarRepository.findByFarmerId(farmerId);
    }

    @Transactional
    public CropCalendar create(CropCalendar calendar) {
        return cropCalendarRepository.save(calendar);
    }

    @Transactional
    public CropCalendar update(Long id, CropCalendar calendar) {
        CropCalendar existing = cropCalendarRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Calendar not found"));
        existing.setSeason(calendar.getSeason());
        existing.setYear(calendar.getYear());
        existing.setPlantingDate(calendar.getPlantingDate());
        existing.setExpectedHarvestDate(calendar.getExpectedHarvestDate());
        existing.setPlotArea(calendar.getPlotArea());
        existing.setStatus(calendar.getStatus());
        return cropCalendarRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        cropCalendarRepository.deleteById(id);
    }

    @Transactional
    public CalendarTask addTask(Long calendarId, CalendarTask task) {
        CropCalendar calendar = cropCalendarRepository.findById(calendarId)
                .orElseThrow(() -> new ResourceNotFoundException("Calendar not found"));
        task.setCalendar(calendar);
        return calendarTaskRepository.save(task);
    }

    @Transactional
    public CalendarTask updateTask(Long taskId, CalendarTask task) {
        CalendarTask existing = calendarTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        existing.setTaskName(task.getTaskName());
        existing.setTaskType(task.getTaskType());
        existing.setScheduledDate(task.getScheduledDate());
        existing.setCompleted(task.isCompleted());
        existing.setCompletedDate(task.getCompletedDate());
        existing.setNotes(task.getNotes());
        return calendarTaskRepository.save(existing);
    }

    @Transactional
    public void deleteTask(Long taskId) {
        calendarTaskRepository.deleteById(taskId);
    }
}
