package com.englishapp.backend.vocab.init;

import com.englishapp.backend.vocab.entity.Vocabulary;
import com.englishapp.backend.vocab.repository.VocabularyRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class VocabularyDataInitializer implements ApplicationRunner {

    private final VocabularyRepository vocabRepo;
    private final ObjectMapper mapper;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        if (vocabRepo.count() > 0) {
            log.info("Vocabulary already seeded — skipping");
            return;
        }

        var resource = new ClassPathResource("data/vocabulary_school.json");
        List<JsonNode> entries = mapper.readValue(
                resource.getInputStream(), new TypeReference<>() {});

        List<Vocabulary> vocabs = entries.stream().map(this::toVocabulary).toList();
        vocabRepo.saveAll(vocabs);
        log.info("Seeded {} vocabulary entries", vocabs.size());
    }

    private Vocabulary toVocabulary(JsonNode node) {
        Map<String, String> grammar = new LinkedHashMap<>();
        addIfPresent(grammar, "v1", node, "V1");
        addIfPresent(grammar, "v2", node, "V2");
        addIfPresent(grammar, "v3", node, "V3");
        addIfPresent(grammar, "plural", node, "Số nhiều");

        return Vocabulary.builder()
                .word(node.path("Word").asText())
                .meaning(node.path("Nghĩa").asText())
                .ipa(text(node, "IPA"))
                .partOfSpeech(text(node, "Loại"))
                .topic(text(node, "Topic"))
                .difficultyLevel(text(node, "Level"))
                .audioUrl(text(node, "Sound"))
                .example(text(node, "Giải thích"))
                .grammarInfo(grammar.isEmpty() ? null : grammar)
                .build();
    }

    private void addIfPresent(Map<String, String> map, String key, JsonNode node, String field) {
        JsonNode n = node.path(field);
        if (!n.isNull() && !n.isMissingNode() && !n.asText().isBlank()) {
            map.put(key, n.asText());
        }
    }

    private String text(JsonNode node, String field) {
        JsonNode n = node.path(field);
        return (n.isNull() || n.isMissingNode()) ? null : n.asText();
    }
}
