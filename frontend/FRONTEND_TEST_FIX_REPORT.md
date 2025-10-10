# Frontend Test Fix Report

Generated: 2025-10-02T06:52:12.773Z

## Summary
- Total Test Categories: 7
- Passed: 0
- Failed: 7
- Success Rate: 0%

## Results by Category

### Utils Tests
Status: ❌ FAILED

#### Error Details
```
FAIL src/utils/__tests__/index.test.ts
  Utils
    Date utilities
      formatDate
        √ formats Date object correctly (64 ms)
        √ formats date string correctly
      formatDateTime
        × formats Date object with time (3 ms)
        × formats date string with time (1 ms)
    String utilities
      capitalize
        √ capitalizes first letter of string (1 ms)
        √ handles empty string
        √ handles single character (1 ms)
        √ does not change already capitalized string
      truncateText
        √ truncates text longer than maxLength (1 ms)
        √ returns original text if shorter than maxLength
        √ returns original text if equal to maxLength
        √ handles empty string
    Number utilities
      formatPercentage
        √ calculates percentage correctly
        √ handles zero total
        √ handles zero value
        √ rounds to nearest integer (1 ms)
      formatScore
        √ formats score with percentage sign
        √ rounds to nearest integer
        √ handles zero score
        √ handles perfect score (1 ms)
    Array utilities
      shuffleArray
        √ returns array with same length
        √ contains all original elements (1 ms)
        √ does not modify original array
        √ handles empty array
        √ handles single element array
        √ works with different data types (1 ms)
    Storage utilities
      storage.get
        × retrieves stored value (1 ms)
        √ returns null for non-existent key
        √ handles invalid JSON gracefully
      storage.set
        √ stores value correctly
        √ handles storage errors gracefully (1 ms)
      storage.remove
        √ removes item from storage
      storage.clear
        √ clears all storage
    Validation utilities
      validateEmail
        √ validates correct email addresses (1 ms)
        √ rejects invalid email addresses
      validatePassword
        √ validates passwords with 6 or more characters
        √ rejects passwords with less than 6 characters (1 ms)
    Error handling utilities
      getErrorMessage
        √ extracts message from Error object
        √ returns string error as is
        √ handles unknown error types

  ● Utils › Date utilities › formatDateTime › formats Date object with time

    expect(received).toMatch(expected)

    Expected pattern: /\d{1,2}\/\d{1,2}\/\d{4}.*\d{1,2}:\d{2}:\d{2}/
    Received string:  "10:30:00 25/12/2023"

    [0m [90m 60 |[39m                 [36mconst[39m date [33m=[39m [36mnew[39m [33mDate[39m([32m'2023-12-25T10:30:00'[39m)[33m;[39m
     [90m 61 |[39m                 [36mconst[39m formatted [33m=[39m formatDateTime(date)[33m;[39m
    [31m[1m>[22m[39m[90m 62 |[39m                 expect(formatted)[33m.[39mtoMatch([35m/\d{1,2}\/\d{1,2}\/\d{4}.*\d{1,2}:\d{2}:\d{2}/[39m)[33m;[39m
     [90m    |[39m                                   [31m[1m^[22m[39m
     [90m 63 |[39m             })[33m;[39m
     [90m 64 |[39m
     [90m 65 |[39m             it([32m'formats date string with time'[39m[33m,[39m () [33m=>[39m {[0m

      at Object.<anonymous> (src/utils/__tests__/index.test.ts:62:35)
      at TestScheduler.scheduleTests (node_modules/@jest/core/build/TestScheduler.js:333:13)
      at runJest (node_modules/@jest/core/build/runJest.js:404:19)
      at _run10000 (node_modules/@jest/core/build/cli/index.js:320:7)
      at runCLI (node_modules/@jest/core/build/cli/index.js:173:3)

  ● Utils › Date utilities › formatDateTime › formats date string with time

    expect(received).toMatch(expected)

    Expected pattern: /\d{1,2}\/\d{1,2}\/\d{4}.*\d{1,2}:\d{2}:\d{2}/
    Received string:  "10:30:00 25/12/2023"

    [0m [90m 66 |[39m                 [36mconst[39m dateString [33m=[39m [32m'2023-12-25T10:30:00'[39m[33m;[39m
     [90m 67 |[39m                 [36mconst[39m formatted [33m=[39m formatDateTime(dateString)[33m;[39m
    [31m[1m>[22m[39m[90m 68 |[39m                 expect(formatted)[33m.[39mtoMatch([35m/\d{1,2}\/\d{1,2}\/\d{4}.*\d{1,2}:\d{2}:\d{2}/[39m)[33m;[39m
     [90m    |[39m                                   [31m[1m^[22m[39m
     [90m 69 |[39m             })[33m;[39m
     [90m 70 |[39m         })[33m;[39m
     [90m 71 |[39m     })[33m;[39m[0m

      at Object.<anonymous> (src/utils/__tests__/index.test.ts:68:35)
      at TestScheduler.scheduleTests (node_modules/@jest/core/build/TestScheduler.js:333:13)
      at runJest (node_modules/@jest/core/build/runJest.js:404:19)
      at _run10000 (node_modules/@jest/core/build/cli/index.js:320:7)
      at runCLI (node_modules/@jest/core/build/cli/index.js:173:3)

  ● Utils › Storage utilities › storage.get › retrieves stored value

    expect(received).toEqual(expected) // deep equality

    Expected: {"name": "John"}
    Received: null

    [0m [90m 205 |[39m                 localStorageMock[33m.[39msetItem([32m'test-key'[39m[33m,[39m [33mJSON[39m[33m.[39mstringify({ name[33m:[39m [32m'John'[39m }))[33m;[39m
     [90m 206 |[39m                 [36mconst[39m result [33m=[39m storage[33m.[39m[36mget[39m([32m'test-key'[39m)[33m;[39m
    [31m[1m>[22m[39m[90m 207 |[39m                 expect(result)[33m.[39mtoEqual({ name[33m:[39m [32m'John'[39m })[33m;[39m
     [90m     |[39m                                [31m[1m^[22m[39m
     [90m 208 |[39m             })[33m;[39m
     [90m 209 |[39m
     [90m 210 |[39m             it([32m'returns null for non-existent key'[39m[33m,[39m () [33m=>[39m {[0m

      at Object.<anonymous> (src/utils/__tests__/index.test.ts:207:32)
      at TestScheduler.scheduleTests (node_modules/@jest/core/build/TestScheduler.js:333:13)
      at runJest (node_modules/@jest/core/build/runJest.js:404:19)
      at _run10000 (node_modules/@jest/core/build/cli/index.js:320:7)
      at runCLI (node_modules/@jest/core/build/cli/index.js:173:3)

Test Suites: 1 failed, 1 total
Tests:       3 failed, 37 passed, 40 total
Snapshots:   0 total
Time:        1.532 s, estimated 3 s
Ran all test suites matching /utils\\__tests__/i.

```

#### Output
```

> frontend@0.1.0 test
> react-scripts test --watchAll=false --passWithNoTests --testPathPattern=utils/__tests__ --watchAll=false --verbose


```

### Hooks Tests
Status: ❌ FAILED

#### Error Details
```
FAIL src/hooks/__tests__/useLocalStorage.test.ts
  useLocalStorage
    √ returns initial value when localStorage is empty (14 ms)
    × returns stored value from localStorage (6 ms)
    √ updates localStorage when value changes (5 ms)
    √ supports function updates (2 ms)
    √ works with complex objects (2 ms)
    √ works with arrays (2 ms)
    √ handles localStorage getItem errors gracefully (2 ms)
    √ handles localStorage setItem errors gracefully (2 ms)
    √ handles invalid JSON in localStorage (2 ms)
    √ works with boolean values (2 ms)
    √ works with null values (1 ms)
    √ persists data across hook re-renders (1 ms)

  ● useLocalStorage › returns stored value from localStorage

    expect(received).toBe(expected) // Object.is equality

    Expected: "stored-value"
    Received: "initial"

    [0m [90m 42 |[39m         [36mconst[39m { result } [33m=[39m renderHook(() [33m=>[39m useLocalStorage([32m'test-key'[39m[33m,[39m [32m'initial'[39m))[33m;[39m
     [90m 43 |[39m
    [31m[1m>[22m[39m[90m 44 |[39m         expect(result[33m.[39mcurrent[[35m0[39m])[33m.[39mtoBe([32m'stored-value'[39m)[33m;[39m
     [90m    |[39m                                   [31m[1m^[22m[39m
     [90m 45 |[39m         expect(localStorageMock[33m.[39mgetItem)[33m.[39mtoHaveBeenCalledWith([32m'test-key'[39m)[33m;[39m
     [90m 46 |[39m     })[33m;[39m
     [90m 47 |[39m[0m

      at Object.<anonymous> (src/hooks/__tests__/useLocalStorage.test.ts:44:35)
      at TestScheduler.scheduleTests (node_modules/@jest/core/build/TestScheduler.js:333:13)
      at runJest (node_modules/@jest/core/build/runJest.js:404:19)
      at _run10000 (node_modules/@jest/core/build/cli/index.js:320:7)
      at runCLI (node_modules/@jest/core/build/cli/index.js:173:3)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 11 passed, 12 total
Snapshots:   0 total
Time:        1.327 s, estimated 3 s
Ran all test suites matching /hooks\\__tests__/i.

```

#### Output
```

> frontend@0.1.0 test
> react-scripts test --watchAll=false --passWithNoTests --testPathPattern=hooks/__tests__ --watchAll=false --verbose


```

### Services Tests
Status: ❌ FAILED

