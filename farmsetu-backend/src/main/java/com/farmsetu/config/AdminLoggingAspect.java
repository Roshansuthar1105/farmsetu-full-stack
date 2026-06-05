package com.farmsetu.config;

import com.farmsetu.model.entity.AdminLog;
import com.farmsetu.repository.AdminLogRepository;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class AdminLoggingAspect {

    private final AdminLogRepository adminLogRepository;

    public AdminLoggingAspect(AdminLogRepository adminLogRepository) {
        this.adminLogRepository = adminLogRepository;
    }

    // Intercept save/delete operations on repositories inside com.farmsetu.repository
    @Pointcut("execution(* com.farmsetu.repository.*.save*(..)) && !execution(* com.farmsetu.repository.AdminLogRepository.*(..))")
    public void saveMethods() {}

    @Pointcut("execution(* com.farmsetu.repository.*.delete*(..)) && !execution(* com.farmsetu.repository.AdminLogRepository.*(..))")
    public void deleteMethods() {}

    @AfterReturning(pointcut = "saveMethods()", returning = "entity")
    public void logSave(JoinPoint joinPoint, Object entity) {
        if (entity != null) {
            String entityName = entity.getClass().getSimpleName();
            
            AdminLog log = AdminLog.builder()
                    .entityName(entityName)
                    .action("SAVE/UPDATE")
                    .performedBy("System") // Can be updated to fetch from SecurityContext
                    .details("Entity " + entityName + " was saved or updated.")
                    .build();
            
            try {
                // In case it's a BaseEntity, try to get ID if possible, but leaving null is fine for generic logs
                adminLogRepository.save(log);
            } catch (Exception e) {
                // Suppress errors during logging
            }
        }
    }

    @AfterReturning("deleteMethods()")
    public void logDelete(JoinPoint joinPoint) {
        Object[] args = joinPoint.getArgs();
        if (args.length > 0 && args[0] != null) {
            String entityName = args[0].getClass().getSimpleName();
            AdminLog log = AdminLog.builder()
                    .entityName(entityName)
                    .action("DELETE")
                    .performedBy("System")
                    .details("Entity " + entityName + " was deleted.")
                    .build();
            try {
                adminLogRepository.save(log);
            } catch (Exception e) {}
        }
    }
}
