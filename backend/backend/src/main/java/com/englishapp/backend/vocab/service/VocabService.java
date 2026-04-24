package com.englishapp.backend.vocab.service;

import com.englishapp.backend.auth.entity.User;
import com.englishapp.backend.auth.repository.UserRepository;
import com.englishapp.backend.common.exception.BadRequestException;
import com.englishapp.backend.common.exception.NotFoundException;
import com.englishapp.backend.vocab.dto.SaveVocabRequest;
import com.englishapp.backend.vocab.dto.VocabEntryDto;
import com.englishapp.backend.vocab.dto.VocabSavedDto;
import com.englishapp.backend.vocab.entity.VocabSaved;
import com.englishapp.backend.vocab.entity.Vocabulary;
import com.englishapp.backend.vocab.repository.VocabSavedRepository;
import com.englishapp.backend.vocab.repository.VocabularyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VocabService {

    private final VocabularyRepository vocabRepo;
    private final VocabSavedRepository savedRepo;
    private final UserRepository userRepo;

    // ── Dictionary ───────────────────────────────────────────────────────────

    public Page<VocabEntryDto> search(String q, Pageable pageable) {
        return vocabRepo.search(q, pageable).map(this::toEntryDto);
    }

    public Page<VocabEntryDto> filterByLevel(String level, Pageable pageable) {
        return vocabRepo.findByDifficultyLevelOrderByWord(level, pageable).map(this::toEntryDto);
    }

    public Page<VocabEntryDto> filterByTopic(String topic, Pageable pageable) {
        return vocabRepo.findByTopicOrderByWord(topic, pageable).map(this::toEntryDto);
    }

    public VocabEntryDto getById(Long id) {
        return toEntryDto(vocabRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Vocabulary not found")));
    }

    // ── Bookmarks ────────────────────────────────────────────────────────────

    public Page<VocabSavedDto> listSaved(String email, Pageable pageable) {
        User user = findUser(email);
        return savedRepo.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(this::toSavedDto);
    }

    @Transactional
    public VocabSavedDto save(String email, SaveVocabRequest req) {
        User user = findUser(email);

        String word;
        String meaning;

        if (req.vocabularyId() != null) {
            Vocabulary v = vocabRepo.findById(req.vocabularyId())
                    .orElseThrow(() -> new NotFoundException("Vocabulary not found"));
            word = v.getWord();
            meaning = req.meaning() != null ? req.meaning() : v.getMeaning();
        } else {
            if (req.word() == null || req.word().isBlank()) {
                throw new BadRequestException("word is required when vocabularyId is not provided");
            }
            word = req.word().trim();
            meaning = req.meaning();
        }

        if (savedRepo.existsByUserIdAndWord(user.getId(), word)) {
            throw new BadRequestException("Word '" + word + "' is already saved");
        }

        String source = req.vocabularyId() != null ? "dictionary" : "manual";

        VocabSaved saved = VocabSaved.builder()
                .userId(user.getId())
                .word(word)
                .meaning(meaning)
                .note(req.note())
                .source(source)
                .build();

        return toSavedDto(savedRepo.save(saved));
    }

    @Transactional
    public void unsave(String email, Long savedId) {
        User user = findUser(email);
        VocabSaved saved = savedRepo.findById(savedId)
                .orElseThrow(() -> new NotFoundException("Saved word not found"));
        if (!saved.getUserId().equals(user.getId())) {
            throw new BadRequestException("Not authorized to remove this bookmark");
        }
        savedRepo.delete(saved);
    }

    // ── Mappers ──────────────────────────────────────────────────────────────

    private VocabEntryDto toEntryDto(Vocabulary v) {
        return new VocabEntryDto(v.getId(), v.getWord(), v.getMeaning(), v.getIpa(),
                v.getPartOfSpeech(), v.getTopic(), v.getDifficultyLevel(),
                v.getAudioUrl(), v.getExample(), v.getGrammarInfo());
    }

    private VocabSavedDto toSavedDto(VocabSaved s) {
        return new VocabSavedDto(s.getId(), s.getWord(), s.getMeaning(),
                s.getNote(), s.getSource(), s.getCreatedAt());
    }

    private User findUser(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }
}