#### Error Details
```
FAIL src/services/__tests__/authService.test.ts
  ● Test suite failed to run

    "auth" is read-only.

    [0m [90m 29 |[39m [36mconst[39m mockDb [33m=[39m {} [36mas[39m any[33m;[39m
     [90m 30 |[39m
    [31m[1m>[22m[39m[90m 31 |[39m (auth [36mas[39m any) [33m=[39m mockAuth[33m;[39m
     [90m    |[39m                         [31m[1m^[22m[39m
     [90m 32 |[39m (db [36mas[39m any) [33m=[39m mockDb[33m;[39m
     [90m 33 |[39m
     [90m 34 |[39m describe([32m'AuthService'[39m[33m,[39m () [33m=>[39m {[0m

      at src/services/__tests__/authService.test.ts:31:25
      at Object.<anonymous> (src/services/__tests__/authService.test.ts:31:25)

FAIL src/services/__tests__/flashcardService.test.ts
  FlashcardService
    getFlashcardSets
      × fetches flashcard sets successfully (1 ms)
      × handles API error (1 ms)
      × fetches sets for specific user (1 ms)
    getFlashcardSet
      × fetches single flashcard set
      × handles not found error
    createFlashcardSet
      × creates new flashcard set (4 ms)
      × validates required fields (19 ms)
    updateFlashcardSet
      × updates existing flashcard set (1 ms)
    deleteFlashcardSet
      × deletes flashcard set (1 ms)
      √ handles delete error
    getFlashcards
      × fetches flashcards for a set (1 ms)
    createFlashcard
      × creates new flashcard (1 ms)
      × validates required fields (3 ms)
    updateFlashcard
      × updates existing flashcard (1 ms)
    deleteFlashcard
      × deletes flashcard
    assignFlashcardSet
      × assigns flashcard set to class
    getStudentProgress
      × fetches student progress for flashcard set
    updateStudentProgress
      × updates student progress
    searchFlashcardSets
      × searches flashcard sets by query
      × searches with filters

  ● FlashcardService › getFlashcardSets › fetches flashcard sets successfully

    TypeError: _flashcardService.flashcardService.getFlashcardSets is not a function

    [0m [90m 40 |[39m             })[33m;[39m
     [90m 41 |[39m
    [31m[1m>[22m[39m[90m 42 |[39m             [36mconst[39m result [33m=[39m [36mawait[39m flashcardService[33m.[39mgetFlashcardSets()[33m;[39m
     [90m    |[39m                                                   [31m[1m^[22m[39m
     [90m 43 |[39m
     [90m 44 |[39m             expect(mockApiService[33m.[39m[36mget[39m)[33m.[39mtoHaveBeenCalledWith([32m'/api/flashcard-sets'[39m)[33m;[39m
     [90m 45 |[39m             expect(result)[33m.[39mtoEqual(mockSets)[33m;[39m[0m

      at Object.<anonymous> (src/services/__tests__/flashcardService.test.ts:42:51)

  ● FlashcardService › getFlashcardSets › handles API error

    TypeError: _flashcardService.flashcardService.getFlashcardSets is not a function

    [0m [90m 52 |[39m             })[33m;[39m
     [90m 53 |[39m
    [31m[1m>[22m[39m[90m 54 |[39m             [36mawait[39m expect(flashcardService[33m.[39mgetFlashcardSets())[33m.[39mrejects[33m.[39mtoThrow(
     [90m    |[39m                                           [31m[1m^[22m[39m
     [90m 55 |[39m                 [32m'Failed to fetch flashcard sets'[39m
     [90m 56 |[39m             )[33m;[39m
     [90m 57 |[39m         })[33m;[39m[0m

      at Object.<anonymous> (src/services/__tests__/flashcardService.test.ts:54:43)

  ● FlashcardService › getFlashcardSets › fetches sets for specific user

    TypeError: _flashcardService.flashcardService.getFlashcardSets is not a function

    [0m [90m 66 |[39m             })[33m;[39m
     [90m 67 |[39m
    [31m[1m>[22m[39m[90m 68 |[39m             [36mawait[39m flashcardService[33m.[39mgetFlashcardSets(userId)[33m;[39m
     [90m    |[39m                                    [31m[1m^[22m[39m
     [90m 69 |[39m
     [90m 70 |[39m             expect(mockApiService[33m.[39m[36mget[39m)[33m.[39mtoHaveBeenCalledWith([32m`/api/flashcard-sets?userId=${userId}`[39m)[33m;[39m
     [90m 71 |[39m         })[33m;[39m[0m

      at Object.<anonymous> (src/services/__tests__/flashcardService.test.ts:68:36)

  ● FlashcardService › getFlashcardSet › fetches single flashcard set

    TypeError: _flashcardService.flashcardService.getFlashcardSet is not a function

    [0m [90m 93 |[39m             })[33m;[39m
     [90m 94 |[39m
    [31m[1m>[22m[39m[90m 95 |[39m             [36mconst[39m result [33m=[39m [36mawait[39m flashcardService[33m.[39mgetFlashcardSet(setId)[33m;[39m
     [90m    |[39m                                                   [31m[1m^[22m[39m
     [90m 96 |[39m
     [90m 97 |[39m             expect(mockApiService[33m.[39m[36mget[39m)[33m.[39mtoHaveBeenCalledWith([32m`/api/flashcard-sets/${setId}`[39m)[33m;[39m
     [90m 98 |[39m             expect(result)[33m.[39mtoEqual(mockSet)[33m;[39m[0m

      at Object.<anonymous> (src/services/__tests__/flashcardService.test.ts:95:51)

  ● FlashcardService › getFlashcardSet › handles not found error

    TypeError: _flashcardService.flashcardService.getFlashcardSet is not a function

    [0m [90m 105 |[39m             })[33m;[39m
     [90m 106 |[39m
    [31m[1m>[22m[39m[90m 107 |[39m             [36mawait[39m expect(flashcardService[33m.[39mgetFlashcardSet([32m'nonexistent'[39m))[33m.[39mrejects[33m.[39mtoThrow(
     [90m     |[39m                                           [31m[1m^[22m[39m
     [90m 108 |[39m                 [32m'Flashcard set not found'[39m
     [90m 109 |[39m             )[33m;[39m
     [90m 110 |[39m         })[33m;[39m[0m

      at Object.<anonymous> (src/services/__tests__/flashcardService.test.ts:107:43)

  ● FlashcardService › createFlashcardSet › creates new flashcard set

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    - Expected
    + Received

    - "/api/flashcard-sets",
    + "/flashcard/set",
      {"description": "A new flashcard set", "difficulty": "medium", "isPublic": false, "title": "New Set"},

    Number of calls: 1

    [0m [90m 135 |[39m             [36mconst[39m result [33m=[39m [36mawait[39m flashcardService[33m.[39mcreateFlashcardSet(newSet)[33m;[39m
     [90m 136 |[39m
    [31m[1m>[22m[39m[90m 137 |[39m             expect(mockApiService[33m.[39mpost)[33m.[39mtoHaveBeenCalledWith([32m'/api/flashcard-sets'[39m[33m,[39m newSet)[33m;[39m
     [90m     |[39m                                         [31m[1m^[22m[39m
     [90m 138 |[39m             expect(result)[33m.[39mtoEqual(createdSet)[33m;[39m
     [90m 139 |[39m         })[33m;[39m
     [90m 140 |[39m[0m

      at Object.<anonymous> (src/services/__tests__/flashcardService.test.ts:137:41)

  ● FlashcardService › createFlashcardSet › validates required fields

    expect(received).rejects.toThrow(expected)

    Expected substring: "Title is required"
    Received message:   "Cannot read properties of undefined (reading 'success')"

        [0m [90m 86 |[39m       setData
         [90m 87 |[39m     )[33m;[39m
        [31m[1m>[22m[39m[90m 88 |[39m     [36mif[39m ([33m![39mresponse[33m.[39msuccess) {
         [90m    |[39m                   [31m[1m^[22m[39m
         [90m 89 |[39m       [36mthrow[39m [36mnew[39m [33mError[39m(response[33m.[39merror [33m||[39m [32m'Failed to create flashcard set'[39m)[33m;[39m
         [90m 90 |[39m     }
         [90m 91 |[39m     [36mreturn[39m response[33m.[39mdata[33m![39m[33m;[39m[0m

      at FlashcardService.createFlashcardSet (src/services/flashcardService.ts:88:19)
      at Object.<anonymous> (src/services/__tests__/flashcardService.test.ts:146:13)
      at Object.toThrow (node_modules/expect/build/index.js:285:22)
      at Object.<anonymous> (src/services/__tests__/flashcardService.test.ts:148:23)

  ● FlashcardService › updateFlashcardSet › updates existing flashcard set

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    - Expected
    + Received

    - "/api/flashcard-sets/set1",
    + "/flashcard/set/set1",
      {"description": "Updated description", "title": "Updated Title"},

    Number of calls: 1

    [0m [90m 171 |[39m             [36mconst[39m result [33m=[39m [36mawait[39m flashcardService[33m.[39mupdateFlashcardSet(setId[33m,[39m updates)[33m;[39m
     [90m 172 |[39m
    [31m[1m>[22m[39m[90m 173 |[39m             expect(mockApiService[33m.[39mput)[33m.[39mtoHaveBeenCalledWith([32m`/api/flashcard-sets/${setId}`[39m[33m,[39m updates)[33m;[39m
     [90m     |[39m                                        [31m[1m^[22m[39m
     [90m 174 |[39m             expect(result)[33m.[39mtoEqual(updatedSet)[33m;[39m
     [90m 175 |[39m         })[33m;[39m
     [90m 176 |[39m     })[33m;[39m[0m

      at Object.<anonymous> (src/services/__tests__/flashcardService.test.ts:173:40)

  ● FlashcardService › deleteFlashcardSet › deletes flashcard set

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    Expected: "/api/flashcard-sets/set1"
    Received: "/flashcard/set/set1"

    Number of calls: 1

    [0m [90m 186 |[39m             [36mawait[39m flashcardService[33m.[39mdeleteFlashcardSet(setId)[33m;[39m
     [90m 187 |[39m
    [31m[1m>[22m[39m[90m 188 |[39m             expect(mockApiService[33m.[39m[36mdelete[39m)[33m.[39mtoHaveBeenCalledWith([32m`/api/flashcard-sets/${setId}`[39m)[33m;[39m
     [90m     |[39m                                           [31m[1m^[22m[39m
     [90m 189 |[39m         })[33m;[39m
     [90m 190 |[39m
     [90m 191 |[39m         it([32m'handles delete error'[39m[33m,[39m [36masync[39m () [33m=>[39m {[0m

      at Object.<anonymous> (src/services/__tests__/flashcardService.test.ts:188:43)

  ● FlashcardService › getFlashcards › fetches flashcards for a set

    TypeError: _flashcardService.flashcardService.getFlashcards is not a function

    [0m [90m 226 |[39m             })[33m;[39m
     [90m 227 |[39m
    [31m[1m>[22m[39m[90m 228 |[39m             [36mconst[39m result [33m=[39m [36mawait[39m flashcardService[33m.[39mgetFlashcards(setId)[33m;[39m
     [90m     |[39m                                                   [31m[1m^[22m[39m
     [90m 229 |[39m
     [90m 230 |[39m             expect(mockApiService[33m.[39m[36mget[39m)[33m.[39mtoHaveBeenCalledWith([32m`/api/flashcard-sets/${setId}/flashcards`[39m)[33m;[39m
     [90m 231 |[39m             expect(result)[33m.[39mtoEqual(mockFlashcards)[33m;[39m[0m

      at Object.<anonymous> (src/services/__tests__/flashcardService.test.ts:228:51)

  ● FlashcardService › createFlashcard › creates new flashcard

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    - Expected
    + Received

    - "/api/flashcard-sets/set1/flashcards",
    + "/flashcard/set/set1/card",
      {"back": "Thẻ mới", "difficulty": "easy", "front": "New Card"},

    Number of calls: 1

    [0m [90m 258 |[39m             [36mconst[39m result [33m=[39m [36mawait[39m flashcardService[33m.[39mcreateFlashcard(setId[33m,[39m newCard)[33m;[39m
     [90m 259 |[39m
    [31m[1m>[22m[39m[90m 260 |[39m             expect(mockApiService[33m.[39mpost)[33m.[39mtoHaveBeenCalledWith(
     [90m     |[39m                                         [31m[1m^[22m[39m
     [90m 261 |[39m                 [32m`/api/flashcard-sets/${setId}/flashcards`[39m[33m,[39m
     [90m 262 |[39m                 newCard
     [90m 263 |[39m             )[33m;[39m[0m

      at Object.<anonymous> (src/services/__tests__/flashcardService.test.ts:260:41)

  ● FlashcardService › createFlashcard › validates required fields

    expect(received).rejects.toThrow(expected)

    Expected substring: "Front text is required"
    Received message:   "Cannot read properties of undefined (reading 'success')"

        [0m [90m 153 |[39m       cardData
         [90m 154 |[39m     )[33m;[39m
        [31m[1m>[22m[39m[90m 155 |[39m     [36mif[39m ([33m![39mresponse[33m.[39msuccess) {
         [90m     |[39m                   [31m[1m^[22m[39m
         [90m 156 |[39m       [36mthrow[39m [36mnew[39m [33mError[39m(response[33m.[39merror [33m||[39m [32m'Failed to create flashcard'[39m)[33m;[39m
         [90m 157 |[39m     }
         [90m 158 |[39m     [36mreturn[39m response[33m.[39mdata[33m![39m[33m;[39m[0m

      at FlashcardService.createFlashcard (src/services/flashcardService.ts:155:19)
      at Object.<anonymous> (src/services/__tests__/flashcardService.test.ts:272:13)
      at Object.toThrow (node_modules/expect/build/index.js:285:22)
      at Object.<anonymous> (src/services/__tests__/flashcardService.test.ts:274:23)

  ● FlashcardService › updateFlashcard › updates existing flashcard

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    - Expected
    + Received

    - "/api/flashcards/card1",
    + "/flashcard/card/card1",
      {"back": "Updated Back", "front": "Updated Front"},

    Number of calls: 1

    [0m [90m 297 |[39m             [36mconst[39m result [33m=[39m [36mawait[39m flashcardService[33m.[39mupdateFlashcard(cardId[33m,[39m updates)[33m;[39m
     [90m 298 |[39m
    [31m[1m>[22m[39m[90m 299 |[39m             expect(mockApiService[33m.[39mput)[33m.[39mtoHaveBeenCalledWith([32m`/api/flashcards/${cardId}`[39m[33m,[39m updates)[33m;[39m
     [90m     |[39m                                        [31m[1m^[22m[39m
     [90m 300 |[39m             expect(result)[33m.[39mtoEqual(updatedCard)[33m;[39m
     [90m 301 |[39m         })[33m;[39m
     [90m 302 |[39m     })[33m;[39m[0m

      at Object.<anonymous> (src/services/__tests__/flashcardService.test.ts:299:40)

  ● FlashcardService › deleteFlashcard › deletes flashcard

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    Expected: "/api/flashcards/card1"
    Received: "/flashcard/card/card1"

    Number of calls: 1

    [0m [90m 312 |[39m             [36mawait[39m flashcardService[33m.[39mdeleteFlashcard(cardId)[33m;[39m
     [90m 313 |[39m
    [31m[1m>[22m[39m[90m 314 |[39m             expect(mockApiService[33m.[39m[36mdelete[39m)[33m.[39mtoHaveBeenCalledWith([32m`/api/flashcards/${cardId}`[39m)[33m;[39m
     [90m     |[39m                                           [31m[1m^[22m[39m
     [90m 315 |[39m         })[33m;[39m
     [90m 316 |[39m     })[33m;[39m
     [90m 317 |[39m[0m

      at Object.<anonymous> (src/services/__tests__/flashcardService.test.ts:314:43)

  ● FlashcardService › assignFlashcardSet › assigns flashcard set to class

    TypeError: Cannot read properties of undefined (reading 'success')

    [0m [90m 123 |[39m       classIds
     [90m 124 |[39m     )[33m;[39m
    [31m[1m>[22m[39m[90m 125 |[39m     [36mif[39m ([33m![39mresponse[33m.[39msuccess) {
     [90m     |[39m                   [31m[1m^[22m[39m
     [90m 126 |[39m       [36mthrow[39m [36mnew[39m [33mError[39m(response[33m.[39merror [33m||[39m [32m'Failed to assign flashcard set'[39m)[33m;[39m
     [90m 127 |[39m     }
     [90m 128 |[39m   }[0m

      at FlashcardService.assignFlashcardSet (src/services/flashcardService.ts:125:19)
      at Object.<anonymous> (src/services/__tests__/flashcardService.test.ts:329:28)

  ● FlashcardService › getStudentProgress › fetches student progress for flashcard set

    TypeError: _flashcardService.flashcardService.getStudentProgress is not a function

    [0m [90m 357 |[39m             })[33m;[39m
     [90m 358 |[39m
    [31m[1m>[22m[39m[90m 359 |[39m             [36mconst[39m result [33m=[39m [36mawait[39m flashcardService[33m.[39mgetStudentProgress(setId[33m,[39m studentId)[33m;[39m
     [90m     |[39m                                                   [31m[1m^[22m[39m
     [90m 360 |[39m
     [90m 361 |[39m             expect(mockApiService[33m.[39m[36mget[39m)[33m.[39mtoHaveBeenCalledWith(
     [90m 362 |[39m                 [32m`/api/flashcard-sets/${setId}/progress/${studentId}`[39m[0m

      at Object.<anonymous> (src/services/__tests__/flashcardService.test.ts:359:51)

  ● FlashcardService › updateStudentProgress › updates student progress

    TypeError: _flashcardService.flashcardService.updateStudentProgress is not a function

    [0m [90m 381 |[39m             })[33m;[39m
     [90m 382 |[39m
    [31m[1m>[22m[39m[90m 383 |[39m             [36mconst[39m result [33m=[39m [36mawait[39m flashcardService[33m.[39mupdateStudentProgress(setId[33m,[39m studentId[33m,[39m progressData)[33m;[39m
     [90m     |[39m                                                   [31m[1m^[22m[39m
     [90m 384 |[39m
     [90m 385 |[39m             expect(mockApiService[33m.[39mpost)[33m.[39mtoHaveBeenCalledWith(
     [90m 386 |[39m                 [32m`/api/flashcard-sets/${setId}/progress/${studentId}`[39m[33m,[39m[0m

      at Object.<anonymous> (src/services/__tests__/flashcardService.test.ts:383:51)

  ● FlashcardService › searchFlashcardSets › searches flashcard sets by query

    TypeError: _flashcardService.flashcardService.searchFlashcardSets is not a function

    [0m [90m 407 |[39m             })[33m;[39m
     [90m 408 |[39m
    [31m[1m>[22m[39m[90m 409 |[39m             [36mconst[39m result [33m=[39m [36mawait[39m flashcardService[33m.[39msearchFlashcardSets(query)[33m;[39m
     [90m     |[39m                                                   [31m[1m^[22m[39m
     [90m 410 |[39m
     [90m 411 |[39m             expect(mockApiService[33m.[39m[36mget[39m)[33m.[39mtoHaveBeenCalledWith(
     [90m 412 |[39m                 [32m`/api/flashcard-sets/search?q=${encodeURIComponent(query)}`[39m[0m

      at Object.<anonymous> (src/services/__tests__/flashcardService.test.ts:409:51)

  ● FlashcardService › searchFlashcardSets › searches with filters

    TypeError: _flashcardService.flashcardService.searchFlashcardSets is not a function

    [0m [90m 427 |[39m             })[33m;[39m
     [90m 428 |[39m
    [31m[1m>[22m[39m[90m 429 |[39m             [36mawait[39m flashcardService[33m.[39msearchFlashcardSets(query[33m,[39m filters)[33m;[39m
     [90m     |[39m                                    [31m[1m^[22m[39m
     [90m 430 |[39m
     [90m 431 |[39m             expect(mockApiService[33m.[39m[36mget[39m)[33m.[39mtoHaveBeenCalledWith(
     [90m 432 |[39m                 [32m`/api/flashcard-sets/search?q=${encodeURIComponent(query)}&difficulty=easy&isPublic=true`[39m[0m

      at Object.<anonymous> (src/services/__tests__/flashcardService.test.ts:429:36)

Test Suites: 2 failed, 2 total
Tests:       19 failed, 1 passed, 20 total
Snapshots:   0 total
Time:        2.157 s, estimated 4 s
Ran all test suites matching /services\\__tests__/i.

```

#### Output
```

> frontend@0.1.0 test
> react-scripts test --watchAll=false --passWithNoTests --testPathPattern=services/__tests__ --watchAll=false --verbose


```

### UI Component Tests
Status: ❌ FAILED

