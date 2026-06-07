package com.farmsetu.exception;

import com.farmsetu.model.dto.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(BadRequestException ex) {
        return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Invalid credentials"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        return ResponseEntity.badRequest().body(
                ApiResponse.<Map<String, String>>builder().success(false).message("Validation failed").data(errors).build());
    }

    @ExceptionHandler(org.springframework.transaction.UnexpectedRollbackException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnexpectedRollback(org.springframework.transaction.UnexpectedRollbackException ex) {
        String msg = "Transaction was rolled back because of a database error or invalid references. Please ensure referenced entities exist.";
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(msg));
    }

    @ExceptionHandler(org.springframework.transaction.TransactionSystemException.class)
    public ResponseEntity<ApiResponse<Void>> handleTransactionSystem(org.springframework.transaction.TransactionSystemException ex) {
        Throwable cause = ex.getRootCause();
        String msg = cause != null ? cause.getMessage() : ex.getMessage();
        if (msg == null) msg = "Transaction failed due to a system or database constraint error.";
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(msg));
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolation(org.springframework.dao.DataIntegrityViolationException ex) {
        Throwable cause = ex.getRootCause();
        String msg = cause != null ? cause.getMessage() : ex.getMessage();
        if (msg != null && msg.toLowerCase().contains("foreign key")) {
            msg = "Database constraint violation: referenced entity (e.g. user, post, product) does not exist.";
        } else {
            msg = "Database constraint violation. Please verify unique fields or database constraints.";
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(msg));
    }

    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleMessageNotReadable(org.springframework.http.converter.HttpMessageNotReadableException ex) {
        Throwable cause = ex.getCause();
        if (cause instanceof com.fasterxml.jackson.databind.exc.InvalidFormatException) {
            com.fasterxml.jackson.databind.exc.InvalidFormatException ife = (com.fasterxml.jackson.databind.exc.InvalidFormatException) cause;
            if (ife.getTargetType() != null && ife.getTargetType().isEnum()) {
                Class<?> enumType = ife.getTargetType();
                Object[] constants = enumType.getEnumConstants();
                java.util.List<String> allowedValues = new java.util.ArrayList<>();
                if (constants != null) {
                    for (Object c : constants) {
                        allowedValues.add(((Enum<?>) c).name());
                    }
                }
                String msg = String.format("Invalid value '%s' for field. Allowed values for %s are: %s",
                        ife.getValue(), enumType.getSimpleName(), String.join(", ", allowedValues));
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(msg));
            }
        }
        String msg = ex.getMessage() != null ? ex.getMessage() : "Malformed JSON request body";
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(msg));
    }

    @ExceptionHandler(org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(org.springframework.web.method.annotation.MethodArgumentTypeMismatchException ex) {
        Throwable cause = ex.getMostSpecificCause();
        String msg;
        if (cause instanceof IllegalArgumentException && cause.getMessage() != null && cause.getMessage().contains("Allowed values")) {
            msg = cause.getMessage();
        } else {
            msg = String.format("Failed to convert parameter '%s' to required type '%s'. %s",
                    ex.getName(), ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown",
                    cause != null ? cause.getMessage() : "");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(msg));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(ex.getMessage() != null ? ex.getMessage() : "Internal server error"));
    }
}
