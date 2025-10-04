package com.example.kltn.utils;

import com.example.kltn.models.ContentItem;

import java.util.ArrayList;
import java.util.List;

public class DummyDataGenerator {
    
    public static List<ContentItem> getFlashcards() {
        List<ContentItem> flashcards = new ArrayList<>();
        
        flashcards.add(new ContentItem("1", "Animals", "Vocabulary", "", "flashcard", "vocabulary"));
        flashcards.add(new ContentItem("2", "Verbs", "Grammar", "", "flashcard", "grammar"));
        flashcards.add(new ContentItem("3", "Fruits", "Vocabulary", "", "flashcard", "vocabulary"));
        flashcards.add(new ContentItem("4", "Nouns", "Grammar", "", "flashcard", "grammar"));
        flashcards.add(new ContentItem("5", "Colors", "Vocabulary", "", "flashcard", "vocabulary"));
        flashcards.add(new ContentItem("6", "Adjectives", "Grammar", "", "flashcard", "grammar"));
        flashcards.add(new ContentItem("7", "Numbers", "Vocabulary", "", "flashcard", "vocabulary"));
        flashcards.add(new ContentItem("8", "Pronouns", "Grammar", "", "flashcard", "grammar"));
        
        return flashcards;
    }
    
    public static List<ContentItem> getTests() {
        List<ContentItem> tests = new ArrayList<>();
        
        tests.add(new ContentItem("1", "Grammar Test 1", "Basic Grammar", "", "test", "grammar"));
        tests.add(new ContentItem("2", "Vocabulary Test 1", "Basic Vocabulary", "", "test", "vocabulary"));
        tests.add(new ContentItem("3", "Reading Test 1", "Reading Comprehension", "", "test", "reading"));
        tests.add(new ContentItem("4", "Listening Test 1", "Listening Skills", "", "test", "listening"));
        tests.add(new ContentItem("5", "Writing Test 1", "Writing Skills", "", "test", "writing"));
        tests.add(new ContentItem("6", "Speaking Test 1", "Speaking Skills", "", "test", "speaking"));
        
        return tests;
    }
    
    public static List<ContentItem> searchFlashcards(String query) {
        List<ContentItem> allFlashcards = getFlashcards();
        List<ContentItem> results = new ArrayList<>();
        
        for (ContentItem item : allFlashcards) {
            if (item.getTitle().toLowerCase().contains(query.toLowerCase()) ||
                item.getDescription().toLowerCase().contains(query.toLowerCase())) {
                results.add(item);
            }
        }
        
        return results;
    }
    
    public static List<ContentItem> searchTests(String query) {
        List<ContentItem> allTests = getTests();
        List<ContentItem> results = new ArrayList<>();
        
        for (ContentItem item : allTests) {
            if (item.getTitle().toLowerCase().contains(query.toLowerCase()) ||
                item.getDescription().toLowerCase().contains(query.toLowerCase())) {
                results.add(item);
            }
        }
        
        return results;
    }
} 