#### Error Details
```
FAIL src/components/ui/__tests__/LoadingSpinner.test.tsx
  LoadingSpinner
    √ renders loading spinner with default props (74 ms)
    √ renders with different sizes (8 ms)
    × renders with custom message (17 ms)
    √ renders with different colors (10 ms)
    √ renders in fullscreen mode (6 ms)
    √ has proper accessibility attributes (10 ms)
    √ renders spinner dots (8 ms)
    √ applies custom className (4 ms)

  ● LoadingSpinner › renders with custom message

    TestingLibraryElementError: Found multiple elements with the text: Loading your flashcards...

    Here are the matching elements:

    Ignored nodes: comments, script, style
    [36m<span[39m
      [33mclass[39m=[32m"message-text"[39m
    [36m>[39m
      [0mLoading your flashcards...[0m
    [36m</span>[39m

    Ignored nodes: comments, script, style
    [36m<span[39m
      [33mclass[39m=[32m"sr-only"[39m
    [36m>[39m
      [0mLoading your flashcards...[0m
    [36m</span>[39m

    (If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).

    Ignored nodes: comments, script, style
    [36m<body>[39m
      [36m<div>[39m
        [36m<div[39m
          [33maria-label[39m=[32m"Loading your flashcards..."[39m
          [33maria-live[39m=[32m"polite"[39m
          [33mclass[39m=[32m"loading-container"[39m
          [33mrole[39m=[32m"status"[39m
        [36m>[39m
          [36m<div[39m
            [33mclass[39m=[32m"loading-spinner spinner-medium spinner-primary"[39m
          [36m>[39m
            [36m<div[39m
              [33mclass[39m=[32m"spinner-circle"[39m
            [36m>[39m
              [36m<div[39m
                [33mclass[39m=[32m"spinner-dot spinner-dot-1"[39m
              [36m/>[39m
              [36m<div[39m
                [33mclass[39m=[32m"spinner-dot spinner-dot-2"[39m
              [36m/>[39m
              [36m<div[39m
                [33mclass[39m=[32m"spinner-dot spinner-dot-3"[39m
              [36m/>[39m
              [36m<div[39m
                [33mclass[39m=[32m"spinner-dot spinner-dot-4"[39m
              [36m/>[39m
              [36m<div[39m
                [33mclass[39m=[32m"spinner-dot spinner-dot-5"[39m
              [36m/>[39m
              [36m<div[39m
                [33mclass[39m=[32m"spinner-dot spinner-dot-6"[39m
              [36m/>[39m
              [36m<div[39m
                [33mclass[39m=[32m"spinner-dot spinner-dot-7"[39m
              [36m/>[39m
              [36m<div[39m
                [33mclass[39m=[32m"spinner-dot spinner-dot-8"[39m
              [36m/>[39m
            [36m</div>[39m
          [36m</div>[39m
          [36m<div[39m
            [33mclass[39m=[32m"loading-message"[39m
          [36m>[39m
            [36m<span[39m
              [33mclass[39m=[32m"message-text"[39m
            [36m>[39m
              [0mLoading your flashcards...[0m
            [36m</span>[39m
            [36m<div[39m
              [33mclass[39m=[32m"message-dots"[39m
            [36m>[39m
              [36m<span[39m
                [33mclass[39m=[32m"dot"[39m
              [36m>[39m
                [0m.[0m
              [36m</span>[39m
              [36m<span[39m
                [33mclass[39m=[32m"dot"[39m
              [36m>[39m
                [0m.[0m
              [36m</span>[39m
              [36m<span[39m
                [33mclass[39m=[32m"dot"[39m
              [36m>[39m
                [0m.[0m
              [36m</span>[39m
            [36m</div>[39m
          [36m</div>[39m
          [36m<span[39m
            [33mclass[39m=[32m"sr-only"[39m
          [36m>[39m
            [0mLoading your flashcards...[0m
          [36m</span>[39m
        [36m</div>[39m
      [36m</div>[39m
    [36m</body>[39m

    [0m [90m 36 |[39m         expect(spinner)[33m.[39mtoHaveAttribute([32m'aria-label'[39m[33m,[39m customMessage)[33m;[39m
     [90m 37 |[39m
    [31m[1m>[22m[39m[90m 38 |[39m         [36mconst[39m messageElement [33m=[39m screen[33m.[39mgetByText(customMessage)[33m;[39m
     [90m    |[39m                                       [31m[1m^[22m[39m
     [90m 39 |[39m         expect(messageElement)[33m.[39mtoBeInTheDocument()[33m;[39m
     [90m 40 |[39m         expect(messageElement)[33m.[39mtoHaveClass([32m'message-text'[39m)[33m;[39m
     [90m 41 |[39m     })[33m;[39m[0m

      at Object.getElementError (node_modules/@testing-library/dom/dist/config.js:37:19)
      at getElementError (node_modules/@testing-library/dom/dist/query-helpers.js:20:35)
      at getMultipleElementsFoundError (node_modules/@testing-library/dom/dist/query-helpers.js:23:10)
      at node_modules/@testing-library/dom/dist/query-helpers.js:55:13
      at getByText (node_modules/@testing-library/dom/dist/query-helpers.js:95:19)
      at Object.<anonymous> (src/components/ui/__tests__/LoadingSpinner.test.tsx:38:39)

FAIL src/components/ui/__tests__/ChildFriendlyCard.test.tsx
  ChildFriendlyCard
    √ renders card with title and children (48 ms)
    √ renders without title (6 ms)
    × renders with different variants (7 ms)
    × renders with different sizes (4 ms)
    × renders clickable card (68 ms)
    √ renders with icon (8 ms)
    √ renders with badge (4 ms)
    × renders loading state (4 ms)
    × renders disabled state (4 ms)
    × has proper accessibility attributes (3 ms)
    × supports keyboard navigation for clickable cards (33 ms)
    √ applies custom className (4 ms)
    √ renders with footer content (14 ms)

  ● ChildFriendlyCard › renders with different variants

    expect(element).toHaveClass("card-primary")

    Expected the element to have class:
      card-primary
    Received:
      card-child

    [0m [90m 35 |[39m
     [90m 36 |[39m         [36mlet[39m card [33m=[39m screen[33m.[39mgetByLabelText([32m'Primary Card'[39m)[33m;[39m
    [31m[1m>[22m[39m[90m 37 |[39m         expect(card)[33m.[39mtoHaveClass([32m'card-primary'[39m)[33m;[39m
     [90m    |[39m                      [31m[1m^[22m[39m
     [90m 38 |[39m
     [90m 39 |[39m         rerender(
     [90m 40 |[39m             [33m<[39m[33mChildFriendlyCard[39m variant[33m=[39m[32m"success"[39m title[33m=[39m[32m"Success Card"[39m[33m>[39m[0m

      at Object.<anonymous> (src/components/ui/__tests__/ChildFriendlyCard.test.tsx:37:22)

  ● ChildFriendlyCard › renders with different sizes

    expect(element).toHaveClass("card-small")

    Expected the element to have class:
      card-small
    Received:
      card-child

    [0m [90m 55 |[39m
     [90m 56 |[39m         [36mlet[39m card [33m=[39m screen[33m.[39mgetByLabelText([32m'Small Card'[39m)[33m;[39m
    [31m[1m>[22m[39m[90m 57 |[39m         expect(card)[33m.[39mtoHaveClass([32m'card-small'[39m)[33m;[39m
     [90m    |[39m                      [31m[1m^[22m[39m
     [90m 58 |[39m
     [90m 59 |[39m         rerender(
     [90m 60 |[39m             [33m<[39m[33mChildFriendlyCard[39m size[33m=[39m[32m"large"[39m title[33m=[39m[32m"Large Card"[39m[33m>[39m[0m

      at Object.<anonymous> (src/components/ui/__tests__/ChildFriendlyCard.test.tsx:57:22)

  ● ChildFriendlyCard › renders clickable card

    TestingLibraryElementError: Unable to find an accessible element with the role "button"

    Here are the accessible roles:

      heading:

      Name "Clickable Card":
      [36m<h3[39m
        [33mclass[39m=[32m"card-title"[39m
      [36m/>[39m

      --------------------------------------------------

    Ignored nodes: comments, script, style
    [36m<body>[39m
      [36m<div>[39m
        [36m<div[39m
          [33maria-label[39m=[32m"Clickable Card"[39m
          [33mclass[39m=[32m"card-child"[39m
        [36m>[39m
          [36m<div[39m
            [33mclass[39m=[32m"card-header"[39m
          [36m>[39m
            [36m<div[39m
              [33mclass[39m=[32m"card-title-section"[39m
            [36m>[39m
              [36m<h3[39m
                [33mclass[39m=[32m"card-title"[39m
              [36m>[39m
                [0mClickable Card[0m
              [36m</h3>[39m
            [36m</div>[39m
          [36m</div>[39m
          [36m<div[39m
            [33mclass[39m=[32m"card-content"[39m
          [36m>[39m
            [0mClick me![0m
          [36m</div>[39m
        [36m</div>[39m
      [36m</div>[39m
    [36m</body>[39m

    [0m [90m 76 |[39m         )[33m;[39m
     [90m 77 |[39m
    [31m[1m>[22m[39m[90m 78 |[39m         [36mconst[39m card [33m=[39m screen[33m.[39mgetByRole([32m'button'[39m)[33m;[39m
     [90m    |[39m                             [31m[1m^[22m[39m
     [90m 79 |[39m         expect(card)[33m.[39mtoHaveClass([32m'interactive'[39m)[33m;[39m
     [90m 80 |[39m
     [90m 81 |[39m         fireEvent[33m.[39mclick(card)[33m;[39m[0m

      at Object.getElementError (node_modules/@testing-library/dom/dist/config.js:37:19)
      at node_modules/@testing-library/dom/dist/query-helpers.js:76:38
      at node_modules/@testing-library/dom/dist/query-helpers.js:52:17
      at getByRole (node_modules/@testing-library/dom/dist/query-helpers.js:95:19)
      at Object.<anonymous> (src/components/ui/__tests__/ChildFriendlyCard.test.tsx:78:29)

  ● ChildFriendlyCard › renders loading state

    TestingLibraryElementError: Unable to find an element with the text: Loading.... This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

    Ignored nodes: comments, script, style
    [36m<body>[39m
      [36m<div>[39m
        [36m<div[39m
          [33maria-label[39m=[32m"Loading Card"[39m
          [33mclass[39m=[32m"card-child"[39m
        [36m>[39m
          [36m<div[39m
            [33mclass[39m=[32m"card-header"[39m
          [36m>[39m
            [36m<div[39m
              [33mclass[39m=[32m"card-title-section"[39m
            [36m>[39m
              [36m<h3[39m
                [33mclass[39m=[32m"card-title"[39m
              [36m>[39m
                [0mLoading Card[0m
              [36m</h3>[39m
            [36m</div>[39m
          [36m</div>[39m
          [36m<div[39m
            [33mclass[39m=[32m"card-content"[39m
          [36m>[39m
            [0mThis content should be hidden[0m
          [36m</div>[39m
        [36m</div>[39m
      [36m</div>[39m
    [36m</body>[39m

    [0m [90m 113 |[39m         )[33m;[39m
     [90m 114 |[39m
    [31m[1m>[22m[39m[90m 115 |[39m         expect(screen[33m.[39mgetByText([32m'Loading...'[39m))[33m.[39mtoBeInTheDocument()[33m;[39m [90m// Loading text[39m
     [90m     |[39m                       [31m[1m^[22m[39m
     [90m 116 |[39m         expect(screen[33m.[39mqueryByText([32m'This content should be hidden'[39m))[33m.[39mnot[33m.[39mtoBeInTheDocument()[33m;[39m
     [90m 117 |[39m     })[33m;[39m
     [90m 118 |[39m[0m

      at Object.getElementError (node_modules/@testing-library/dom/dist/config.js:37:19)
      at node_modules/@testing-library/dom/dist/query-helpers.js:76:38
      at node_modules/@testing-library/dom/dist/query-helpers.js:52:17
      at getByText (node_modules/@testing-library/dom/dist/query-helpers.js:95:19)
      at Object.<anonymous> (src/components/ui/__tests__/ChildFriendlyCard.test.tsx:115:23)

  ● ChildFriendlyCard › renders disabled state

    expect(element).toHaveClass("card-disabled")

    Expected the element to have class:
      card-disabled
    Received:
      card-child

    [0m [90m 127 |[39m
     [90m 128 |[39m         [36mconst[39m card [33m=[39m screen[33m.[39mgetByLabelText([32m'Disabled Card'[39m)[33m;[39m
    [31m[1m>[22m[39m[90m 129 |[39m         expect(card)[33m.[39mtoHaveClass([32m'card-disabled'[39m)[33m;[39m
     [90m     |[39m                      [31m[1m^[22m[39m
     [90m 130 |[39m
     [90m 131 |[39m         fireEvent[33m.[39mclick(card)[33m;[39m
     [90m 132 |[39m         expect(mockOnClick)[33m.[39mnot[33m.[39mtoHaveBeenCalled()[33m;[39m[0m

      at Object.<anonymous> (src/components/ui/__tests__/ChildFriendlyCard.test.tsx:129:22)

  ● ChildFriendlyCard › has proper accessibility attributes

    TestingLibraryElementError: Unable to find a label with the text of: Custom aria label

    Ignored nodes: comments, script, style
    [36m<body>[39m
      [36m<div>[39m
        [36m<div[39m
          [33maria-label[39m=[32m"Accessible Card"[39m
          [33mclass[39m=[32m"card-child"[39m
        [36m>[39m
          [36m<div[39m
            [33mclass[39m=[32m"card-header"[39m
          [36m>[39m
            [36m<div[39m
              [33mclass[39m=[32m"card-title-section"[39m
            [36m>[39m
              [36m<h3[39m
                [33mclass[39m=[32m"card-title"[39m
              [36m>[39m
                [0mAccessible Card[0m
              [36m</h3>[39m
            [36m</div>[39m
          [36m</div>[39m
          [36m<div[39m
            [33mclass[39m=[32m"card-content"[39m
          [36m>[39m
            [0mAccessible content[0m
          [36m</div>[39m
        [36m</div>[39m
      [36m</div>[39m
    [36m</body>[39m

    [0m [90m 144 |[39m         )[33m;[39m
     [90m 145 |[39m
    [31m[1m>[22m[39m[90m 146 |[39m         [36mconst[39m card [33m=[39m screen[33m.[39mgetByLabelText([32m'Custom aria label'[39m)[33m;[39m
     [90m     |[39m                             [31m[1m^[22m[39m
     [90m 147 |[39m         expect(card)[33m.[39mtoHaveAttribute([32m'aria-label'[39m[33m,[39m [32m'Custom aria label'[39m)[33m;[39m
     [90m 148 |[39m         expect(card)[33m.[39mtoHaveAttribute([32m'aria-describedby'[39m[33m,[39m [32m'description-id'[39m)[33m;[39m
     [90m 149 |[39m     })[33m;[39m[0m

      at Object.getElementError (node_modules/@testing-library/dom/dist/config.js:37:19)
      at getAllByLabelText (node_modules/@testing-library/dom/dist/queries/label-text.js:111:38)
      at node_modules/@testing-library/dom/dist/query-helpers.js:52:17
      at getByLabelText (node_modules/@testing-library/dom/dist/query-helpers.js:95:19)
      at Object.<anonymous> (src/components/ui/__tests__/ChildFriendlyCard.test.tsx:146:29)

  ● ChildFriendlyCard › supports keyboard navigation for clickable cards

    TestingLibraryElementError: Unable to find an accessible element with the role "button"

    Here are the accessible roles:

      heading:

      Name "Keyboard Card":
      [36m<h3[39m
        [33mclass[39m=[32m"card-title"[39m
      [36m/>[39m

      --------------------------------------------------

    Ignored nodes: comments, script, style
    [36m<body>[39m
      [36m<div>[39m
        [36m<div[39m
          [33maria-label[39m=[32m"Keyboard Card"[39m
          [33mclass[39m=[32m"card-child"[39m
        [36m>[39m
          [36m<div[39m
            [33mclass[39m=[32m"card-header"[39m
          [36m>[39m
            [36m<div[39m
              [33mclass[39m=[32m"card-title-section"[39m
            [36m>[39m
              [36m<h3[39m
                [33mclass[39m=[32m"card-title"[39m
              [36m>[39m
                [0mKeyboard Card[0m
              [36m</h3>[39m
            [36m</div>[39m
          [36m</div>[39m
          [36m<div[39m
            [33mclass[39m=[32m"card-content"[39m
          [36m>[39m
            [0mKeyboard accessible[0m
          [36m</div>[39m
        [36m</div>[39m
      [36m</div>[39m
    [36m</body>[39m

    [0m [90m 158 |[39m         )[33m;[39m
     [90m 159 |[39m
    [31m[1m>[22m[39m[90m 160 |[39m         [36mconst[39m card [33m=[39m screen[33m.[39mgetByRole([32m'button'[39m)[33m;[39m
     [90m     |[39m                             [31m[1m^[22m[39m
     [90m 161 |[39m
     [90m 162 |[39m         [90m// Test Enter key[39m
     [90m 163 |[39m         fireEvent[33m.[39mkeyDown(card[33m,[39m { key[33m:[39m [32m'Enter'[39m[33m,[39m code[33m:[39m [32m'Enter'[39m })[33m;[39m[0m

      at Object.getElementError (node_modules/@testing-library/dom/dist/config.js:37:19)
      at node_modules/@testing-library/dom/dist/query-helpers.js:76:38
      at node_modules/@testing-library/dom/dist/query-helpers.js:52:17
      at getByRole (node_modules/@testing-library/dom/dist/query-helpers.js:95:19)
      at Object.<anonymous> (src/components/ui/__tests__/ChildFriendlyCard.test.tsx:160:29)

FAIL src/components/ui/__tests__/ChildFriendlyButton.test.tsx
  ChildFriendlyButton
    √ renders button with text (78 ms)
    √ calls onClick when clicked (16 ms)
    √ renders with different variants (24 ms)
    √ renders with different sizes (14 ms)
    √ renders disabled state correctly (10 ms)
    √ does not call onClick when disabled (9 ms)
    × renders with icon (28 ms)
    × renders icon-only button (18 ms)
    √ renders loading state (10 ms)
    √ does not call onClick when loading (8 ms)
    √ has proper accessibility attributes (5 ms)
    √ supports different button types (9 ms)
    √ applies custom className (5 ms)
    √ has hover bounce class (18 ms)

  ● ChildFriendlyButton › renders with icon

    TestingLibraryElementError: Unable to find an accessible element with the role "img"

    Here are the accessible roles:

      button:

      Name "With Icon":
      [36m<button[39m
        [33maria-busy[39m=[32m"false"[39m
        [33maria-label[39m=[32m"With Icon"[39m
        [33mclass[39m=[32m"btn-child btn-primary hover-bounce"[39m
        [33mtype[39m=[32m"button"[39m
      [36m/>[39m

      --------------------------------------------------

    Ignored nodes: comments, script, style
    [36m<body>[39m
      [36m<div>[39m
        [36m<button[39m
          [33maria-busy[39m=[32m"false"[39m
          [33maria-label[39m=[32m"With Icon"[39m
          [33mclass[39m=[32m"btn-child btn-primary hover-bounce"[39m
          [33mtype[39m=[32m"button"[39m
        [36m>[39m
          [36m<span[39m
            [33maria-hidden[39m=[32m"true"[39m
            [33mclass[39m=[32m"btn-icon-emoji"[39m
            [33mrole[39m=[32m"img"[39m
          [36m>[39m
            [0m🎯[0m
          [36m</span>[39m
          [0mWith Icon[0m
        [36m</button>[39m
      [36m</div>[39m
    [36m</body>[39m

    [0m [90m 91 |[39m         )[33m;[39m
     [90m 92 |[39m
    [31m[1m>[22m[39m[90m 93 |[39m         [36mconst[39m icon [33m=[39m screen[33m.[39mgetByRole([32m'img'[39m)[33m;[39m
     [90m    |[39m                             [31m[1m^[22m[39m
     [90m 94 |[39m         expect(icon)[33m.[39mtoBeInTheDocument()[33m;[39m
     [90m 95 |[39m         expect(icon)[33m.[39mtoHaveTextContent([32m'🎯'[39m)[33m;[39m
     [90m 96 |[39m         expect(icon)[33m.[39mtoHaveClass([32m'btn-icon-emoji'[39m)[33m;[39m[0m

      at Object.getElementError (node_modules/@testing-library/dom/dist/config.js:37:19)
      at node_modules/@testing-library/dom/dist/query-helpers.js:76:38
      at node_modules/@testing-library/dom/dist/query-helpers.js:52:17
      at getByRole (node_modules/@testing-library/dom/dist/query-helpers.js:95:19)
      at Object.<anonymous> (src/components/ui/__tests__/ChildFriendlyButton.test.tsx:93:29)

  ● ChildFriendlyButton › renders icon-only button

    TestingLibraryElementError: Unable to find an accessible element with the role "img"

    Here are the accessible roles:

      button:

      Name "Target":
      [36m<button[39m
        [33maria-busy[39m=[32m"false"[39m
        [33maria-label[39m=[32m"Target"[39m
        [33mclass[39m=[32m"btn-child btn-primary btn-icon hover-bounce"[39m
        [33mtype[39m=[32m"button"[39m
      [36m/>[39m

      --------------------------------------------------

    Ignored nodes: comments, script, style
    [36m<body>[39m
      [36m<div>[39m
        [36m<button[39m
          [33maria-busy[39m=[32m"false"[39m
          [33maria-label[39m=[32m"Target"[39m
          [33mclass[39m=[32m"btn-child btn-primary btn-icon hover-bounce"[39m
          [33mtype[39m=[32m"button"[39m
        [36m>[39m
          [36m<span[39m
            [33maria-hidden[39m=[32m"true"[39m
            [33mclass[39m=[32m"btn-icon-emoji"[39m
            [33mrole[39m=[32m"img"[39m
          [36m>[39m
            [0m🎯[0m
          [36m</span>[39m
        [36m</button>[39m
      [36m</div>[39m
    [36m</body>[39m

    [0m [90m 106 |[39m         expect(button)[33m.[39mtoHaveClass([32m'btn-icon'[39m)[33m;[39m
     [90m 107 |[39m
    [31m[1m>[22m[39m[90m 108 |[39m         [36mconst[39m icon [33m=[39m screen[33m.[39mgetByRole([32m'img'[39m)[33m;[39m
     [90m     |[39m                             [31m[1m^[22m[39m
     [90m 109 |[39m         expect(icon)[33m.[39mtoBeInTheDocument()[33m;[39m
     [90m 110 |[39m     })[33m;[39m
     [90m 111 |[39m[0m

      at Object.getElementError (node_modules/@testing-library/dom/dist/config.js:37:19)
      at node_modules/@testing-library/dom/dist/query-helpers.js:76:38
      at node_modules/@testing-library/dom/dist/query-helpers.js:52:17
      at getByRole (node_modules/@testing-library/dom/dist/query-helpers.js:95:19)
      at Object.<anonymous> (src/components/ui/__tests__/ChildFriendlyButton.test.tsx:108:29)

FAIL src/components/ui/__tests__/ProgressIndicator.test.tsx
  ProgressIndicator
    × renders progress bar with percentage (48 ms)
    × displays percentage text (4 ms)
    × displays custom label (3 ms)
    × renders with different sizes (4 ms)
    × renders with different variants (3 ms)
    × renders animated progress (4 ms)
    × renders striped progress (2 ms)
    × calculates percentage correctly with custom max (2 ms)
    × handles zero value (3 ms)
    × handles maximum value (2 ms)
    × clamps value above maximum (2 ms)
    × clamps negative values to zero (3 ms)
    × renders with custom format function (2 ms)
    × renders child-friendly version (3 ms)
    × has proper accessibility attributes (3 ms)
    √ renders with steps/milestones (106 ms)
    × applies custom className (1 ms)
    × renders indeterminate progress (3 ms)

  ● ProgressIndicator › renders progress bar with percentage

    TypeError: Cannot read properties of undefined (reading 'map')

    [0m [90m 83 |[39m
     [90m 84 |[39m       [33m<[39m[33mdiv[39m className[33m=[39m[32m"progress-steps"[39m[33m>[39m
    [31m[1m>[22m[39m[90m 85 |[39m         {steps[33m.[39mmap((step[33m,[39m index) [33m=>[39m {
     [90m    |[39m                [31m[1m^[22m[39m
     [90m 86 |[39m           [36mconst[39m isActive [33m=[39m step[33m.[39mid [33m===[39m currentStep [33m||[39m step[33m.[39mstatus [33m===[39m [32m'active'[39m[33m;[39m
     [90m 87 |[39m           [36mconst[39m isCompleted [33m=[39m step[33m.[39mstatus [33m===[39m [32m'completed'[39m[33m;[39m
     [90m 88 |[39m           [36mconst[39m isError [33m=[39m step[33m.[39mstatus [33m===[39m [32m'error'[39m[33m;[39m[0m

      at ProgressIndicator (src/components/ui/ProgressIndicator.tsx:85:16)
      at Object.react_stack_bottom_frame (node_modules/react-dom/cjs/react-dom-client.development.js:23863:20)
      at renderWithHooks (node_modules/react-dom/cjs/react-dom-client.development.js:5529:22)
      at updateFunctionComponent (node_modules/react-dom/cjs/react-dom-client.development.js:8897:19)
      at beginWork (node_modules/react-dom/cjs/react-dom-client.development.js:10522:18)
      at runWithFiberInDEV (node_modules/react-dom/cjs/react-dom-client.development.js:1522:13)
      at performUnitOfWork (node_modules/react-dom/cjs/react-dom-client.development.js:15140:22)
      at workLoopSync (node_modules/react-dom/cjs/react-dom-client.development.js:14956:41)
      at renderRootSync (node_modules/react-dom/cjs/react-dom-client.development.js:14936:11)
      at performWorkOnRoot (node_modules/react-dom/cjs/react-dom-client.development.js:14462:44)
      at performWorkOnRootViaSchedulerTask (node_modules/react-dom/cjs/react-dom-client.development.js:16216:7)
      at flushActQueue (node_modules/react/cjs/react.development.js:566:34)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (node_modules/react/cjs/react.development.js:860:10)
      at node_modules/@testing-library/react/dist/act-compat.js:47:25
      at renderRoot (node_modules/@testing-library/react/dist/pure.js:190:26)
      at render (node_modules/@testing-library/react/dist/pure.js:292:10)
      at Object.<anonymous> (src/components/ui/__tests__/ProgressIndicator.test.tsx:8:15)

  ● ProgressIndicator › displays percentage text

    TypeError: Cannot read properties of undefined (reading 'map')

    [0m [90m 83 |[39m
     [90m 84 |[39m       [33m<[39m[33mdiv[39m className[33m=[39m[32m"progress-steps"[39m[33m>[39m
    [31m[1m>[22m[39m[90m 85 |[39m         {steps[33m.[39mmap((step[33m,[39m index) [33m=>[39m {
     [90m    |[39m                [31m[1m^[22m[39m
     [90m 86 |[39m           [36mconst[39m isActive [33m=[39m step[33m.[39mid [33m===[39m currentStep [33m||[39m step[33m.[39mstatus [33m===[39m [32m'active'[39m[33m;[39m
     [90m 87 |[39m           [36mconst[39m isCompleted [33m=[39m step[33m.[39mstatus [33m===[39m [32m'completed'[39m[33m;[39m
     [90m 88 |[39m           [36mconst[39m isError [33m=[39m step[33m.[39mstatus [33m===[39m [32m'error'[39m[33m;[39m[0m

      at ProgressIndicator (src/components/ui/ProgressIndicator.tsx:85:16)
      at Object.react_stack_bottom_frame (node_modules/react-dom/cjs/react-dom-client.development.js:23863:20)
      at renderWithHooks (node_modules/react-dom/cjs/react-dom-client.development.js:5529:22)
      at updateFunctionComponent (node_modules/react-dom/cjs/react-dom-client.development.js:8897:19)
      at beginWork (node_modules/react-dom/cjs/react-dom-client.development.js:10522:18)
      at runWithFiberInDEV (node_modules/react-dom/cjs/react-dom-client.development.js:1522:13)
      at performUnitOfWork (node_modules/react-dom/cjs/react-dom-client.development.js:15140:22)
      at workLoopSync (node_modules/react-dom/cjs/react-dom-client.development.js:14956:41)
      at renderRootSync (node_modules/react-dom/cjs/react-dom-client.development.js:14936:11)
      at performWorkOnRoot (node_modules/react-dom/cjs/react-dom-client.development.js:14462:44)
      at performWorkOnRootViaSchedulerTask (node_modules/react-dom/cjs/react-dom-client.development.js:16216:7)
      at flushActQueue (node_modules/react/cjs/react.development.js:566:34)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (node_modules/react/cjs/react.development.js:860:10)
      at node_modules/@testing-library/react/dist/act-compat.js:47:25
      at renderRoot (node_modules/@testing-library/react/dist/pure.js:190:26)
      at render (node_modules/@testing-library/react/dist/pure.js:292:10)
      at Object.<anonymous> (src/components/ui/__tests__/ProgressIndicator.test.tsx:17:15)

  ● ProgressIndicator › displays custom label

    TypeError: Cannot read properties of undefined (reading 'map')

    [0m [90m 83 |[39m
     [90m 84 |[39m       [33m<[39m[33mdiv[39m className[33m=[39m[32m"progress-steps"[39m[33m>[39m
    [31m[1m>[22m[39m[90m 85 |[39m         {steps[33m.[39mmap((step[33m,[39m index) [33m=>[39m {
     [90m    |[39m                [31m[1m^[22m[39m
     [90m 86 |[39m           [36mconst[39m isActive [33m=[39m step[33m.[39mid [33m===[39m currentStep [33m||[39m step[33m.[39mstatus [33m===[39m [32m'active'[39m[33m;[39m
     [90m 87 |[39m           [36mconst[39m isCompleted [33m=[39m step[33m.[39mstatus [33m===[39m [32m'completed'[39m[33m;[39m
     [90m 88 |[39m           [36mconst[39m isError [33m=[39m step[33m.[39mstatus [33m===[39m [32m'error'[39m[33m;[39m[0m

      at ProgressIndicator (src/components/ui/ProgressIndicator.tsx:85:16)
      at Object.react_stack_bottom_frame (node_modules/react-dom/cjs/react-dom-client.development.js:23863:20)
      at renderWithHooks (node_modules/react-dom/cjs/react-dom-client.development.js:5529:22)
      at updateFunctionComponent (node_modules/react-dom/cjs/react-dom-client.development.js:8897:19)
      at beginWork (node_modules/react-dom/cjs/react-dom-client.development.js:10522:18)
      at runWithFiberInDEV (node_modules/react-dom/cjs/react-dom-client.development.js:1522:13)
      at performUnitOfWork (node_modules/react-dom/cjs/react-dom-client.development.js:15140:22)
      at workLoopSync (node_modules/react-dom/cjs/react-dom-client.development.js:14956:41)
      at renderRootSync (node_modules/react-dom/cjs/react-dom-client.development.js:14936:11)
      at performWorkOnRoot (node_modules/react-dom/cjs/react-dom-client.development.js:14462:44)
      at performWorkOnRootViaSchedulerTask (node_modules/react-dom/cjs/react-dom-client.development.js:16216:7)
      at flushActQueue (node_modules/react/cjs/react.development.js:566:34)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (node_modules/react/cjs/react.development.js:860:10)
      at node_modules/@testing-library/react/dist/act-compat.js:47:25
      at renderRoot (node_modules/@testing-library/react/dist/pure.js:190:26)
      at render (node_modules/@testing-library/react/dist/pure.js:292:10)
      at Object.<anonymous> (src/components/ui/__tests__/ProgressIndicator.test.tsx:23:15)

  ● ProgressIndicator › renders with different sizes

    TypeError: Cannot read properties of undefined (reading 'map')

    [0m [90m 83 |[39m
     [90m 84 |[39m       [33m<[39m[33mdiv[39m className[33m=[39m[32m"progress-steps"[39m[33m>[39m
    [31m[1m>[22m[39m[90m 85 |[39m         {steps[33m.[39mmap((step[33m,[39m index) [33m=>[39m {
     [90m    |[39m                [31m[1m^[22m[39m
     [90m 86 |[39m           [36mconst[39m isActive [33m=[39m step[33m.[39mid [33m===[39m currentStep [33m||[39m step[33m.[39mstatus [33m===[39m [32m'active'[39m[33m;[39m
     [90m 87 |[39m           [36mconst[39m isCompleted [33m=[39m step[33m.[39mstatus [33m===[39m [32m'completed'[39m[33m;[39m
     [90m 88 |[39m           [36mconst[39m isError [33m=[39m step[33m.[39mstatus [33m===[39m [32m'error'[39m[33m;[39m[0m

      at ProgressIndicator (src/components/ui/ProgressIndicator.tsx:85:16)
      at Object.react_stack_bottom_frame (node_modules/react-dom/cjs/react-dom-client.development.js:23863:20)
      at renderWithHooks (node_modules/react-dom/cjs/react-dom-client.development.js:5529:22)
      at updateFunctionComponent (node_modules/react-dom/cjs/react-dom-client.development.js:8897:19)
      at beginWork (node_modules/react-dom/cjs/react-dom-client.development.js:10522:18)
      at runWithFiberInDEV (node_modules/react-dom/cjs/react-dom-client.development.js:1522:13)
      at performUnitOfWork (node_modules/react-dom/cjs/react-dom-client.development.js:15140:22)
      at workLoopSync (node_modules/react-dom/cjs/react-dom-client.development.js:14956:41)
      at renderRootSync (node_modules/react-dom/cjs/react-dom-client.development.js:14936:11)
      at performWorkOnRoot (node_modules/react-dom/cjs/react-dom-client.development.js:14462:44)
      at performWorkOnRootViaSchedulerTask (node_modules/react-dom/cjs/react-dom-client.development.js:16216:7)
      at flushActQueue (node_modules/react/cjs/react.development.js:566:34)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (node_modules/react/cjs/react.development.js:860:10)
      at node_modules/@testing-library/react/dist/act-compat.js:47:25
      at renderRoot (node_modules/@testing-library/react/dist/pure.js:190:26)
      at render (node_modules/@testing-library/react/dist/pure.js:292:10)
      at Object.<anonymous> (src/components/ui/__tests__/ProgressIndicator.test.tsx:35:36)

  ● ProgressIndicator › renders with different variants

    TypeError: Cannot read properties of undefined (reading 'map')

    [0m [90m 83 |[39m
     [90m 84 |[39m       [33m<[39m[33mdiv[39m className[33m=[39m[32m"progress-steps"[39m[33m>[39m
    [31m[1m>[22m[39m[90m 85 |[39m         {steps[33m.[39mmap((step[33m,[39m index) [33m=>[39m {
     [90m    |[39m                [31m[1m^[22m[39m
     [90m 86 |[39m           [36mconst[39m isActive [33m=[39m step[33m.[39mid [33m===[39m currentStep [33m||[39m step[33m.[39mstatus [33m===[39m [32m'active'[39m[33m;[39m
     [90m 87 |[39m           [36mconst[39m isCompleted [33m=[39m step[33m.[39mstatus [33m===[39m [32m'completed'[39m[33m;[39m
     [90m 88 |[39m           [36mconst[39m isError [33m=[39m step[33m.[39mstatus [33m===[39m [32m'error'[39m[33m;[39m[0m

      at ProgressIndicator (src/components/ui/ProgressIndicator.tsx:85:16)
      at Object.react_stack_bottom_frame (node_modules/react-dom/cjs/react-dom-client.development.js:23863:20)
      at renderWithHooks (node_modules/react-dom/cjs/react-dom-client.development.js:5529:22)
      at updateFunctionComponent (node_modules/react-dom/cjs/react-dom-client.development.js:8897:19)
      at beginWork (node_modules/react-dom/cjs/react-dom-client.development.js:10522:18)
      at runWithFiberInDEV (node_modules/react-dom/cjs/react-dom-client.development.js:1522:13)
      at performUnitOfWork (node_modules/react-dom/cjs/react-dom-client.development.js:15140:22)
      at workLoopSync (node_modules/react-dom/cjs/react-dom-client.development.js:14956:41)
      at renderRootSync (node_modules/react-dom/cjs/react-dom-client.development.js:14936:11)
      at performWorkOnRoot (node_modules/react-dom/cjs/react-dom-client.development.js:14462:44)
      at performWorkOnRootViaSchedulerTask (node_modules/react-dom/cjs/react-dom-client.development.js:16216:7)
      at flushActQueue (node_modules/react/cjs/react.development.js:566:34)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (node_modules/react/cjs/react.development.js:860:10)
      at node_modules/@testing-library/react/dist/act-compat.js:47:25
      at renderRoot (node_modules/@testing-library/react/dist/pure.js:190:26)
      at render (node_modules/@testing-library/react/dist/pure.js:292:10)
      at Object.<anonymous> (src/components/ui/__tests__/ProgressIndicator.test.tsx:49:36)

  ● ProgressIndicator › renders animated progress

    TypeError: Cannot read properties of undefined (reading 'map')

    [0m [90m 83 |[39m
     [90m 84 |[39m       [33m<[39m[33mdiv[39m className[33m=[39m[32m"progress-steps"[39m[33m>[39m
    [31m[1m>[22m[39m[90m 85 |[39m         {steps[33m.[39mmap((step[33m,[39m index) [33m=>[39m {
     [90m    |[39m                [31m[1m^[22m[39m
     [90m 86 |[39m           [36mconst[39m isActive [33m=[39m step[33m.[39mid [33m===[39m currentStep [33m||[39m step[33m.[39mstatus [33m===[39m [32m'active'[39m[33m;[39m
     [90m 87 |[39m           [36mconst[39m isCompleted [33m=[39m step[33m.[39mstatus [33m===[39m [32m'completed'[39m[33m;[39m
     [90m 88 |[39m           [36mconst[39m isError [33m=[39m step[33m.[39mstatus [33m===[39m [32m'error'[39m[33m;[39m[0m

      at ProgressIndicator (src/components/ui/ProgressIndicator.tsx:85:16)
      at Object.react_stack_bottom_frame (node_modules/react-dom/cjs/react-dom-client.development.js:23863:20)
      at renderWithHooks (node_modules/react-dom/cjs/react-dom-client.development.js:5529:22)
      at updateFunctionComponent (node_modules/react-dom/cjs/react-dom-client.development.js:8897:19)
      at beginWork (node_modules/react-dom/cjs/react-dom-client.development.js:10522:18)
      at runWithFiberInDEV (node_modules/react-dom/cjs/react-dom-client.development.js:1522:13)
      at performUnitOfWork (node_modules/react-dom/cjs/react-dom-client.development.js:15140:22)
      at workLoopSync (node_modules/react-dom/cjs/react-dom-client.development.js:14956:41)
      at renderRootSync (node_modules/react-dom/cjs/react-dom-client.development.js:14936:11)
      at performWorkOnRoot (node_modules/react-dom/cjs/react-dom-client.development.js:14462:44)
      at performWorkOnRootViaSchedulerTask (node_modules/react-dom/cjs/react-dom-client.development.js:16216:7)
      at flushActQueue (node_modules/react/cjs/react.development.js:566:34)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (node_modules/react/cjs/react.development.js:860:10)
      at node_modules/@testing-library/react/dist/act-compat.js:47:25
      at renderRoot (node_modules/@testing-library/react/dist/pure.js:190:26)
      at render (node_modules/@testing-library/react/dist/pure.js:292:10)
      at Object.<anonymous> (src/components/ui/__tests__/ProgressIndicator.test.tsx:63:15)

  ● ProgressIndicator › renders striped progress

    TypeError: Cannot read properties of undefined (reading 'map')

    [0m [90m 83 |[39m
     [90m 84 |[39m       [33m<[39m[33mdiv[39m className[33m=[39m[32m"progress-steps"[39m[33m>[39m
    [31m[1m>[22m[39m[90m 85 |[39m         {steps[33m.[39mmap((step[33m,[39m index) [33m=>[39m {
     [90m    |[39m                [31m[1m^[22m[39m
     [90m 86 |[39m           [36mconst[39m isActive [33m=[39m step[33m.[39mid [33m===[39m currentStep [33m||[39m step[33m.[39mstatus [33m===[39m [32m'active'[39m[33m;[39m
     [90m 87 |[39m           [36mconst[39m isCompleted [33m=[39m step[33m.[39mstatus [33m===[39m [32m'completed'[39m[33m;[39m
     [90m 88 |[39m           [36mconst[39m isError [33m=[39m step[33m.[39mstatus [33m===[39m [32m'error'[39m[33m;[39m[0m

      at ProgressIndicator (src/components/ui/ProgressIndicator.tsx:85:16)
      at Object.react_stack_bottom_frame (node_modules/react-dom/cjs/react-dom-client.development.js:23863:20)
      at renderWithHooks (node_modules/react-dom/cjs/react-dom-client.development.js:5529:22)
      at updateFunctionComponent (node_modules/react-dom/cjs/react-dom-client.development.js:8897:19)
      at beginWork (node_modules/react-dom/cjs/react-dom-client.development.js:10522:18)
      at runWithFiberInDEV (node_modules/react-dom/cjs/react-dom-client.development.js:1522:13)
      at performUnitOfWork (node_modules/react-dom/cjs/react-dom-client.development.js:15140:22)
      at workLoopSync (node_modules/react-dom/cjs/react-dom-client.development.js:14956:41)
      at renderRootSync (node_modules/react-dom/cjs/react-dom-client.development.js:14936:11)
      at performWorkOnRoot (node_modules/react-dom/cjs/react-dom-client.development.js:14462:44)
      at performWorkOnRootViaSchedulerTask (node_modules/react-dom/cjs/react-dom-client.development.js:16216:7)
      at flushActQueue (node_modules/react/cjs/react.development.js:566:34)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (node_modules/react/cjs/react.development.js:860:10)
      at node_modules/@testing-library/react/dist/act-compat.js:47:25
      at renderRoot (node_modules/@testing-library/react/dist/pure.js:190:26)
      at render (node_modules/@testing-library/react/dist/pure.js:292:10)
      at Object.<anonymous> (src/components/ui/__tests__/ProgressIndicator.test.tsx:70:15)

  ● ProgressIndicator › calculates percentage correctly with custom max

    TypeError: Cannot read properties of undefined (reading 'map')

    [0m [90m 83 |[39m
     [90m 84 |[39m       [33m<[39m[33mdiv[39m className[33m=[39m[32m"progress-steps"[39m[33m>[39m
    [31m[1m>[22m[39m[90m 85 |[39m         {steps[33m.[39mmap((step[33m,[39m index) [33m=>[39m {
     [90m    |[39m                [31m[1m^[22m[39m
     [90m 86 |[39m           [36mconst[39m isActive [33m=[39m step[33m.[39mid [33m===[39m currentStep [33m||[39m step[33m.[39mstatus [33m===[39m [32m'active'[39m[33m;[39m
     [90m 87 |[39m           [36mconst[39m isCompleted [33m=[39m step[33m.[39mstatus [33m===[39m [32m'completed'[39m[33m;[39m
     [90m 88 |[39m           [36mconst[39m isError [33m=[39m step[33m.[39mstatus [33m===[39m [32m'error'[39m[33m;[39m[0m

      at ProgressIndicator (src/components/ui/ProgressIndicator.tsx:85:16)
      at Object.react_stack_bottom_frame (node_modules/react-dom/cjs/react-dom-client.development.js:23863:20)
      at renderWithHooks (node_modules/react-dom/cjs/react-dom-client.development.js:5529:22)
      at updateFunctionComponent (node_modules/react-dom/cjs/react-dom-client.development.js:8897:19)
      at beginWork (node_modules/react-dom/cjs/react-dom-client.development.js:10522:18)
      at runWithFiberInDEV (node_modules/react-dom/cjs/react-dom-client.development.js:1522:13)
      at performUnitOfWork (node_modules/react-dom/cjs/react-dom-client.development.js:15140:22)
      at workLoopSync (node_modules/react-dom/cjs/react-dom-client.development.js:14956:41)
      at renderRootSync (node_modules/react-dom/cjs/react-dom-client.development.js:14936:11)
      at performWorkOnRoot (node_modules/react-dom/cjs/react-dom-client.development.js:14462:44)
      at performWorkOnRootViaSchedulerTask (node_modules/react-dom/cjs/react-dom-client.development.js:16216:7)
      at flushActQueue (node_modules/react/cjs/react.development.js:566:34)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (node_modules/react/cjs/react.development.js:860:10)
      at node_modules/@testing-library/react/dist/act-compat.js:47:25
      at renderRoot (node_modules/@testing-library/react/dist/pure.js:190:26)
      at render (node_modules/@testing-library/react/dist/pure.js:292:10)
      at Object.<anonymous> (src/components/ui/__tests__/ProgressIndicator.test.tsx:77:15)

  ● ProgressIndicator › handles zero value

    TypeError: Cannot read properties of undefined (reading 'map')

    [0m [90m 83 |[39m
     [90m 84 |[39m       [33m<[39m[33mdiv[39m className[33m=[39m[32m"progress-steps"[39m[33m>[39m
    [31m[1m>[22m[39m[90m 85 |[39m         {steps[33m.[39mmap((step[33m,[39m index) [33m=>[39m {
     [90m    |[39m                [31m[1m^[22m[39m
     [90m 86 |[39m           [36mconst[39m isActive [33m=[39m step[33m.[39mid [33m===[39m currentStep [33m||[39m step[33m.[39mstatus [33m===[39m [32m'active'[39m[33m;[39m
     [90m 87 |[39m           [36mconst[39m isCompleted [33m=[39m step[33m.[39mstatus [33m===[39m [32m'completed'[39m[33m;[39m
     [90m 88 |[39m           [36mconst[39m isError [33m=[39m step[33m.[39mstatus [33m===[39m [32m'error'[39m[33m;[39m[0m

      at ProgressIndicator (src/components/ui/ProgressIndicator.tsx:85:16)
      at Object.react_stack_bottom_frame (node_modules/react-dom/cjs/react-dom-client.development.js:23863:20)
      at renderWithHooks (node_modules/react-dom/cjs/react-dom-client.development.js:5529:22)
      at updateFunctionComponent (node_modules/react-dom/cjs/react-dom-client.development.js:8897:19)
      at beginWork (node_modules/react-dom/cjs/react-dom-client.development.js:10522:18)
      at runWithFiberInDEV (node_modules/react-dom/cjs/react-dom-client.development.js:1522:13)
      at performUnitOfWork (node_modules/react-dom/cjs/react-dom-client.development.js:15140:22)
      at workLoopSync (node_modules/react-dom/cjs/react-dom-client.development.js:14956:41)
      at renderRootSync (node_modules/react-dom/cjs/react-dom-client.development.js:14936:11)
      at performWorkOnRoot (node_modules/react-dom/cjs/react-dom-client.development.js:14462:44)
      at performWorkOnRootViaSchedulerTask (node_modules/react-dom/cjs/react-dom-client.development.js:16216:7)
      at flushActQueue (node_modules/react/cjs/react.development.js:566:34)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (node_modules/react/cjs/react.development.js:860:10)
      at node_modules/@testing-library/react/dist/act-compat.js:47:25
      at renderRoot (node_modules/@testing-library/react/dist/pure.js:190:26)
      at render (node_modules/@testing-library/react/dist/pure.js:292:10)
      at Object.<anonymous> (src/components/ui/__tests__/ProgressIndicator.test.tsx:83:15)

  ● ProgressIndicator › handles maximum value

    TypeError: Cannot read properties of undefined (reading 'map')

    [0m [90m 83 |[39m
     [90m 84 |[39m       [33m<[39m[33mdiv[39m className[33m=[39m[32m"progress-steps"[39m[33m>[39m
    [31m[1m>[22m[39m[90m 85 |[39m         {steps[33m.[39mmap((step[33m,[39m index) [33m=>[39m {
     [90m    |[39m                [31m[1m^[22m[39m
     [90m 86 |[39m           [36mconst[39m isActive [33m=[39m step[33m.[39mid [33m===[39m currentStep [33m||[39m step[33m.[39mstatus [33m===[39m [32m'active'[39m[33m;[39m
     [90m 87 |[39m           [36mconst[39m isCompleted [33m=[39m step[33m.[39mstatus [33m===[39m [32m'completed'[39m[33m;[39m
     [90m 88 |[39m           [36mconst[39m isError [33m=[39m step[33m.[39mstatus [33m===[39m [32m'error'[39m[33m;[39m[0m

      at ProgressIndicator (src/components/ui/ProgressIndicator.tsx:85:16)
      at Object.react_stack_bottom_frame (node_modules/react-dom/cjs/react-dom-client.development.js:23863:20)
      at renderWithHooks (node_modules/react-dom/cjs/react-dom-client.development.js:5529:22)
      at updateFunctionComponent (node_modules/react-dom/cjs/react-dom-client.development.js:8897:19)
      at beginWork (node_modules/react-dom/cjs/react-dom-client.development.js:10522:18)
      at runWithFiberInDEV (node_modules/react-dom/cjs/react-dom-client.development.js:1522:13)
      at performUnitOfWork (node_modules/react-dom/cjs/react-dom-client.development.js:15140:22)
      at workLoopSync (node_modules/react-dom/cjs/react-dom-client.development.js:14956:41)
      at renderRootSync (node_modules/react-dom/cjs/react-dom-client.development.js:14936:11)
      at performWorkOnRoot (node_modules/react-dom/cjs/react-dom-client.development.js:14462:44)
      at performWorkOnRootViaSchedulerTask (node_modules/react-dom/cjs/react-dom-client.development.js:16216:7)
      at flushActQueue (node_modules/react/cjs/react.development.js:566:34)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (node_modules/react/cjs/react.development.js:860:10)
      at node_modules/@testing-library/react/dist/act-compat.js:47:25
      at renderRoot (node_modules/@testing-library/react/dist/pure.js:190:26)
      at render (node_modules/@testing-library/react/dist/pure.js:292:10)
      at Object.<anonymous> (src/components/ui/__tests__/ProgressIndicator.test.tsx:91:15)

  ● ProgressIndicator › clamps value above maximum

    TypeError: Cannot read properties of undefined (reading 'map')

    [0m [90m 83 |[39m
     [90m 84 |[39m       [33m<[39m[33mdiv[39m className[33m=[39m[32m"progress-steps"[39m[33m>[39m
    [31m[1m>[22m[39m[90m 85 |[39m         {steps[33m.[39mmap((step[33m,[39m index) [33m=>[39m {
     [90m    |[39m                [31m[1m^[22m[39m
     [90m 86 |[39m           [36mconst[39m isActive [33m=[39m step[33m.[39mid [33m===[39m currentStep [33m||[39m step[33m.[39mstatus [33m===[39m [32m'active'[39m[33m;[39m
     [90m 87 |[39m           [36mconst[39m isCompleted [33m=[39m step[33m.[39mstatus [33m===[39m [32m'completed'[39m[33m;[39m
     [90m 88 |[39m           [36mconst[39m isError [33m=[39m step[33m.[39mstatus [33m===[39m [32m'error'[39m[33m;[39m[0m

      at ProgressIndicator (src/components/ui/ProgressIndicator.tsx:85:16)
      at Object.react_stack_bottom_frame (node_modules/react-dom/cjs/react-dom-client.development.js:23863:20)
      at renderWithHooks (node_modules/react-dom/cjs/react-dom-client.development.js:5529:22)
      at updateFunctionComponent (node_modules/react-dom/cjs/react-dom-client.development.js:8897:19)
      at beginWork (node_modules/react-dom/cjs/react-dom-client.development.js:10522:18)
      at runWithFiberInDEV (node_modules/react-dom/cjs/react-dom-client.development.js:1522:13)
      at performUnitOfWork (node_modules/react-dom/cjs/react-dom-client.development.js:15140:22)
      at workLoopSync (node_modules/react-dom/cjs/react-dom-client.development.js:14956:41)
      at renderRootSync (node_modules/react-dom/cjs/react-dom-client.development.js:14936:11)
      at performWorkOnRoot (node_modules/react-dom/cjs/react-dom-client.development.js:14462:44)
      at performWorkOnRootViaSchedulerTask (node_modules/react-dom/cjs/react-dom-client.development.js:16216:7)
      at flushActQueue (node_modules/react/cjs/react.development.js:566:34)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (node_modules/react/cjs/react.development.js:860:10)
      at node_modules/@testing-library/react/dist/act-compat.js:47:25
      at renderRoot (node_modules/@testing-library/react/dist/pure.js:190:26)
      at render (node_modules/@testing-library/react/dist/pure.js:292:10)
      at Object.<anonymous> (src/components/ui/__tests__/ProgressIndicator.test.tsx:99:15)

  ● ProgressIndicator › clamps negative values to zero

    TypeError: Cannot read properties of undefined (reading 'map')

    [0m [90m 83 |[39m
     [90m 84 |[39m       [33m<[39m[33mdiv[39m className[33m=[39m[32m"progress-steps"[39m[33m>[39m
    [31m[1m>[22m[39m[90m 85 |[39m         {steps[33m.[39mmap((step[33m,[39m index) [33m=>[39m {
     [90m    |[39m                [31m[1m^[22m[39m
     [90m 86 |[39m           [36mconst[39m isActive [33m=[39m step[33m.[39mid [33m===[39m currentStep [33m||[39m step[33m.[39mstatus [33m===[39m [32m'active'[39m[33m;[39m
     [90m 87 |[39m           [36mconst[39m isCompleted [33m=[39m step[33m.[39mstatus [33m===[39m [32m'completed'[39m[33m;[39m
     [90m 88 |[39m           [36mconst[39m isError [33m=[39m step[33m.[39mstatus [33m===[39m [32m'error'[39m[33m;[39m[0m

      at ProgressIndicator (src/components/ui/ProgressIndicator.tsx:85:16)
      at Object.react_stack_bottom_frame (node_modules/react-dom/cjs/react-dom-client.development.js:23863:20)
      at renderWithHooks (node_modules/react-dom/cjs/react-dom-client.development.js:5529:22)
      at updateFunctionComponent (node_modules/react-dom/cjs/react-dom-client.development.js:8897:19)
      at beginWork (node_modules/react-dom/cjs/react-dom-client.development.js:10522:18)
      at runWithFiberInDEV (node_modules/react-dom/cjs/react-dom-client.development.js:1522:13)
      at performUnitOfWork (node_modules/react-dom/cjs/react-dom-client.development.js:15140:22)
      at workLoopSync (node_modules/react-dom/cjs/react-dom-client.development.js:14956:41)
      at renderRootSync (node_modules/react-dom/cjs/react-dom-client.development.js:14936:11)
      at performWorkOnRoot (node_modules/react-dom/cjs/react-dom-client.development.js:14462:44)
      at performWorkOnRootViaSchedulerTask (node_modules/react-dom/cjs/react-dom-client.development.js:16216:7)
      at flushActQueue (node_modules/react/cjs/react.development.js:566:34)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (node_modules/react/cjs/react.development.js:860:10)
      at node_modules/@testing-library/react/dist/act-compat.js:47:25
      at renderRoot (node_modules/@testing-library/react/dist/pure.js:190:26)
      at render (node_modules/@testing-library/react/dist/pure.js:292:10)
      at Object.<anonymous> (src/components/ui/__tests__/ProgressIndicator.test.tsx:107:15)

  ● ProgressIndicator › renders with custom format function

    TypeError: Cannot read properties of undefined (reading 'map')

    [0m [90m 83 |[39m
     [90m 84 |[39m       [33m<[39m[33mdiv[39m className[33m=[39m[32m"progress-steps"[39m[33m>[39m
    [31m[1m>[22m[39m[90m 85 |[39m         {steps[33m.[39mmap((step[33m,[39m index) [33m=>[39m {
     [90m    |[39m                [31m[1m^[22m[39m
     [90m 86 |[39m           [36mconst[39m isActive [33m=[39m step[33m.[39mid [33m===[39m currentStep [33m||[39m step[33m.[39mstatus [33m===[39m [32m'active'[39m[33m;[39m
     [90m 87 |[39m           [36mconst[39m isCompleted [33m=[39m step[33m.[39mstatus [33m===[39m [32m'completed'[39m[33m;[39m
     [90m 88 |[39m           [36mconst[39m isError [33m=[39m step[33m.[39mstatus [33m===[39m [32m'error'[39m[33m;[39m[0m

      at ProgressIndicator (src/components/ui/ProgressIndicator.tsx:85:16)
      at Object.react_stack_bottom_frame (node_modules/react-dom/cjs/react-dom-client.development.js:23863:20)
      at renderWithHooks (node_modules/react-dom/cjs/react-dom-client.development.js:5529:22)
      at updateFunctionComponent (node_modules/react-dom/cjs/react-dom-client.development.js:8897:19)
      at beginWork (node_modules/react-dom/cjs/react-dom-client.development.js:10522:18)
      at runWithFiberInDEV (node_modules/react-dom/cjs/react-dom-client.development.js:1522:13)
      at performUnitOfWork (node_modules/react-dom/cjs/react-dom-client.development.js:15140:22)
      at workLoopSync (node_modules/react-dom/cjs/react-dom-client.development.js:14956:41)
      at renderRootSync (node_modules/react-dom/cjs/react-dom-client.development.js:14936:11)
      at performWorkOnRoot (node_modules/react-dom/cjs/react-dom-client.development.js:14462:44)
      at performWorkOnRootViaSchedulerTask (node_modules/react-dom/cjs/react-dom-client.development.js:16216:7)
      at flushActQueue (node_modules/react/cjs/react.development.js:566:34)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (node_modules/react/cjs/react.development.js:860:10)
      at node_modules/@testing-library/react/dist/act-compat.js:47:25
      at renderRoot (node_modules/@testing-library/react/dist/pure.js:190:26)
      at render (node_modules/@testing-library/react/dist/pure.js:292:10)
      at Object.<anonymous> (src/components/ui/__tests__/ProgressIndicator.test.tsx:117:15)

  ● ProgressIndicator › renders child-friendly version

    TypeError: Cannot read properties of undefined (reading 'map')

    [0m [90m 83 |[39m
     [90m 84 |[39m       [33m<[39m[33mdiv[39m className[33m=[39m[32m"progress-steps"[39m[33m>[39m
    [31m[1m>[22m[39m[90m 85 |[39m         {steps[33m.[39mmap((step[33m,[39m index) [33m=>[39m {
     [90m    |[39m                [31m[1m^[22m[39m
     [90m 86 |[39m           [36mconst[39m isActive [33m=[39m step[33m.[39mid [33m===[39m currentStep [33m||[39m step[33m.[39mstatus [33m===[39m [32m'active'[39m[33m;[39m
     [90m 87 |[39m           [36mconst[39m isCompleted [33m=[39m step[33m.[39mstatus [33m===[39m [32m'completed'[39m[33m;[39m
     [90m 88 |[39m           [36mconst[39m isError [33m=[39m step[33m.[39mstatus [33m===[39m [32m'error'[39m[33m;[39m[0m

      at ProgressIndicator (src/components/ui/ProgressIndicator.tsx:85:16)
      at Object.react_stack_bottom_frame (node_modules/react-dom/cjs/react-dom-client.development.js:23863:20)
      at renderWithHooks (node_modules/react-dom/cjs/react-dom-client.development.js:5529:22)
      at updateFunctionComponent (node_modules/react-dom/cjs/react-dom-client.development.js:8897:19)
      at beginWork (node_modules/react-dom/cjs/react-dom-client.development.js:10522:18)
      at runWithFiberInDEV (node_modules/react-dom/cjs/react-dom-client.development.js:1522:13)
      at performUnitOfWork (node_modules/react-dom/cjs/react-dom-client.development.js:15140:22)
      at workLoopSync (node_modules/react-dom/cjs/react-dom-client.development.js:14956:41)
      at renderRootSync (node_modules/react-dom/cjs/react-dom-client.development.js:14936:11)
      at performWorkOnRoot (node_modules/react-dom/cjs/react-dom-client.development.js:14462:44)
      at performWorkOnRootViaSchedulerTask (node_modules/react-dom/cjs/react-dom-client.development.js:16216:7)
      at flushActQueue (node_modules/react/cjs/react.development.js:566:34)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (node_modules/react/cjs/react.development.js:860:10)
      at node_modules/@testing-library/react/dist/act-compat.js:47:25
      at renderRoot (node_modules/@testing-library/react/dist/pure.js:190:26)
      at render (node_modules/@testing-library/react/dist/pure.js:292:10)
      at Object.<anonymous> (src/components/ui/__tests__/ProgressIndicator.test.tsx:130:15)

  ● ProgressIndicator › has proper accessibility attributes

    TypeError: Cannot read properties of undefined (reading 'map')

    [0m [90m 83 |[39m
     [90m 84 |[39m       [33m<[39m[33mdiv[39m className[33m=[39m[32m"progress-steps"[39m[33m>[39m
    [31m[1m>[22m[39m[90m 85 |[39m         {steps[33m.[39mmap((step[33m,[39m index) [33m=>[39m {
     [90m    |[39m                [31m[1m^[22m[39m
     [90m 86 |[39m           [36mconst[39m isActive [33m=[39m step[33m.[39mid [33m===[39m currentStep [33m||[39m step[33m.[39mstatus [33m===[39m [32m'active'[39m[33m;[39m
     [90m 87 |[39m           [36mconst[39m isCompleted [33m=[39m step[33m.[39mstatus [33m===[39m [32m'completed'[39m[33m;[39m
     [90m 88 |[39m           [36mconst[39m isError [33m=[39m step[33m.[39mstatus [33m===[39m [32m'error'[39m[33m;[39m[0m

      at ProgressIndicator (src/components/ui/ProgressIndicator.tsx:85:16)
      at Object.react_stack_bottom_frame (node_modules/react-dom/cjs/react-dom-client.development.js:23863:20)
      at renderWithHooks (node_modules/react-dom/cjs/react-dom-client.development.js:5529:22)
      at updateFunctionComponent (node_modules/react-dom/cjs/react-dom-client.development.js:8897:19)
      at beginWork (node_modules/react-dom/cjs/react-dom-client.development.js:10522:18)
      at runWithFiberInDEV (node_modules/react-dom/cjs/react-dom-client.development.js:1522:13)
      at performUnitOfWork (node_modules/react-dom/cjs/react-dom-client.development.js:15140:22)
      at workLoopSync (node_modules/react-dom/cjs/react-dom-client.development.js:14956:41)
      at renderRootSync (node_modules/react-dom/cjs/react-dom-client.development.js:14936:11)
      at performWorkOnRoot (node_modules/react-dom/cjs/react-dom-client.development.js:14462:44)
      at performWorkOnRootViaSchedulerTask (node_modules/react-dom/cjs/react-dom-client.development.js:16216:7)
      at flushActQueue (node_modules/react/cjs/react.development.js:566:34)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (node_modules/react/cjs/react.development.js:860:10)
      at node_modules/@testing-library/react/dist/act-compat.js:47:25
      at renderRoot (node_modules/@testing-library/react/dist/pure.js:190:26)
      at render (node_modules/@testing-library/react/dist/pure.js:292:10)
      at Object.<anonymous> (src/components/ui/__tests__/ProgressIndicator.test.tsx:148:15)

  ● ProgressIndicator › applies custom className

    TypeError: Cannot read properties of undefined (reading 'map')

    [0m [90m 83 |[39m
     [90m 84 |[39m       [33m<[39m[33mdiv[39m className[33m=[39m[32m"progress-steps"[39m[33m>[39m
    [31m[1m>[22m[39m[90m 85 |[39m         {steps[33m.[39mmap((step[33m,[39m index) [33m=>[39m {
     [90m    |[39m                [31m[1m^[22m[39m
     [90m 86 |[39m           [36mconst[39m isActive [33m=[39m step[33m.[39mid [33m===[39m currentStep [33m||[39m step[33m.[39mstatus [33m===[39m [32m'active'[39m[33m;[39m
     [90m 87 |[39m           [36mconst[39m isCompleted [33m=[39m step[33m.[39mstatus [33m===[39m [32m'completed'[39m[33m;[39m
     [90m 88 |[39m           [36mconst[39m isError [33m=[39m step[33m.[39mstatus [33m===[39m [32m'error'[39m[33m;[39m[0m

      at ProgressIndicator (src/components/ui/ProgressIndicator.tsx:85:16)
      at Object.react_stack_bottom_frame (node_modules/react-dom/cjs/react-dom-client.development.js:23863:20)
      at renderWithHooks (node_modules/react-dom/cjs/react-dom-client.development.js:5529:22)
      at updateFunctionComponent (node_modules/react-dom/cjs/react-dom-client.development.js:8897:19)
      at beginWork (node_modules/react-dom/cjs/react-dom-client.development.js:10522:18)
      at runWithFiberInDEV (node_modules/react-dom/cjs/react-dom-client.development.js:1522:13)
      at performUnitOfWork (node_modules/react-dom/cjs/react-dom-client.development.js:15140:22)
      at workLoopSync (node_modules/react-dom/cjs/react-dom-client.development.js:14956:41)
      at renderRootSync (node_modules/react-dom/cjs/react-dom-client.development.js:14936:11)
      at performWorkOnRoot (node_modules/react-dom/cjs/react-dom-client.development.js:14462:44)
      at performWorkOnRootViaSchedulerTask (node_modules/react-dom/cjs/react-dom-client.development.js:16216:7)
      at flushActQueue (node_modules/react/cjs/react.development.js:566:34)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (node_modules/react/cjs/react.development.js:860:10)
      at node_modules/@testing-library/react/dist/act-compat.js:47:25
      at renderRoot (node_modules/@testing-library/react/dist/pure.js:190:26)
      at render (node_modules/@testing-library/react/dist/pure.js:292:10)
      at Object.<anonymous> (src/components/ui/__tests__/ProgressIndicator.test.tsx:188:15)

  ● ProgressIndicator › renders indeterminate progress

    TypeError: Cannot read properties of undefined (reading 'map')

    [0m [90m 83 |[39m
     [90m 84 |[39m       [33m<[39m[33mdiv[39m className[33m=[39m[32m"progress-steps"[39m[33m>[39m
    [31m[1m>[22m[39m[90m 85 |[39m         {steps[33m.[39mmap((step[33m,[39m index) [33m=>[39m {
     [90m    |[39m                [31m[1m^[22m[39m
     [90m 86 |[39m           [36mconst[39m isActive [33m=[39m step[33m.[39mid [33m===[39m currentStep [33m||[39m step[33m.[39mstatus [33m===[39m [32m'active'[39m[33m;[39m
     [90m 87 |[39m           [36mconst[39m isCompleted [33m=[39m step[33m.[39mstatus [33m===[39m [32m'completed'[39m[33m;[39m
     [90m 88 |[39m           [36mconst[39m isError [33m=[39m step[33m.[39mstatus [33m===[39m [32m'error'[39m[33m;[39m[0m

      at ProgressIndicator (src/components/ui/ProgressIndicator.tsx:85:16)
      at Object.react_stack_bottom_frame (node_modules/react-dom/cjs/react-dom-client.development.js:23863:20)
      at renderWithHooks (node_modules/react-dom/cjs/react-dom-client.development.js:5529:22)
      at updateFunctionComponent (node_modules/react-dom/cjs/react-dom-client.development.js:8897:19)
      at beginWork (node_modules/react-dom/cjs/react-dom-client.development.js:10522:18)
      at runWithFiberInDEV (node_modules/react-dom/cjs/react-dom-client.development.js:1522:13)
      at performUnitOfWork (node_modules/react-dom/cjs/react-dom-client.development.js:15140:22)
      at workLoopSync (node_modules/react-dom/cjs/react-dom-client.development.js:14956:41)
      at renderRootSync (node_modules/react-dom/cjs/react-dom-client.development.js:14936:11)
      at performWorkOnRoot (node_modules/react-dom/cjs/react-dom-client.development.js:14462:44)
      at performWorkOnRootViaSchedulerTask (node_modules/react-dom/cjs/react-dom-client.development.js:16216:7)
      at flushActQueue (node_modules/react/cjs/react.development.js:566:34)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (node_modules/react/cjs/react.development.js:860:10)
      at node_modules/@testing-library/react/dist/act-compat.js:47:25
      at renderRoot (node_modules/@testing-library/react/dist/pure.js:190:26)
      at render (node_modules/@testing-library/react/dist/pure.js:292:10)
      at Object.<anonymous> (src/components/ui/__tests__/ProgressIndicator.test.tsx:201:15)

FAIL src/components/ui/__tests__/ErrorMessage.test.tsx
  ErrorMessage
    √ renders error message with title and description (40 ms)
    √ renders with default title when not provided (8 ms)
    × renders with different types (50 ms)
    √ renders retry button when onRetry is provided (37 ms)
    √ renders dismiss button when onDismiss is provided (15 ms)
    √ renders both retry and dismiss buttons (25 ms)
    √ renders with custom retry button text (8 ms)
    √ renders with icon (4 ms)
    × renders child-friendly version (39 ms)
    √ has proper accessibility attributes (12 ms)
    √ renders with details section (12 ms)
    √ toggles details visibility (45 ms)
    √ applies custom className (6 ms)
    √ renders loading state for retry button (29 ms)

  ● ErrorMessage › renders with different types

    expect(element).toHaveClass("error-message warning")

    Expected the element to have class:
      error-message warning
    Received:
      error-message-container error-warning

    [0m [90m 42 |[39m
     [90m 43 |[39m         container [33m=[39m screen[33m.[39mgetByRole([32m'alert'[39m)[33m;[39m
    [31m[1m>[22m[39m[90m 44 |[39m         expect(container)[33m.[39mtoHaveClass([32m'error-message'[39m[33m,[39m [32m'warning'[39m)[33m;[39m
     [90m    |[39m                           [31m[1m^[22m[39m
     [90m 45 |[39m     })[33m;[39m
     [90m 46 |[39m
     [90m 47 |[39m     it([32m'renders retry button when onRetry is provided'[39m[33m,[39m () [33m=>[39m {[0m

      at Object.<anonymous> (src/components/ui/__tests__/ErrorMessage.test.tsx:44:27)

  ● ErrorMessage › renders child-friendly version

    TestingLibraryElementError: Unable to find an element with the text: Oops! Let's try that again!. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

    Ignored nodes: comments, script, style
    [36m<body>[39m
      [36m<div>[39m
        [36m<div[39m
          [33maria-describedby[39m=[32m"error-description"[39m
          [33maria-labelledby[39m=[32m"error-title"[39m
          [33maria-live[39m=[32m"assertive"[39m
          [33mclass[39m=[32m"error-message-container error-error"[39m
          [33mrole[39m=[32m"alert"[39m
        [36m>[39m
          [36m<div[39m
            [33mclass[39m=[32m"error-content"[39m
          [36m>[39m
            [36m<div[39m
              [33mclass[39m=[32m"error-icon-container"[39m
            [36m>[39m
              [36m<span[39m
                [33maria-hidden[39m=[32m"true"[39m
                [33mclass[39m=[32m"error-icon"[39m
                [33mrole[39m=[32m"img"[39m
              [36m>[39m
                [0m❌[0m
              [36m</span>[39m
            [36m</div>[39m
            [36m<div[39m
              [33mclass[39m=[32m"error-text"[39m
            [36m>[39m
              [36m<h3[39m
                [33mclass[39m=[32m"error-title"[39m
                [33mid[39m=[32m"error-title"[39m
              [36m>[39m
                [0mOops! Something went wrong[0m
              [36m</h3>[39m
              [36m<p[39m
                [33mclass[39m=[32m"error-description"[39m
                [33mid[39m=[32m"error-description"[39m
              [36m>[39m
                [0mSomething didn't work[0m
              [36m</p>[39m
            [36m</div>[39m
            [36m<div[39m
              [33mclass[39m=[32m"error-actions"[39m
            [36m/>[39m
          [36m</div>[39m
          [36m<div[39m
            [33mclass[39m=[32m"error-decoration"[39m
          [36m>[39m
            [36m<div[39m
              [33mclass[39m=[32m"sad-face"[39m
            [36m>[39m
              [0m😔[0m
            [36m</div>[39m
            [36m<div[39m
              [33mclass[39m=[32m"comfort-message"[39m
            [36m>[39m
              [0mDon't worry! We can fix this together! 💪[0m
            [36m</div>[39m
          [36m</div>[39m
        [36m</div>[39m
      [36m</div>[39m
    [36m</body>[39m

    [0m [90m 124 |[39m
     [90m 125 |[39m         [90m// Should have child-friendly default title[39m
    [31m[1m>[22m[39m[90m 126 |[39m         expect(screen[33m.[39mgetByText([32m'Oops! Let\'s try that again!'[39m))[33m.[39mtoBeInTheDocument()[33m;[39m
     [90m     |[39m                       [31m[1m^[22m[39m
     [90m 127 |[39m     })[33m;[39m
     [90m 128 |[39m
     [90m 129 |[39m     it([32m'has proper accessibility attributes'[39m[33m,[39m () [33m=>[39m {[0m

      at Object.getElementError (node_modules/@testing-library/dom/dist/config.js:37:19)
      at node_modules/@testing-library/dom/dist/query-helpers.js:76:38
      at node_modules/@testing-library/dom/dist/query-helpers.js:52:17
      at getByText (node_modules/@testing-library/dom/dist/query-helpers.js:95:19)
      at Object.<anonymous> (src/components/ui/__tests__/ErrorMessage.test.tsx:126:23)

Test Suites: 5 failed, 5 total
Tests:       29 failed, 38 passed, 67 total
Snapshots:   0 total
Time:        2.854 s, estimated 4 s
Ran all test suites matching /components\\ui\\__tests__/i.

```

