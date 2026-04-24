package com.englishapp.backend.vocab.controller;

import com.englishapp.backend.common.api.ApiResponse;
import com.englishapp.backend.vocab.dto.*;
import com.englishapp.backend.vocab.service.ReviewService;
import com.englishapp.backend.vocab.service.VocabService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vocab")
@RequiredArgsConstructor
@Tag(name = "Vocabulary", description = "Dictionary, bookmarks, and mistake review")
@SecurityRequirement(name = "bearerAuth")
public class VocabController {

    private final VocabService vocabService;
    private final ReviewService reviewService;

    // ── Dictionary ───────────────────────────────────────────────────────────

    @GetMapping("/dictionary")
    @Operation(summary = "Search dictionary by English word or Vietnamese meaning")
    public ApiResponse<Page<VocabEntryDto>> search(
            @RequestParam String q,
            @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.of(vocabService.search(q, pageable));
    }

    @GetMapping("/dictionary/{id}")
    @Operation(summary = "Get a single vocabulary entry by ID")
    public ApiResponse<VocabEntryDto> getById(@PathVariable Long id) {
        return ApiResponse.of(vocabService.getById(id));
    }

    @GetMapping("/dictionary/by-level")
    @Operation(summary = "Browse vocabulary by CEFR level (A1–C2)")
    public ApiResponse<Page<VocabEntryDto>> byLevel(
            @RequestParam String level,
            @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.of(vocabService.filterByLevel(level, pageable));
    }

    @GetMapping("/dictionary/by-topic")
    @Operation(summary = "Browse vocabulary by topic")
    public ApiResponse<Page<VocabEntryDto>> byTopic(
            @RequestParam String topic,
            @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.of(vocabService.filterByTopic(topic, pageable));
    }

    // ── Bookmarks ────────────────────────────────────────────────────────────

    @GetMapping("/saved")
    @Operation(summary = "List the current user's saved words")
    public ApiResponse<Page<VocabSavedDto>> listSaved(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.of(vocabService.listSaved(userDetails.getUsername(), pageable));
    }

    @PostMapping("/save")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Save a word — provide vocabularyId (from dictionary) or a manual word string")
    public ApiResponse<VocabSavedDto> save(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody SaveVocabRequest request) {
        return ApiResponse.of(vocabService.save(userDetails.getUsername(), request));
    }

    @DeleteMapping("/saved/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remove a saved word by its saved-record ID")
    public void unsave(@PathVariable Long id,
                       @AuthenticationPrincipal UserDetails userDetails) {
        vocabService.unsave(userDetails.getUsername(), id);
    }

    // ── Mistake Review ───────────────────────────────────────────────────────

    @GetMapping("/mistakes")
    @Operation(summary = "Words the user frequently gets wrong in exercises, sorted by mistake count")
    public ApiResponse<Page<MistakeReviewDto>> getMistakes(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.of(reviewService.getMistakes(userDetails.getUsername(), pageable));
    }

    @PostMapping("/mistakes/{id}/reviewed")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Mark a mistake as reviewed — resets its mistake count")
    public void markReviewed(@PathVariable Long id,
                             @AuthenticationPrincipal UserDetails userDetails) {
        reviewService.markReviewed(userDetails.getUsername(), id);
    }

    // ── Topic Priority (Home Screen) ─────────────────────────────────────────

    @GetMapping("/topics/priority")
    @Operation(summary = "Topics ranked by total mistake count — use for home screen ordering")
    public ApiResponse<List<TopicPriorityDto>> topicPriority(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ApiResponse.of(reviewService.getTopicPriority(userDetails.getUsername()));
    }
}
