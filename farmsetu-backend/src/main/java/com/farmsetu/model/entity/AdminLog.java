package com.farmsetu.model.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "admin_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminLog extends BaseEntity {

    private String entityName;
    private Long entityId;
    private String action; // CREATE, UPDATE, DELETE
    private String performedBy;
    private String details;
}