#### Output
```

> frontend@0.1.0 test
> react-scripts test --watchAll=false --passWithNoTests --testPathPattern=components/ui/__tests__ --watchAll=false --verbose

  console.error
    Each child in a list should have a unique "key" prop.
    
    Check the render method of `ProgressIndicator`. See https://react.dev/link/warning-keys for more information.

    [0m [90m 170 |[39m         ][33m;[39m
     [90m 171 |[39m
    [31m[1m>[22m[39m[90m 172 |[39m         render(
     [90m     |[39m               [31m[1m^[22m[39m
     [90m 173 |[39m             [33m<[39m[33mProgressIndicator[39m
     [90m 174 |[39m                 value[33m=[39m{[35m60[39m}
     [90m 175 |[39m                 max[33m=[39m{[35m100[39m}[0m

      at node_modules/react-dom/cjs/react-dom-client.development.js:24030:21
      at runWithFiberInDEV (node_modules/react-dom/cjs/react-dom-client.development.js:1522:13)
      at warnForMissingKey (node_modules/react-dom/cjs/react-dom-client.development.js:24029:11)
      at warnOnInvalidKey (node_modules/react-dom/cjs/react-dom-client.development.js:7550:13)
      at reconcileChildrenArray (node_modules/react-dom/cjs/react-dom-client.development.js:7631:31)
      at reconcileChildFibersImpl (node_modules/react-dom/cjs/react-dom-client.development.js:7952:30)
      at node_modules/react-dom/cjs/react-dom-client.development.js:8057:33
      at reconcileChildren (node_modules/react-dom/cjs/react-dom-client.development.js:8621:13)
      at beginWork (node_modules/react-dom/cjs/react-dom-client.development.js:10793:13)
      at runWithFiberInDEV (node_modules/react-dom/cjs/react-dom-client.development.js:1522:13)
      at performUnitOfWork (node_modules/react-dom/cjs/react-dom-client.development.js:15140:22)
      at workLoopSync (node_modules/react-dom/cjs/react-dom-client.development.js:14956:41)
      at renderRootSync (node_modules/react-dom/cjs/react-dom-client.development.js:14936:11)
      at performWorkOnRoot (node_modules/react-dom...[truncated]
```

