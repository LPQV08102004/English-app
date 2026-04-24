package com.englishapp.backend.vocab.dto;

import java.util.Map;

public record VocabEntryDto(
        Long id,
        String word,
        String meaning,
        String ipa,
        String partOfSpeech,
        String topic,
        String level,
        String audioUrl,
        String example,
        Map<String, String> grammarInfo
) {}
