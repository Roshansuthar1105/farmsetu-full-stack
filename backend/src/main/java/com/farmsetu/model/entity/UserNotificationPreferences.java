package com.farmsetu.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_notification_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class UserNotificationPreferences extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnore
    private User user;

    @Column(name = "email_alerts")
    @Builder.Default
    private boolean emailAlerts = true;

    @Column(name = "sms_alerts")
    @Builder.Default
    private boolean smsAlerts = true;

    @Column(name = "whatsapp_alerts")
    @Builder.Default
    private boolean whatsappAlerts = false;

    @Column(name = "weather_warnings")
    @Builder.Default
    private boolean weatherWarnings = true;

    @Column(name = "price_surges")
    @Builder.Default
    private boolean priceSurges = true;

    @Column(name = "task_reminders")
    @Builder.Default
    private boolean taskReminders = true;
}