### Learning Component Tests
Status: ❌ FAILED

#### Error Details
```
FAIL src/components/learning/__tests__/FlashcardLearning.test.tsx (10.23 s)
  FlashcardLearning
    × renders loading state initially (146 ms)
    × loads and displays flashcards (1016 ms)
    × flips card when clicked (1013 ms)
    × navigates to next card (1016 ms)
    × navigates to previous card (1013 ms)
    × marks card as learned (1018 ms)
    √ handles error state (15 ms)
    × calls onComplete when session is finished (1012 ms)
    × calls onExit when exit button is clicked (1012 ms)
    × displays progress information (1014 ms)
    × handles keyboard navigation (1017 ms)

  ● FlashcardLearning › renders loading state initially

    TestingLibraryElementError: Unable to find an accessible element with the role "status"

    Here are the accessible roles:

      heading:

      Name "Error Loading Flashcards":
      [36m<h3 />[39m

      --------------------------------------------------
      paragraph:

      Name "":
      [36m<p />[39m

      --------------------------------------------------
      button:

      Name "Go Back":
      [36m<button[39m
        [33mclass[39m=[32m"btn-secondary"[39m
      [36m/>[39m

      --------------------------------------------------

    Ignored nodes: comments, script, style
    [36m<body>[39m
      [36m<div>[39m
        [36m<div[39m
          [33mclass[39m=[32m"flashcard-error"[39m
        [36m>[39m
          [36m<div[39m
            [33mclass[39m=[32m"error-icon"[39m
          [36m>[39m
            [0m⚠️[0m
          [36m</div>[39m
          [36m<h3>[39m
            [0mError Loading Flashcards[0m
          [36m</h3>[39m
          [36m<p>[39m
            [0m_flashcardService.flashcardService.getFlashcardsBySet is not a function[0m
          [36m</p>[39m
          [36m<button[39m
            [33mclass[39m=[32m"btn-secondary"[39m
          [36m>[39m
            [0mGo Back[0m
          [36m</button>[39m
        [36m</div>[39m
      [36m</div>[39m
    [36m</body>[39m

    [0m [90m 88 |[39m         )[33m;[39m
     [90m 89 |[39m
    [31m[1m>[22m[39m[90m 90 |[39m         expect(screen[33m.[39mgetByRole([32m'status'[39m))[33m.[39mtoBeInTheDocument()[33m;[39m
     [90m    |[39m                       [31m[1m^[22m[39m
     [90m 91 |[39m     })[33m;[39m
     [90m 92 |[39m
     [90m 93 |[39m     it([32m'loads and displays flashcards'[39m[33m,[39m [36masync[39m () [33m=>[39m {[0m

      at Object.getElementError (node_modules/@testing-library/dom/dist/config.js:37:19)
      at node_modules/@testing-library/dom/dist/query-helpers.js:76:38
      at node_modules/@testing-library/dom/dist/query-helpers.js:52:17
      at getByRole (node_modules/@testing-library/dom/dist/query-helpers.js:95:19)
      at Object.<anonymous> (src/components/learning/__tests__/FlashcardLearning.test.tsx:90:23)
      at TestScheduler.scheduleTests (node_modules/@jest/core/build/TestScheduler.js:333:13)
      at runJest (node_modules/@jest/core/build/runJest.js:404:19)
      at _run10000 (node_modules/@jest/core/build/cli/index.js:320:7)
      at runCLI (node_modules/@jest/core/build/cli/index.js:173:3)

  ● FlashcardLearning › loads and displays flashcards

    Unable to find an element with the text: Hello. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

    Ignored nodes: comments, script, style
    [36m<body>[39m
      [36m<div>[39m
        [36m<div[39m
          [33mclass[39m=[32m"flashcard-error"[39m
        [36m>[39m
          [36m<div[39m
            [33mclass[39m=[32m"error-icon"[39m
          [36m>[39m
            [0m⚠️[0m
          [36m</div>[39m
          [36m<h3>[39m
            [0mError Loading Flashcards[0m
          [36m</h3>[39m
          [36m<p>[39m
            [0m_flashcardService.flashcardService.getFlashcardsBySet is not a function[0m
          [36m</p>[39m
          [36m<button[39m
            [33mclass[39m=[32m"btn-secondary"[39m
          [36m>[39m
            [0mGo Back[0m
          [36m</button>[39m
        [36m</div>[39m
      [36m</div>[39m
    [36m</body>[39m

    [0m [90m 100 |[39m         )[33m;[39m
     [90m 101 |[39m
    [31m[1m>[22m[39m[90m 102 |[39m         [36mawait[39m waitFor(() [33m=>[39m {
     [90m     |[39m                      [31m[1m^[22m[39m
     [90m 103 |[39m             expect(screen[33m.[39mgetByText([32m'Hello'[39m))[33m.[39mtoBeInTheDocument()[33m;[39m
     [90m 104 |[39m         })[33m;[39m
     [90m 105 |[39m[0m

      at waitForWrapper (node_modules/@testing-library/dom/dist/wait-for.js:163:27)
      at Object.<anonymous> (src/components/learning/__tests__/FlashcardLearning.test.tsx:102:22)
      at TestScheduler.scheduleTests (node_modules/@jest/core/build/TestScheduler.js:333:13)
      at runJest (node_modules/@jest/core/build/runJest.js:404:19)
      at _run10000 (node_modules/@jest/core/build/cli/index.js:320:7)
      at runCLI (node_modules/@jest/core/build/cli/index.js:173:3)

  ● FlashcardLearning › flips card when clicked

    Unable to find an element with the text: Hello. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

    Ignored nodes: comments, script, style
    [36m<body>[39m
      [36m<div>[39m
        [36m<div[39m
          [33mclass[39m=[32m"flashcard-error"[39m
        [36m>[39m
          [36m<div[39m
            [33mclass[39m=[32m"error-icon"[39m
          [36m>[39m
            [0m⚠️[0m
          [36m</div>[39m
          [36m<h3>[39m
            [0mError Loading Flashcards[0m
          [36m</h3>[39m
          [36m<p>[39m
            [0m_flashcardService.flashcardService.getFlashcardsBySet is not a function[0m
          [36m</p>[39m
          [36m<button[39m
            [33mclass[39m=[32m"btn-secondary"[39m
          [36m>[39m
            [0mGo Back[0m
          [36m</button>[39m
        [36m</div>[39m
      [36m</div>[39m
    [36m</body>[39m

    [0m [90m 117 |[39m         )[33m;[39m
     [90m 118 |[39m
    [31m[1m>[22m[39m[90m 119 |[39m         [36mawait[39m waitFor(() [33m=>[39m {
     [90m     |[39m                      [31m[1m^[22m[39m
     [90m 120 |[39m             expect(screen[33m.[39mgetByText([32m'Hello'[39m))[33m.[39mtoBeInTheDocument()[33m;[39m
     [90m 121 |[39m         })[33m;[39m
     [90m 122 |[39m[0m

      at waitForWrapper (node_modules/@testing-library/dom/dist/wait-for.js:163:27)
      at Object.<anonymous> (src/components/learning/__tests__/FlashcardLearning.test.tsx:119:22)
      at TestScheduler.scheduleTests (node_modules/@jest/core/build/TestScheduler.js:333:13)
      at runJest (node_modules/@jest/core/build/runJest.js:404:19)
      at _run10000 (node_modules/@jest/core/build/cli/index.js:320:7)
      at runCLI (node_modules/@jest/core/build/cli/index.js:173:3)

  ● FlashcardLearning › navigates to next card

    Unable to find an element with the text: Hello. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

    Ignored nodes: comments, script, style
    [36m<body>[39m
      [36m<div>[39m
        [36m<div[39m
          [33mclass[39m=[32m"flashcard-error"[39m
        [36m>[39m
          [36m<div[39m
            [33mclass[39m=[32m"error-icon"[39m
          [36m>[39m
            [0m⚠️[0m
          [36m</div>[39m
          [36m<h3>[39m
            [0mError Loading Flashcards[0m
          [36m</h3>[39m
          [36m<p>[39m
            [0m_flashcardService.flashcardService.getFlashcardsBySet is not a function[0m
          [36m</p>[39m
          [36m<button[39m
            [33mclass[39m=[32m"btn-secondary"[39m
          [36m>[39m
            [0mGo Back[0m
          [36m</button>[39m
        [36m</div>[39m
      [36m</div>[39m
    [36m</body>[39m

    [0m [90m 140 |[39m         )[33m;[39m
     [90m 141 |[39m
    [31m[1m>[22m[39m[90m 142 |[39m         [36mawait[39m waitFor(() [33m=>[39m {
     [90m     |[39m                      [31m[1m^[22m[39m
     [90m 143 |[39m             expect(screen[33m.[39mgetByText([32m'Hello'[39m))[33m.[39mtoBeInTheDocument()[33m;[39m
     [90m 144 |[39m         })[33m;[39m
     [90m 145 |[39m[0m

      at waitForWrapper (node_modules/@testing-library/dom/dist/wait-for.js:163:27)
      at Object.<anonymous> (src/components/learning/__tests__/FlashcardLearning.test.tsx:142:22)
      at TestScheduler.scheduleTests (node_modules/@jest/core/build/TestScheduler.js:333:13)
      at runJest (node_modules/@jest/core/build/runJest.js:404:19)
      at _run10000 (node_modules/@jest/core/build/cli/index.js:320:7)
      at runCLI (node_modules/@jest/core/build/cli/index.js:173:3)

  ● FlashcardLearning › navigates to previous card

    Unable to find an element with the text: Hello. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

    Ignored nodes: comments, script, style
    [36m<body>[39m
      [36m<div>[39m
        [36m<div[39m
          [33mclass[39m=[32m"flashcard-error"[39m
        [36m>[39m
          [36m<div[39m
            [33mclass[39m=[32m"error-icon"[39m
          [36m>[39m
            [0m⚠️[0m
          [36m</div>[39m
          [36m<h3>[39m
            [0mError Loading Flashcards[0m
          [36m</h3>[39m
          [36m<p>[39m
            [0m_flashcardService.flashcardService.getFlashcardsBySet is not a function[0m
          [36m</p>[39m
          [36m<button[39m
            [33mclass[39m=[32m"btn-secondary"[39m
          [36m>[39m
            [0mGo Back[0m
          [36m</button>[39m
        [36m</div>[39m
      [36m</div>[39m
    [36m</body>[39m

    [0m [90m 161 |[39m         )[33m;[39m
     [90m 162 |[39m
    [31m[1m>[22m[39m[90m 163 |[39m         [36mawait[39m waitFor(() [33m=>[39m {
     [90m     |[39m                      [31m[1m^[22m[39m
     [90m 164 |[39m             expect(screen[33m.[39mgetByText([32m'Hello'[39m))[33m.[39mtoBeInTheDocument()[33m;[39m
     [90m 165 |[39m         })[33m;[39m
     [90m 166 |[39m[0m

      at waitForWrapper (node_modules/@testing-library/dom/dist/wait-for.js:163:27)
      at Object.<anonymous> (src/components/learning/__tests__/FlashcardLearning.test.tsx:163:22)
      at TestScheduler.scheduleTests (node_modules/@jest/core/build/TestScheduler.js:333:13)
      at runJest (node_modules/@jest/core/build/runJest.js:404:19)
      at _run10000 (node_modules/@jest/core/build/cli/index.js:320:7)
      at runCLI (node_modules/@jest/core/build/cli/index.js:173:3)

  ● FlashcardLearning › marks card as learned

    Unable to find an element with the text: Hello. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

    Ignored nodes: comments, script, style
    [36m<body>[39m
      [36m<div>[39m
        [36m<div[39m
          [33mclass[39m=[32m"flashcard-error"[39m
        [36m>[39m
          [36m<div[39m
            [33mclass[39m=[32m"error-icon"[39m
          [36m>[39m
            [0m⚠️[0m
          [36m</div>[39m
          [36m<h3>[39m
            [0mError Loading Flashcards[0m
          [36m</h3>[39m
          [36m<p>[39m
            [0m_flashcardService.flashcardService.getFlashcardsBySet is not a function[0m
          [36m</p>[39m
          [36m<button[39m
            [33mclass[39m=[32m"btn-secondary"[39m
          [36m>[39m
            [0mGo Back[0m
          [36m</button>[39m
        [36m</div>[39m
      [36m</div>[39m
    [36m</body>[39m

    [0m [90m 191 |[39m         )[33m;[39m
     [90m 192 |[39m
    [31m[1m>[22m[39m[90m 193 |[39m         [36mawait[39m waitFor(() [33m=>[39m {
     [90m     |[39m                      [31m[1m^[22m[39m
     [90m 194 |[39m             expect(screen[33m.[39mgetByText([32m'Hello'[39m))[33m.[39mtoBeInTheDocument()[33m;[39m
     [90m 195 |[39m         })[33m;[39m
     [90m 196 |[39m[0m

      at waitForWrapper (node_modules/@testing-library/dom/dist/wait-for.js:163:27)
      at Object.<anonymous> (src/components/learning/__tests__/FlashcardLearning.test.tsx:193:22)
      at TestScheduler.scheduleTests (node_modules/@jest/core/build/TestScheduler.js:333:13)
      at runJest (node_modules/@jest/core/build/runJest.js:404:19)
      at _run10000 (node_modules/@jest/core/build/cli/index.js:320:7)
      at runCLI (node_modules/@jest/core/build/cli/index.js:173:3)

  ● FlashcardLearning › calls onComplete when session is finished

    Unable to find an element with the text: Hello. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

    Ignored nodes: comments, script, style
    [36m<body>[39m
      [36m<div>[39m
        [36m<div[39m
          [33mclass[39m=[32m"flashcard-error"[39m
        [36m>[39m
          [36m<div[39m
            [33mclass[39m=[32m"error-icon"[39m
          [36m>[39m
            [0m⚠️[0m
          [36m</div>[39m
          [36m<h3>[39m
            [0mError Loading Flashcards[0m
          [36m</h3>[39m
          [36m<p>[39m
            [0m_flashcardService.flashcardService.getFlashcardsBySet is not a function[0m
          [36m</p>[39m
          [36m<button[39m
            [33mclass[39m=[32m"btn-secondary"[39m
          [36m>[39m
            [0mGo Back[0m
          [36m</button>[39m
        [36m</div>[39m
      [36m</div>[39m
    [36m</body>[39m

    [0m [90m 232 |[39m         )[33m;[39m
     [90m 233 |[39m
    [31m[1m>[22m[39m[90m 234 |[39m         [36mawait[39m waitFor(() [33m=>[39m {
     [90m     |[39m                      [31m[1m^[22m[39m
     [90m 235 |[39m             expect(screen[33m.[39mgetByText([32m'Hello'[39m))[33m.[39mtoBeInTheDocument()[33m;[39m
     [90m 236 |[39m         })[33m;[39m
     [90m 237 |[39m[0m

      at waitForWrapper (node_modules/@testing-library/dom/dist/wait-for.js:163:27)
      at Object.<anonymous> (src/components/learning/__tests__/FlashcardLearning.test.tsx:234:22)
      at TestScheduler.scheduleTests (node_modules/@jest/core/build/TestScheduler.js:333:13)
      at runJest (node_modules/@jest/core/build/runJest.js:404:19)
      at _run10000 (node_modules/@jest/core/build/cli/index.js:320:7)
      at runCLI (node_modules/@jest/core/build/cli/index.js:173:3)

  ● FlashcardLearning › calls onExit when exit button is clicked

    Unable to find an element with the text: Hello. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

    Ignored nodes: comments, script, style
    [36m<body>[39m
      [36m<div>[39m
        [36m<div[39m
          [33mclass[39m=[32m"flashcard-error"[39m
        [36m>[39m
          [36m<div[39m
            [33mclass[39m=[32m"error-icon"[39m
          [36m>[39m
            [0m⚠️[0m
          [36m</div>[39m
          [36m<h3>[39m
            [0mError Loading Flashcards[0m
          [36m</h3>[39m
          [36m<p>[39m
            [0m_flashcardService.flashcardService.getFlashcardsBySet is not a function[0m
          [36m</p>[39m
          [36m<button[39m
            [33mclass[39m=[32m"btn-secondary"[39m
          [36m>[39m
            [0mGo Back[0m
          [36m</button>[39m
        [36m</div>[39m
      [36m</div>[39m
    [36m</body>[39m

    [0m [90m 267 |[39m         )[33m;[39m
     [90m 268 |[39m
    [31m[1m>[22m[39m[90m 269 |[39m         [36mawait[39m waitFor(() [33m=>[39m {
     [90m     |[39m                      [31m[1m^[22m[39m
     [90m 270 |[39m             expect(screen[33m.[39mgetByText([32m'Hello'[39m))[33m.[39mtoBeInTheDocument()[33m;[39m
     [90m 271 |[39m         })[33m;[39m
     [90m 272 |[39m[0m

      at waitForWrapper (node_modules/@testing-library/dom/dist/wait-for.js:163:27)
      at Object.<anonymous> (src/components/learning/__tests__/FlashcardLearning.test.tsx:269:22)
      at TestScheduler.scheduleTests (node_modules/@jest/core/build/TestScheduler.js:333:13)
      at runJest (node_modules/@jest/core/build/runJest.js:404:19)
      at _run10000 (node_modules/@jest/core/build/cli/index.js:320:7)
      at runCLI (node_modules/@jest/core/build/cli/index.js:173:3)

  ● FlashcardLearning › displays progress information

    Unable to find an element with the text: Hello. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

    Ignored nodes: comments, script, style
    [36m<body>[39m
      [36m<div>[39m
        [36m<div[39m
          [33mclass[39m=[32m"flashcard-error"[39m
        [36m>[39m
          [36m<div[39m
            [33mclass[39m=[32m"error-icon"[39m
          [36m>[39m
            [0m⚠️[0m
          [36m</div>[39m
          [36m<h3>[39m
            [0mError Loading Flashcards[0m
          [36m</h3>[39m
          [36m<p>[39m
            [0m_flashcardService.flashcardService.getFlashcardsBySet is not a function[0m
          [36m</p>[39m
          [36m<button[39m
            [33mclass[39m=[32m"btn-secondary"[39m
          [36m>[39m
            [0mGo Back[0m
          [36m</button>[39m
        [36m</div>[39m
      [36m</div>[39m
    [36m</body>[39m

    [0m [90m 286 |[39m         )[33m;[39m
     [90m 287 |[39m
    [31m[1m>[22m[39m[90m 288 |[39m         [36mawait[39m waitFor(() [33m=>[39m {
     [90m     |[39m                      [31m[1m^[22m[39m
     [90m 289 |[39m             expect(screen[33m.[39mgetByText([32m'Hello'[39m))[33m.[39mtoBeInTheDocument()[33m;[39m
     [90m 290 |[39m         })[33m;[39m
     [90m 291 |[39m[0m

      at waitForWrapper (node_modules/@testing-library/dom/dist/wait-for.js:163:27)
      at Object.<anonymous> (src/components/learning/__tests__/FlashcardLearning.test.tsx:288:22)
      at TestScheduler.scheduleTests (node_modules/@jest/core/build/TestScheduler.js:333:13)
      at runJest (node_modules/@jest/core/build/runJest.js:404:19)
      at _run10000 (node_modules/@jest/core/build/cli/index.js:320:7)
      at runCLI (node_modules/@jest/core/build/cli/index.js:173:3)

  ● FlashcardLearning › handles keyboard navigation

    Unable to find an element with the text: Hello. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

    Ignored nodes: comments, script, style
    [36m<body>[39m
      [36m<div>[39m
        [36m<div[39m
          [33mclass[39m=[32m"flashcard-error"[39m
        [36m>[39m
          [36m<div[39m
            [33mclass[39m=[32m"error-icon"[39m
          [36m>[39m
            [0m⚠️[0m
          [36m</div>[39m
          [36m<h3>[39m
            [0mError Loading Flashcards[0m
          [36m</h3>[39m
          [36m<p>[39m
            [0m_flashcardService.flashcardService.getFlashcardsBySet is not a function[0m
          [36m</p>[39m
          [36m<button[39m
            [33mclass[39m=[32m"btn-secondary"[39m
          [36m>[39m
            [0mGo Back[0m
          [36m</button>[39m
        [36m</div>[39m
      [36m</div>[39m
    [36m</body>[39m

    [0m [90m 303 |[39m         )[33m;[39m
     [90m 304 |[39m
    [31m[1m>[22m[39m[90m 305 |[39m         [36mawait[39m waitFor(() [33m=>[39m {
     [90m     |[39m                      [31m[1m^[22m[39m
     [90m 306 |[39m             expect(screen[33m.[39mgetByText([32m'Hello'[39m))[33m.[39mtoBeInTheDocument()[33m;[39m
     [90m 307 |[39m         })[33m;[39m
     [90m 308 |[39m[0m

      at waitForWrapper (node_modules/@testing-library/dom/dist/wait-for.js:163:27)
      at Object.<anonymous> (src/components/learning/__tests__/FlashcardLearning.test.tsx:305:22)
      at TestScheduler.scheduleTests (node_modules/@jest/core/build/TestScheduler.js:333:13)
      at runJest (node_modules/@jest/core/build/runJest.js:404:19)
      at _run10000 (node_modules/@jest/core/build/cli/index.js:320:7)
      at runCLI (node_modules/@jest/core/build/cli/index.js:173:3)

Test Suites: 1 failed, 1 total
Tests:       10 failed, 1 passed, 11 total
Snapshots:   0 total
Time:        10.963 s, estimated 14 s
Ran all test suites matching /components\\learning\\__tests__/i.

```

