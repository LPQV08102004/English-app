package com.englishapp.backend.vocab.dto;

public record SaveVocabRequest(
        // Provide vocabularyId to save from dictionary; word is derived automatically
        Long vocabularyId,
        // Required when vocabularyId is null (manual save)
        String word,
        String meaning,
        String note
) {}
