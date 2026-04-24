package com.englishapp.backend.admin.controller;

import com.englishapp.backend.admin.dto.UpsertVocabRequest;
import com.englishapp.backend.admin.service.AdminContentService;
import com.englishapp.backend.common.api.ApiResponse;
import com.englishapp.backend.vocab.dto.VocabEntryDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/vocab")
@RequiredArgsConstructor
@Tag(name = "Admin - Vocabulary", description = "CRUD and CEFR classification for vocabulary (ROLE_ADMIN only)")
public class AdminVocabController {

    private final AdminContentService service;

    @GetMapping
    @Operation(summary = "List all vocabulary — filter with ?level=A1 or ?topic=school")
    public ApiResponse<Page<VocabEntryDto>> list(
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String topic,
            @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.of(service.listVocab(level, topic, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a vocabulary entry by ID")
    public ApiResponse<VocabEntryDto> get(@PathVariable Long id) {
        return ApiResponse.of(service.getVocab(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new vocabulary entry")
    public ApiResponse<VocabEntryDto> create(@Valid @RequestBody UpsertVocabRequest req) {
        return ApiResponse.of(service.createVocab(req));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update vocabulary — use this to set or change CEFR level (difficultyLevel)")
    public ApiResponse<VocabEntryDto> update(@PathVariable Long id,
                                             @Valid @RequestBody UpsertVocabRequest req) {
        return ApiResponse.of(service.updateVocab(id, req));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a vocabulary entry")
    public void delete(@PathVariable Long id) {
        service.deleteVocab(id);
    }
}