#### Output
```

> frontend@0.1.0 test
> react-scripts test --watchAll=false --passWithNoTests --testPathPattern=components/learning/__tests__ --watchAll=false --verbose

  console.error
    Failed to load progress: TypeError: _flashcardService.flashcardService.getProgress is not a function
        at loadProgress (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\src\components\learning\FlashcardLearning.tsx:74:47)
        at D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\src\components\learning\FlashcardLearning.tsx:48:5
        at Object.react_stack_bottom_frame (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\react-dom\cjs\react-dom-client.development.js:23953:20)
        at runWithFiberInDEV (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\react-dom\cjs\react-dom-client.development.js:1522:13)
        at commitHookEffectListMount (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\react-dom\cjs\react-dom-client.development.js:11905:29)
        at commitHookPassiveMountEffects (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\react-dom\cjs\react-dom-client.development.js:12028:11)
        at commitPassiveMountOnFiber (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\react-dom\cjs\react-dom-client.development.js:13841:13)
        at recursivelyTraversePassiveMountEffects (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\react-dom\cjs\react-dom-client.development.js:13815:11)
        at commitPassiveMountOnFiber (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\react-dom\cjs\react-dom-client.development.js:13853:11)
        at flushPassiveEffects (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\react-dom\cjs\react-dom-client.development.js:15737:9)
        at D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\react-dom\cjs\react-dom-client.development.js:15379:15
        at flushActQueue (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\react\cjs\react.development...[truncated]
```

