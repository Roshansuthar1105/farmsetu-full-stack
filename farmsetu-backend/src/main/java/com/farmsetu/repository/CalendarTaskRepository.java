package com.farmsetu.repository;

import com.farmsetu.model.entity.CalendarTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CalendarTaskRepository extends JpaRepository<CalendarTask, Long> {
    List<CalendarTask> findByCalendarId(Long calendarId);
}