### Achievement Component Tests
Status: ❌ FAILED

#### Error Details
```
FAIL src/components/achievement/__tests__/AchievementNotification.test.tsx
  AchievementNotification
    × renders achievement notification correctly (30 ms)
    × calls onClose when close button is clicked (2 ms)
    × calls onShare when share button is clicked (2 ms)
    × calls onClose when X button is clicked (1 ms)
    × does not render when isVisible is false (2 ms)
    × auto-closes after 5 seconds (5 ms)
    × displays celebration particles (1 ms)

  ● AchievementNotification › renders achievement notification correctly

    useAccessibility must be used within an AccessibilityProvider

    [0m [90m 246 |[39m   [36mconst[39m context [33m=[39m useContext([33mAccessibilityContext[39m)[33m;[39m
     [90m 247 |[39m   [36mif[39m ([33m![39mcontext) {
    [31m[1m>[22m[39m[90m 248 |[39m     [36mthrow[39m [36mnew[39m [33mError[39m(
     [90m     |[39m           [31m[1m^[22m[39m
     [90m 249 |[39m       [32m'useAccessibility must be used within an AccessibilityProvider'[39m
     [90m 250 |[39m     )[33m;[39m
     [90m 251 |[39m   }[0m

      at useAccessibility (src/contexts/AccessibilityContext.tsx:248:11)
      at AchievementNotification (src/components/achievement/AchievementNotification.tsx:23:54)
      at Object.react_stack_bottom_frame (node_modules/react-dom/cjs/react-dom-client.development.js:23863:20)
      at renderWithHooks (node_modules/react-dom/cjs/react-dom-client.development.js:5529:22)
      at updateFunctionComponent (node_modules/react-dom/cjs/react-dom-client.development.js:8897:19)
      at beginWork (node_modules/react-dom/cjs/react-dom-client.development.js:10522:18)
      at runWithFiberInDEV (node_modules/react-dom/cjs/react-dom-client.development.js:1522:13)
      at performUnitOfWork (node_modules/react-dom/cjs/react-dom-client.development.js:15140:22)
      at workLoopSync (node_modules/react-dom/cjs/react-dom-client.development.js:14956:41)
      at renderRootSync (node_modules/react-dom/cjs/react-dom-client.development.js:14936:11)
      at performWorkOnRoot (node_modules/react-dom/cjs/react-dom-client.development.js:14462:44)
      at performWorkOnRootViaSchedulerTask (node_modules/react-dom/cjs/react-dom-client.development.js:16216:7)
      at flushActQueue (node_modules/react/cjs/react.development.js:566:34)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (node_modules/react/cjs/react.development.js:860:10)
      at node_modules/@testing-library/react/dist/act-compat.js:47:25
      at renderRoot (node_modules/@testing-library/react/dist/pure.js:190:26)
      at render (node_modules/@testing-library/react/dist/pure.js:292:10)
      at Object.<anonymous> (src/components/achievement/__tests__/AchievementNotification.test.tsx:27:11)
      at TestScheduler.scheduleTests (node_modules/@jest/core/build/TestScheduler.js:333:13)
      at runJest (node_modules/@jest/core/build/runJest.js:404:19)
      at _run10000 (node_modules/@jest/core/build/cli/index.js:320:7)
      at runCLI (node_modules/@jest/core/build/cli/index.js:173:3)

  ● AchievementNotification › calls onClose when close button is clicked

    useAccessibility must be used within an AccessibilityProvider

    [0m [90m 246 |[39m   [36mconst[39m context [33m=[39m useContext([33mAccessibilityContext[39m)[33m;[39m
     [90m 247 |[39m   [36mif[39m ([33m![39mcontext) {
    [31m[1m>[22m[39m[90m 248 |[39m     [36mthrow[39m [36mnew[39m [33mError[39m(
     [90m     |[39m           [31m[1m^[22m[39m
     [90m 249 |[39m       [32m'useAccessibility must be used within an AccessibilityProvider'[39m
     [90m 250 |[39m     )[33m;[39m
     [90m 251 |[39m   }[0m

      at useAccessibility (src/contexts/AccessibilityContext.tsx:248:11)
      at AchievementNotification (src/components/achievement/AchievementNotification.tsx:23:54)
      at Object.react_stack_bottom_frame (node_modules/react-dom/cjs/react-dom-client.development.js:23863:20)
      at renderWithHooks (node_modules/react-dom/cjs/react-dom-client.development.js:5529:22)
      at updateFunctionComponent (node_modules/react-dom/cjs/react-dom-client.development.js:8897:19)
      at beginWork (node_modules/react-dom/cjs/react-dom-client.development.js:10522:18)
      at runWithFiberInDEV (node_modules/react-dom/cjs/react-dom-client.development.js:1522:13)
      at performUnitOfWork (node_modules/react-dom/cjs/react-dom-client.development.js:15140:22)
      at workLoopSync (node_modules/react-dom/cjs/react-dom-client.development.js:14956:41)
      at renderRootSync (node_modules/react-dom/cjs/react-dom-client.development.js:14936:11)
      at performWorkOnRoot (node_modules/react-dom/cjs/react-dom-client.development.js:14462:44)
      at performWorkOnRootViaSchedulerTask (node_modules/react-dom/cjs/react-dom-client.development.js:16216:7)
      at flushActQueue (node_modules/react/cjs/react.development.js:566:34)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (node_modules/react/cjs/react.development.js:860:10)
      at node_modules/@testing-library/react/dist/act-compat.js:47:25
      at renderRoot (node_modules/@testing-library/react/dist/pure.js:190:26)
      at render (node_modules/@testing-library/react/dist/pure.js:292:10)
      at Object.<anonymous> (src/components/achievement/__tests__/AchievementNotification.test.tsx:43:11)
      at TestScheduler.scheduleTests (node_modules/@jest/core/build/TestScheduler.js:333:13)
      at runJest (node_modules/@jest/core/build/runJest.js:404:19)
      at _run10000 (node_modules/@jest/core/build/cli/index.js:320:7)
      at runCLI (node_modules/@jest/core/build/cli/index.js:173:3)

  ● AchievementNotification › calls onShare when share button is clicked

    useAccessibility must be used within an AccessibilityProvider

    [0m [90m 246 |[39m   [36mconst[39m context [33m=[39m useContext([33mAccessibilityContext[39m)[33m;[39m
     [90m 247 |[39m   [36mif[39m ([33m![39mcontext) {
    [31m[1m>[22m[39m[90m 248 |[39m     [36mthrow[39m [36mnew[39m [33mError[39m(
     [90m     |[39m           [31m[1m^[22m[39m
     [90m 249 |[39m       [32m'useAccessibility must be used within an AccessibilityProvider'[39m
     [90m 250 |[39m     )[33m;[39m
     [90m 251 |[39m   }[0m

      at useAccessibility (src/contexts/AccessibilityContext.tsx:248:11)
      at AchievementNotification (src/components/achievement/AchievementNotification.tsx:23:54)
      at Object.react_stack_bottom_frame (node_modules/react-dom/cjs/react-dom-client.development.js:23863:20)
      at renderWithHooks (node_modules/react-dom/cjs/react-dom-client.development.js:5529:22)
      at updateFunctionComponent (node_modules/react-dom/cjs/react-dom-client.development.js:8897:19)
      at beginWork (node_modules/react-dom/cjs/react-dom-client.development.js:10522:18)
      at runWithFiberInDEV (node_modules/react-dom/cjs/react-dom-client.development.js:1522:13)
      at performUnitOfWork (node_modules/react-dom/cjs/react-dom-client.development.js:15140:22)
      at workLoopSync (node_modules/react-dom/cjs/react-dom-client.development.js:14956:41)
      at renderRootSync (node_modules/react-dom/cjs/react-dom-client.development.js:14936:11)
      at performWorkOnRoot (node_modules/react-dom/cjs/react-dom-client.development.js:14462:44)
      at performWorkOnRootViaSchedulerTask (node_modules/react-dom/cjs/react-dom-client.development.js:16216:7)
      at flushActQueue (node_modules/react/cjs/react.development.js:566:34)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (node_modules/react/cjs/react.development.js:860:10)
      at node_modules/@testing-library/react/dist/act-compat.js:47:25
      at renderRoot (node_modules/@testing-library/react/dist/pure.js:190:26)
      at render (node_modules/@testing-library/react/dist/pure.js:292:10)
      at Object.<anonymous> (src/components/achievement/__tests__/AchievementNotification.test.tsx:64:11)
      at TestScheduler.scheduleTests (node_modules/@jest/core/build/TestScheduler.js:333:13)
      at runJest (node_modules/@jest/core/build/runJest.js:404:19)
      at _run10000 (node_modules/@jest/core/build/cli/index.js:320:7)
      at runCLI (node_modules/@jest/core/build/cli/index.js:173:3)

  ● AchievementNotification › calls onClose when X button is clicked

    useAccessibility must be used within an AccessibilityProvider

    [0m [90m 246 |[39m   [36mconst[39m context [33m=[39m useContext([33mAccessibilityContext[39m)[33m;[39m
     [90m 247 |[39m   [36mif[39m ([33m![39mcontext) {
    [31m[1m>[22m[39m[90m 248 |[39m     [36mthrow[39m [36mnew[39m [33mError[39m(
     [90m     |[39m           [31m[1m^[22m[39m
     [90m 249 |[39m       [32m'useAccessibility must be used within an AccessibilityProvider'[39m
     [90m 250 |[39m     )[33m;[39m
     [90m 251 |[39m   }[0m

      at useAccessibility (src/contexts/AccessibilityContext.tsx:248:11)
      at AchievementNotification (src/components/achievement/AchievementNotification.tsx:23:54)
      at Object.react_stack_bottom_frame (node_modules/react-dom/cjs/react-dom-client.development.js:23863:20)
      at renderWithHooks (node_modules/react-dom/cjs/react-dom-client.development.js:5529:22)
      at updateFunctionComponent (node_modules/react-dom/cjs/react-dom-client.development.js:8897:19)
      at beginWork (node_modules/react-dom/cjs/react-dom-client.development.js:10522:18)
      at runWithFiberInDEV (node_modules/react-dom/cjs/react-dom-client.development.js:1522:13)
      at performUnitOfWork (node_modules/react-dom/cjs/react-dom-client.development.js:15140:22)
      at workLoopSync (node_modules/react-dom/cjs/react-dom-client.development.js:14956:41)
      at renderRootSync (node_modules/react-dom/cjs/react-dom-client.development.js:14936:11)
      at performWorkOnRoot (node_modules/react-dom/cjs/react-dom-client.development.js:14462:44)
      at performWorkOnRootViaSchedulerTask (node_modules/react-dom/cjs/react-dom-client.development.js:16216:7)
      at flushActQueue (node_modules/react/cjs/react.development.js:566:34)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (node_modules/react/cjs/react.development.js:860:10)
      at node_modules/@testing-library/react/dist/act-compat.js:47:25
      at renderRoot (node_modules/@testing-library/react/dist/pure.js:190:26)
      at render (node_modules/@testing-library/react/dist/pure.js:292:10)
      at Object.<anonymous> (src/components/achievement/__tests__/AchievementNotification.test.tsx:78:11)
      at TestScheduler.scheduleTests (node_modules/@jest/core/build/TestScheduler.js:333:13)
      at runJest (node_modules/@jest/core/build/runJest.js:404:19)
      at _run10000 (node_modules/@jest/core/build/cli/index.js:320:7)
      at runCLI (node_modules/@jest/core/build/cli/index.js:173:3)

  ● AchievementNotification › does not render when isVisible is false

    useAccessibility must be used within an AccessibilityProvider

    [0m [90m 246 |[39m   [36mconst[39m context [33m=[39m useContext([33mAccessibilityContext[39m)[33m;[39m
     [90m 247 |[39m   [36mif[39m ([33m![39mcontext) {
    [31m[1m>[22m[39m[90m 248 |[39m     [36mthrow[39m [36mnew[39m [33mError[39m(
     [90m     |[39m           [31m[1m^[22m[39m
     [90m 249 |[39m       [32m'useAccessibility must be used within an AccessibilityProvider'[39m
     [90m 250 |[39m     )[33m;[39m
     [90m 251 |[39m   }[0m

      at useAccessibility (src/contexts/AccessibilityContext.tsx:248:11)
      at AchievementNotification (src/components/achievement/AchievementNotification.tsx:23:54)
      at Object.react_stack_bottom_frame (node_modules/react-dom/cjs/react-dom-client.development.js:23863:20)
      at renderWithHooks (node_modules/react-dom/cjs/react-dom-client.development.js:5529:22)
      at updateFunctionComponent (node_modules/react-dom/cjs/react-dom-client.development.js:8897:19)
      at beginWork (node_modules/react-dom/cjs/react-dom-client.development.js:10522:18)
      at runWithFiberInDEV (node_modules/react-dom/cjs/react-dom-client.development.js:1522:13)
      at performUnitOfWork (node_modules/react-dom/cjs/react-dom-client.development.js:15140:22)
      at workLoopSync (node_modules/react-dom/cjs/react-dom-client.development.js:14956:41)
      at renderRootSync (node_modules/react-dom/cjs/react-dom-client.development.js:14936:11)
      at performWorkOnRoot (node_modules/react-dom/cjs/react-dom-client.development.js:14462:44)
      at performWorkOnRootViaSchedulerTask (node_modules/react-dom/cjs/react-dom-client.development.js:16216:7)
      at flushActQueue (node_modules/react/cjs/react.development.js:566:34)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (node_modules/react/cjs/react.development.js:860:10)
      at node_modules/@testing-library/react/dist/act-compat.js:47:25
      at renderRoot (node_modules/@testing-library/react/dist/pure.js:190:26)
      at render (node_modules/@testing-library/react/dist/pure.js:292:10)
      at Object.<anonymous> (src/components/achievement/__tests__/AchievementNotification.test.tsx:98:11)
      at TestScheduler.scheduleTests (node_modules/@jest/core/build/TestScheduler.js:333:13)
      at runJest (node_modules/@jest/core/build/runJest.js:404:19)
      at _run10000 (node_modules/@jest/core/build/cli/index.js:320:7)
      at runCLI (node_modules/@jest/core/build/cli/index.js:173:3)

  ● AchievementNotification › auto-closes after 5 seconds

    useAccessibility must be used within an AccessibilityProvider

    [0m [90m 246 |[39m   [36mconst[39m context [33m=[39m useContext([33mAccessibilityContext[39m)[33m;[39m
     [90m 247 |[39m   [36mif[39m ([33m![39mcontext) {
    [31m[1m>[22m[39m[90m 248 |[39m     [36mthrow[39m [36mnew[39m [33mError[39m(
     [90m     |[39m           [31m[1m^[22m[39m
     [90m 249 |[39m       [32m'useAccessibility must be used within an AccessibilityProvider'[39m
     [90m 250 |[39m     )[33m;[39m
     [90m 251 |[39m   }[0m

      at useAccessibility (src/contexts/AccessibilityContext.tsx:248:11)
      at AchievementNotification (src/components/achievement/AchievementNotification.tsx:23:54)
      at Object.react_stack_bottom_frame (node_modules/react-dom/cjs/react-dom-client.development.js:23863:20)
      at renderWithHooks (node_modules/react-dom/cjs/react-dom-client.development.js:5529:22)
      at updateFunctionComponent (node_modules/react-dom/cjs/react-dom-client.development.js:8897:19)
      at beginWork (node_modules/react-dom/cjs/react-dom-client.development.js:10522:18)
      at runWithFiberInDEV (node_modules/react-dom/cjs/react-dom-client.development.js:1522:13)
      at performUnitOfWork (node_modules/react-dom/cjs/react-dom-client.development.js:15140:22)
      at workLoopSync (node_modules/react-dom/cjs/react-dom-client.development.js:14956:41)
      at renderRootSync (node_modules/react-dom/cjs/react-dom-client.development.js:14936:11)
      at performWorkOnRoot (node_modules/react-dom/cjs/react-dom-client.development.js:14462:44)
      at performWorkOnRootViaSchedulerTask (node_modules/react-dom/cjs/react-dom-client.development.js:16216:7)
      at flushActQueue (node_modules/react/cjs/react.development.js:566:34)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (node_modules/react/cjs/react.development.js:860:10)
      at node_modules/@testing-library/react/dist/act-compat.js:47:25
      at renderRoot (node_modules/@testing-library/react/dist/pure.js:190:26)
      at render (node_modules/@testing-library/react/dist/pure.js:292:10)
      at Object.<anonymous> (src/components/achievement/__tests__/AchievementNotification.test.tsx:113:11)
      at TestScheduler.scheduleTests (node_modules/@jest/core/build/TestScheduler.js:333:13)
      at runJest (node_modules/@jest/core/build/runJest.js:404:19)
      at _run10000 (node_modules/@jest/core/build/cli/index.js:320:7)
      at runCLI (node_modules/@jest/core/build/cli/index.js:173:3)

  ● AchievementNotification › displays celebration particles

    useAccessibility must be used within an AccessibilityProvider

    [0m [90m 246 |[39m   [36mconst[39m context [33m=[39m useContext([33mAccessibilityContext[39m)[33m;[39m
     [90m 247 |[39m   [36mif[39m ([33m![39mcontext) {
    [31m[1m>[22m[39m[90m 248 |[39m     [36mthrow[39m [36mnew[39m [33mError[39m(
     [90m     |[39m           [31m[1m^[22m[39m
     [90m 249 |[39m       [32m'useAccessibility must be used within an AccessibilityProvider'[39m
     [90m 250 |[39m     )[33m;[39m
     [90m 251 |[39m   }[0m

      at useAccessibility (src/contexts/AccessibilityContext.tsx:248:11)
      at AchievementNotification (src/components/achievement/AchievementNotification.tsx:23:54)
      at Object.react_stack_bottom_frame (node_modules/react-dom/cjs/react-dom-client.development.js:23863:20)
      at renderWithHooks (node_modules/react-dom/cjs/react-dom-client.development.js:5529:22)
      at updateFunctionComponent (node_modules/react-dom/cjs/react-dom-client.development.js:8897:19)
      at beginWork (node_modules/react-dom/cjs/react-dom-client.development.js:10522:18)
      at runWithFiberInDEV (node_modules/react-dom/cjs/react-dom-client.development.js:1522:13)
      at performUnitOfWork (node_modules/react-dom/cjs/react-dom-client.development.js:15140:22)
      at workLoopSync (node_modules/react-dom/cjs/react-dom-client.development.js:14956:41)
      at renderRootSync (node_modules/react-dom/cjs/react-dom-client.development.js:14936:11)
      at performWorkOnRoot (node_modules/react-dom/cjs/react-dom-client.development.js:14462:44)
      at performWorkOnRootViaSchedulerTask (node_modules/react-dom/cjs/react-dom-client.development.js:16216:7)
      at flushActQueue (node_modules/react/cjs/react.development.js:566:34)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (node_modules/react/cjs/react.development.js:860:10)
      at node_modules/@testing-library/react/dist/act-compat.js:47:25
      at renderRoot (node_modules/@testing-library/react/dist/pure.js:190:26)
      at render (node_modules/@testing-library/react/dist/pure.js:292:10)
      at Object.<anonymous> (src/components/achievement/__tests__/AchievementNotification.test.tsx:133:11)
      at TestScheduler.scheduleTests (node_modules/@jest/core/build/TestScheduler.js:333:13)
      at runJest (node_modules/@jest/core/build/runJest.js:404:19)
      at _run10000 (node_modules/@jest/core/build/cli/index.js:320:7)
      at runCLI (node_modules/@jest/core/build/cli/index.js:173:3)

Test Suites: 1 failed, 1 total
Tests:       7 failed, 7 total
Snapshots:   0 total
Time:        1.42 s, estimated 4 s
Ran all test suites matching /components\\achievement\\__tests__/i.

```

#### Output
```

> frontend@0.1.0 test
> react-scripts test --watchAll=false --passWithNoTests --testPathPattern=components/achievement/__tests__ --watchAll=false --verbose


```

### Progress Component Tests
Status: ❌ FAILED

#### Error Details
```
FAIL src/components/progress/__tests__/ParentProgressInterface.test.tsx
  ● Test suite failed to run

    Cannot find module 'react-router-dom' from 'src/components/progress/__tests__/ParentProgressInterface.test.tsx'

    [0m [90m 1 |[39m [36mimport[39m [33mReact[39m [36mfrom[39m [32m'react'[39m[33m;[39m
     [90m 2 |[39m [36mimport[39m { render[33m,[39m screen } [36mfrom[39m [32m'@testing-library/react'[39m[33m;[39m
    [31m[1m>[22m[39m[90m 3 |[39m [36mimport[39m { [33mBrowserRouter[39m } [36mfrom[39m [32m'react-router-dom'[39m[33m;[39m
     [90m   |[39m [31m[1m^[22m[39m
     [90m 4 |[39m [36mimport[39m [33mParentProgressInterface[39m [36mfrom[39m [32m'../ParentProgressInterface'[39m[33m;[39m
     [90m 5 |[39m [36mimport[39m { [33mAuthContext[39m } [36mfrom[39m [32m'../../../contexts/AuthContext'[39m[33m;[39m
     [90m 6 |[39m[0m

      at Resolver.resolveModule (node_modules/jest-resolve/build/resolver.js:324:11)
      at Object.<anonymous> (src/components/progress/__tests__/ParentProgressInterface.test.tsx:3:1)
      at TestScheduler.scheduleTests (node_modules/@jest/core/build/TestScheduler.js:333:13)
      at runJest (node_modules/@jest/core/build/runJest.js:404:19)
      at _run10000 (node_modules/@jest/core/build/cli/index.js:320:7)
      at runCLI (node_modules/@jest/core/build/cli/index.js:173:3)

Test Suites: 1 failed, 1 total
Tests:       0 total
Snapshots:   0 total
Time:        1.21 s
Ran all test suites matching /components\\progress\\__tests__/i.

```

#### Output
```

> frontend@0.1.0 test
> react-scripts test --watchAll=false --passWithNoTests --testPathPattern=components/progress/__tests__ --watchAll=false --verbose


```

## Recommendations

Based on the test results, here are the main issues to fix:

1. **Mock Configuration Issues**: Many tests fail due to incorrect service mocking
2. **Component Structure Changes**: Tests expect different DOM structure than actual components
3. **Missing Dependencies**: Some test utilities or setup files may be missing
4. **API Mismatches**: Tests use outdated API calls that don't match current implementation

## Next Steps

1. Fix service mocking in test files
2. Update test expectations to match current component structure  
3. Review and update test setup configuration
4. Align test API calls with current service implementations
